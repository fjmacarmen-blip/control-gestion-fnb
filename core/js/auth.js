/**
 * Auth client-side · Fase 3.A plataforma F&B (v4.3)
 * --------------------------------------------------
 * Soft auth: bcrypt en navegador contra hashes en repo (auth.json).
 * Aceptado como trade-off (ADR §3 D7): si un cliente malicioso
 * inspecciona el código puede en teoría hacer brute-force offline
 * del hash. Suficiente para portfolio/demo y clientes confiables.
 *
 * Dependencia: bcryptjs UMD vía CDN — debe estar cargado antes que
 * este script (window.dcodeIO?.bcrypt o window.bcrypt según versión).
 *
 * Sesión: JWT-like sin firma, en sessionStorage. Caduca a las 8 h.
 * No es seguridad real, es UX (decirle al UI «hay un user logueado»).
 *
 * GitHub PAT (Fase 3.C, ADR §10.2 → docs/adr/011-pat-sessionstorage.md):
 * vive también en sessionStorage (no localStorage) para minimizar
 * persistencia. Funciones helpers: setPAT / getPAT / clearPAT.
 */
(function () {
  'use strict';

  const SESSION_KEY = 'fnb_session';
  const PAT_KEY     = 'fnb_pat';
  const FRESH_KEY   = 'fnb_fresh_auth';   // timestamp ISO de la última re-verify
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas
  const FRESH_TTL_MS   = 5 * 60 * 1000;      // 5 minutos · ventana de "fresh auth" tras login

  // ── bcrypt wrapper (UMD varía entre versiones) ─────────────────
  function getBcrypt() {
    if (typeof window === 'undefined') return null;
    if (window.dcodeIO && window.dcodeIO.bcrypt) return window.dcodeIO.bcrypt;
    if (window.bcrypt) return window.bcrypt;
    return null;
  }

  async function hashPassword(plain, rounds) {
    const bcrypt = getBcrypt();
    if (!bcrypt) throw new Error('bcryptjs no cargado · incluir el CDN antes que auth.js');
    return bcrypt.hash(plain, rounds || 10);
  }

  async function verifyPassword(plain, hash) {
    const bcrypt = getBcrypt();
    if (!bcrypt) throw new Error('bcryptjs no cargado · incluir el CDN antes que auth.js');
    if (!plain || !hash) return false;
    try {
      return await bcrypt.compare(plain, hash);
    } catch (e) {
      console.error('verifyPassword error:', e);
      return false;
    }
  }

  // ── Sesión (UX, no seguridad) ──────────────────────────────────
  function setSession(user, scope) {
    const session = {
      user: user,
      scope: scope || 'super-admin',
      iat: Date.now(),
      exp: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.exp || Date.now() > s.exp) {
        clearSession();
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ── Fresh auth (re-verify password en acciones destructivas) ──
  function markFreshAuth() {
    try {
      sessionStorage.setItem(FRESH_KEY, String(Date.now()));
    } catch (e) {}
  }
  function isFreshAuth(maxAgeMs) {
    try {
      const t = Number(sessionStorage.getItem(FRESH_KEY) || 0);
      if (!t) return false;
      return (Date.now() - t) < (maxAgeMs || FRESH_TTL_MS);
    } catch (e) { return false; }
  }
  function clearFreshAuth() {
    sessionStorage.removeItem(FRESH_KEY);
  }

  // ── GitHub PAT (sessionStorage) ────────────────────────────────
  function setPAT(pat) {
    if (!pat) { clearPAT(); return; }
    sessionStorage.setItem(PAT_KEY, pat);
  }
  function getPAT() {
    return sessionStorage.getItem(PAT_KEY) || null;
  }
  function clearPAT() {
    sessionStorage.removeItem(PAT_KEY);
  }

  // ── Helpers para login contra auth.json del dashboard ─────────
  /**
   * Login contra dashboard/auth.json (super-admin global).
   * authPath: ruta al auth.json relativa a la página llamante.
   * Retorna { ok, user?, error? }.
   */
  async function loginSuperAdmin(email, password, authPath) {
    try {
      // cache: 'no-store' · cierre auditoría A3 (v4.15) — si la password se
      // rota, no queremos que el navegador siga aceptando la versión vieja
      // cacheada por HTTP. Coherente con el re-verify modal.
      const res = await fetch(authPath, { cache: 'no-store' });
      if (!res.ok) return { ok: false, error: 'No se pudo leer auth.json (' + res.status + ')' };
      const data = await res.json();
      const users = (data && data.users) || [];
      const user = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
      if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' };
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return { ok: false, error: 'Usuario o contraseña incorrectos' };
      setSession({ email: user.email, name: user.name || user.email }, user.scope || 'super-admin');
      markFreshAuth();
      return { ok: true, user };
    } catch (e) {
      console.error('loginSuperAdmin error:', e);
      return { ok: false, error: 'Error inesperado: ' + e.message };
    }
  }

  // ── Sanitizado defensivo · cierre auditoría C3 (v4.15) ────────
  // Los modales reciben opts.title / opts.description que históricamente
  // se interpolaban en innerHTML sin escape. Aunque hoy los callers son
  // confiables, dejamos la API endurecida para evitar XSS si en el futuro
  // alguien pasa datos del proyecto sin sanear.
  function escapeText(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Modal de PAT ───────────────────────────────────────────────
  /**
   * Abre un modal in-page pidiendo el PAT al usuario. Devuelve una
   * Promise<{ok: bool, pat?: string, error?: string}>.
   * Si fnbGitHub está disponible, valida el PAT contra el repo antes
   * de aceptar. Si no, solo lo guarda.
   *
   * El modal se inyecta en document.body, NO requiere preexistir.
   *
   * Seguridad (v4.15): opts.title y opts.description SE ESCAPAN antes de
   * inyectar. Si necesitas HTML rico, usa opts.descriptionHtml (uso
   * restringido — solo cuando el caller controla 100% el contenido).
   */
  function promptForPAT(opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      // Limpiar modal previo si quedó
      const prev = document.getElementById('__patModal__');
      if (prev) prev.remove();

      const safeTitle = escapeText(opts.title || 'Necesitas un Personal Access Token');
      const safeDesc = opts.descriptionHtml
        || (opts.description
            ? escapeText(opts.description)
            : 'Para publicar cambios al repo, pega un PAT con scope <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:\'JetBrains Mono\',monospace;font-size:11px;">repo</code>. Vive solo en esta pestaña (sessionStorage) y se borra al cerrar.');

      const overlay = document.createElement('div');
      overlay.id = '__patModal__';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,17,23,.85);backdrop-filter:blur(6px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;';
      overlay.innerHTML = `
        <div style="background:#161b22;border:1px solid #30363d;border-radius:14px;width:100%;max-width:520px;padding:28px 26px;box-shadow:0 24px 60px rgba(0,0,0,.6);color:#e6edf3;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#34d399;margin-bottom:8px;">GitHub Access</div>
          <h2 style="font-size:22px;font-weight:600;line-height:1.2;margin-bottom:6px;">${safeTitle}</h2>
          <p style="font-size:13px;color:#8b949e;line-height:1.55;margin-bottom:18px;">
            ${safeDesc}
          </p>
          <p style="font-size:12px;color:#8b949e;margin-bottom:14px;">
            <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener" style="color:#34d399;text-decoration:underline;">Crear un PAT en GitHub →</a>
          </p>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
            <label style="font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;">Personal Access Token</label>
            <input type="password" id="__patInput__" autocomplete="off" spellcheck="false" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="background:#21262d;border:1px solid #30363d;color:#e6edf3;padding:10px 13px;border-radius:7px;font-family:'JetBrains Mono',monospace;font-size:13px;">
            <div style="font-size:11px;color:#6e7681;display:flex;justify-content:space-between;">
              <span>Pega solo el token, no incluyas «Bearer» ni espacios.</span>
              <label style="display:flex;gap:6px;align-items:center;cursor:pointer;"><input type="checkbox" id="__patShow__"> mostrar</label>
            </div>
          </div>
          <div id="__patErr__" style="display:none;background:rgba(248,81,73,.1);border:1px solid rgba(248,81,73,.35);color:#f85149;padding:9px 12px;border-radius:7px;font-size:12px;margin-bottom:14px;line-height:1.45;"></div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="__patCancel__" style="padding:10px 18px;border-radius:8px;border:1px solid #30363d;background:#21262d;color:#8b949e;font:inherit;font-size:13px;cursor:pointer;">Cancelar</button>
            <button id="__patOk__" style="padding:10px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#34d399 0%,#059669 100%);color:#0d1117;font:inherit;font-size:13px;font-weight:600;cursor:pointer;">Validar y guardar</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const input = overlay.querySelector('#__patInput__');
      const showCb = overlay.querySelector('#__patShow__');
      const err = overlay.querySelector('#__patErr__');
      const okBtn = overlay.querySelector('#__patOk__');
      const cancelBtn = overlay.querySelector('#__patCancel__');
      setTimeout(() => input.focus(), 50);

      showCb.addEventListener('change', () => { input.type = showCb.checked ? 'text' : 'password'; });

      function close(result) {
        overlay.remove();
        resolve(result);
      }
      function fail(msg) {
        err.textContent = msg;
        err.style.display = '';
        okBtn.disabled = false;
        okBtn.textContent = 'Validar y guardar';
      }

      cancelBtn.addEventListener('click', () => close({ ok: false, error: 'Cancelado' }));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close({ ok: false, error: 'Cancelado' }); });

      okBtn.addEventListener('click', async () => {
        const value = input.value.trim();
        if (!value) { fail('Pega el token primero'); return; }
        if (!/^[A-Za-z0-9_-]{20,}$/.test(value)) { fail('Formato inválido (debe empezar por ghp_ o github_pat_…)'); return; }
        okBtn.disabled = true; okBtn.textContent = 'Validando…';
        // Guardamos antes de validar para que fnbGitHub use este PAT en su check
        setPAT(value);
        if (window.fnbGitHub && window.fnbGitHub.validatePAT) {
          const v = await window.fnbGitHub.validatePAT(value);
          if (!v.ok) { clearPAT(); fail(v.error || 'No válido'); return; }
        }
        close({ ok: true, pat: value });
      });

      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') okBtn.click(); });
    });
  }

  // ── Modal de re-verificación de password ───────────────────────
  /**
   * Pide la password al usuario, la verifica contra dashboard/auth.json
   * y si es correcta ejecuta el callback. Si la sesión está "fresh"
   * (acaba de hacer login o re-verify hace <5 min), salta el prompt.
   *
   * @param {Function} callback  Función async a ejecutar tras verify
   * @param {Object} opts
   *   - title:       título del modal
   *   - description: HTML descriptivo
   *   - actionLabel: texto del botón primario (default «Confirmar»)
   *   - bypassFresh: si true, ignora el fresh window y siempre prompt
   *   - authPath:    ruta a auth.json (default '../dashboard/auth.json'
   *                  asume que estamos en /dashboard/ o /core/pages/)
   * @returns Promise con el resultado del callback, o { cancelled: true }
   */
  async function promptPasswordAndExecute(callback, opts) {
    opts = opts || {};
    const session = getSession();
    if (!session) return { ok: false, error: 'Sin sesión activa' };

    // Si la sesión es fresh y no se fuerza bypass, ejecutamos directamente
    if (!opts.bypassFresh && isFreshAuth()) {
      return callback();
    }

    return new Promise((resolve) => {
      const prev = document.getElementById('__verifyModal__');
      if (prev) prev.remove();

      const overlay = document.createElement('div');
      overlay.id = '__verifyModal__';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,17,23,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;';
      // Sanitizado · cierre auditoría C3 (v4.15)
      const safeTitle = escapeText(opts.title || 'Confirma tu identidad');
      const safeDesc = opts.descriptionHtml
        || (opts.description
            ? escapeText(opts.description)
            : 'Antes de ejecutar esta acción destructiva, vuelve a teclear la password para confirmar.');
      const safeActionLabel = escapeText(opts.actionLabel || 'Confirmar y continuar');
      const actionLabel = opts.actionLabel || 'Confirmar y continuar';
      const safeEmail = escapeText(session.user && session.user.email ? session.user.email : '—');
      overlay.innerHTML = `
        <div style="background:#161b22;border:1px solid #30363d;border-radius:14px;width:100%;max-width:480px;padding:28px 26px;box-shadow:0 24px 60px rgba(0,0,0,.6);color:#e6edf3;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a78bfa;margin-bottom:8px;">Verificación de identidad</div>
          <h2 style="font-size:22px;font-weight:600;line-height:1.2;margin-bottom:6px;">${safeTitle}</h2>
          <p style="font-size:13px;color:#8b949e;line-height:1.55;margin-bottom:16px;">${safeDesc}</p>
          <p style="font-size:11px;color:#6e7681;margin-bottom:14px;">Sesión: <strong style="color:#e6edf3;">${safeEmail}</strong></p>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
            <label style="font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;">Password</label>
            <input type="password" id="__verifyInput__" autocomplete="current-password" placeholder="Tu password actual" style="background:#21262d;border:1px solid #30363d;color:#e6edf3;padding:10px 13px;border-radius:7px;font-size:13px;">
          </div>
          <div id="__verifyErr__" style="display:none;background:rgba(248,81,73,.1);border:1px solid rgba(248,81,73,.35);color:#f85149;padding:9px 12px;border-radius:7px;font-size:12px;margin-bottom:14px;line-height:1.45;"></div>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="__verifyCancel__" style="padding:10px 18px;border-radius:8px;border:1px solid #30363d;background:#21262d;color:#8b949e;font:inherit;font-size:13px;cursor:pointer;">Cancelar</button>
            <button id="__verifyOk__" style="padding:10px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#a78bfa 0%,#7c3aed 100%);color:#0d1117;font:inherit;font-size:13px;font-weight:600;cursor:pointer;">${safeActionLabel}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      const input = overlay.querySelector('#__verifyInput__');
      const err = overlay.querySelector('#__verifyErr__');
      const okBtn = overlay.querySelector('#__verifyOk__');
      const cancelBtn = overlay.querySelector('#__verifyCancel__');
      setTimeout(() => input.focus(), 50);

      function close() { overlay.remove(); }
      function fail(msg) {
        err.textContent = msg;
        err.style.display = '';
        okBtn.disabled = false;
        okBtn.textContent = actionLabel;
      }

      cancelBtn.addEventListener('click', () => {
        close();
        resolve({ ok: false, cancelled: true });
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { close(); resolve({ ok: false, cancelled: true }); }
      });

      okBtn.addEventListener('click', async () => {
        const pw = input.value;
        if (!pw) { fail('Escribe la password'); return; }
        okBtn.disabled = true;
        okBtn.textContent = 'Verificando…';

        // Determinar ruta de auth.json relativa a la página actual
        let authPath = opts.authPath;
        if (!authPath) {
          // Si estamos en /dashboard/, es 'auth.json'. Si en /core/pages/, es '../../dashboard/auth.json'.
          const path = location.pathname;
          if (path.includes('/dashboard/')) authPath = 'auth.json';
          else if (path.includes('/core/pages/')) authPath = '../../dashboard/auth.json';
          else authPath = 'dashboard/auth.json';
        }

        try {
          const res = await fetch(authPath, { cache: 'no-store' });
          if (!res.ok) { fail('No se pudo leer auth.json (' + res.status + ')'); return; }
          const data = await res.json();
          const users = (data && data.users) || [];
          const user = users.find(u =>
            (u.email || '').toLowerCase() === (session.user && session.user.email || '').toLowerCase()
          );
          if (!user) { fail('Usuario de la sesión ya no existe en auth.json'); return; }
          const valid = await verifyPassword(pw, user.passwordHash);
          if (!valid) { fail('Password incorrecta'); return; }

          // Verify OK: marcar fresh + ejecutar callback
          markFreshAuth();
          close();
          try {
            const result = await callback();
            resolve(result);
          } catch (e) {
            resolve({ ok: false, error: 'Excepción del callback: ' + e.message });
          }
        } catch (e) {
          fail('Error inesperado: ' + e.message);
        }
      });

      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') okBtn.click(); });
    });
  }

  // ── Wizard guiado de PAT · v5.8 (B1 blocker pre-piloto) ───────
  /**
   * Onboarding asistido del Personal Access Token. Sustituye al modal
   * simple promptForPAT() en el primer uso del cliente. Tres pasos:
   *
   *   1. Bienvenida — explica qué es un PAT en una frase y por qué se
   *      necesita. Sin jerga ("token", "scope") en primer plano.
   *   2. Crear PAT — botón que abre github.com/settings/tokens/new con
   *      la descripción y el scope `repo` pre-rellenados. El usuario
   *      pulsa "Generate" en GitHub y vuelve a la pestaña.
   *   3. Pegar y validar — input, validación real contra el repo (GET
   *      /repos/owner/repo), guardado en sessionStorage si pasa.
   *
   * El modal recuerda el paso en el que está si el usuario lo cierra
   * sin cancelar explícitamente (mediante sessionStorage clave fnb_pat_step).
   *
   * Diseño: el wizard NO obliga al usuario a leer un PDF, ni a ver un
   * vídeo. Es la mínima cantidad de fricción que aún explica lo que
   * está pasando.
   *
   * @returns Promise<{ok, pat?, error?, cancelled?}>
   */
  function promptForPATGuided(opts) {
    opts = opts || {};
    const STEP_KEY = 'fnb_pat_step';
    return new Promise((resolve) => {
      const prev = document.getElementById('__patWizard__');
      if (prev) prev.remove();

      const { owner, repo } = (window.fnbGitHub && window.fnbGitHub.getRepoIdentity)
        ? window.fnbGitHub.getRepoIdentity()
        : { owner: 'tu-cuenta', repo: 'tu-repo' };

      // URL de GitHub con scope `repo` y descripción pre-rellenados.
      // Acelera al usuario: sólo pulsa "Generate token" abajo en GitHub.
      const patUrl = 'https://github.com/settings/tokens/new'
        + '?scopes=repo'
        + '&description=' + encodeURIComponent('Plataforma F&B · ' + repo);

      let step = Number(sessionStorage.getItem(STEP_KEY) || 1);
      if (step < 1 || step > 3) step = 1;

      const overlay = document.createElement('div');
      overlay.id = '__patWizard__';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,17,23,.88);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;';
      overlay.innerHTML = `
        <div style="background:#161b22;border:1px solid #30363d;border-radius:16px;width:100%;max-width:560px;padding:30px 28px;box-shadow:0 28px 70px rgba(0,0,0,.65);color:#e6edf3;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#34d399;">Conectar con GitHub</div>
            <div style="display:flex;gap:6px;" aria-label="Progreso">
              <span class="__step__" data-i="1" style="width:22px;height:4px;border-radius:2px;background:#30363d;"></span>
              <span class="__step__" data-i="2" style="width:22px;height:4px;border-radius:2px;background:#30363d;"></span>
              <span class="__step__" data-i="3" style="width:22px;height:4px;border-radius:2px;background:#30363d;"></span>
            </div>
          </div>

          <!-- PASO 1 · Bienvenida -->
          <div class="__panel__" data-step="1" style="display:none;">
            <h2 style="font-size:24px;font-weight:600;line-height:1.2;margin-bottom:10px;">Conecta esta plataforma con tu repositorio</h2>
            <p style="font-size:14px;color:#8b949e;line-height:1.6;margin-bottom:16px;">
              Para guardar tus cambios online, la plataforma necesita un permiso de GitHub.
              Es como una llave personal que solo tú generas y que vive únicamente en este navegador.
              Cuando cierres la pestaña, la llave desaparece.
            </p>
            <ul style="font-size:13px;color:#8b949e;line-height:1.7;padding-left:20px;margin-bottom:22px;">
              <li>El proceso dura <strong style="color:#e6edf3;">menos de 2 minutos</strong>.</li>
              <li>Lo haces <strong style="color:#e6edf3;">una sola vez por sesión</strong>.</li>
              <li>Solo afecta a tu repo <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:'JetBrains Mono',monospace;font-size:11.5px;">${escapeText(owner)}/${escapeText(repo)}</code>, no a otros.</li>
            </ul>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
              <button class="__cancel__" style="padding:11px 19px;border-radius:8px;border:1px solid #30363d;background:#21262d;color:#8b949e;font:inherit;font-size:13px;cursor:pointer;">Ahora no</button>
              <button class="__next__" style="padding:11px 22px;border-radius:8px;border:none;background:linear-gradient(135deg,#34d399 0%,#059669 100%);color:#0d1117;font:inherit;font-size:13px;font-weight:600;cursor:pointer;">Empezar →</button>
            </div>
          </div>

          <!-- PASO 2 · Crear PAT -->
          <div class="__panel__" data-step="2" style="display:none;">
            <h2 style="font-size:24px;font-weight:600;line-height:1.2;margin-bottom:10px;">Crea la llave en GitHub</h2>
            <p style="font-size:14px;color:#8b949e;line-height:1.6;margin-bottom:14px;">
              Pulsa el botón. Se abre GitHub en otra pestaña con el formulario casi listo.
              Solo tienes que <strong style="color:#e6edf3;">pulsar «Generate token» abajo del todo</strong>,
              copiar el código verde que aparece, y volver aquí.
            </p>
            <div style="background:#0d1117;border:1px solid #21262d;border-radius:10px;padding:16px 18px;margin-bottom:18px;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;margin-bottom:8px;">Lo que GitHub te preguntará</div>
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:#c9d1d9;">
                <div>· <strong style="color:#34d399;">Note:</strong> Plataforma F&amp;B · ${escapeText(repo)} <span style="color:#6e7681;">(ya rellenado)</span></div>
                <div>· <strong style="color:#34d399;">Scopes:</strong> <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:'JetBrains Mono',monospace;font-size:11.5px;">repo</code> <span style="color:#6e7681;">(ya marcado)</span></div>
                <div>· <strong style="color:#34d399;">Expiration:</strong> recomendado 30 días <span style="color:#6e7681;">(tú eliges)</span></div>
              </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:space-between;align-items:center;">
              <button class="__back__" style="padding:11px 16px;border-radius:8px;border:1px solid #30363d;background:transparent;color:#8b949e;font:inherit;font-size:13px;cursor:pointer;">← Atrás</button>
              <div style="display:flex;gap:10px;">
                <a class="__openGh__" href="${patUrl}" target="_blank" rel="noopener" style="padding:11px 22px;border-radius:8px;background:linear-gradient(135deg,#34d399 0%,#059669 100%);color:#0d1117;font:inherit;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;">Abrir GitHub ↗</a>
                <button class="__next__" style="padding:11px 22px;border-radius:8px;border:1px solid #30363d;background:transparent;color:#e6edf3;font:inherit;font-size:13px;font-weight:600;cursor:pointer;">Ya tengo el código →</button>
              </div>
            </div>
          </div>

          <!-- PASO 3 · Pegar y validar -->
          <div class="__panel__" data-step="3" style="display:none;">
            <h2 style="font-size:24px;font-weight:600;line-height:1.2;margin-bottom:10px;">Pega el código aquí</h2>
            <p style="font-size:14px;color:#8b949e;line-height:1.6;margin-bottom:14px;">
              Pega el token que GitHub te ha mostrado (empieza por <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:'JetBrains Mono',monospace;font-size:11px;">ghp_</code>
              o <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:'JetBrains Mono',monospace;font-size:11px;">github_pat_</code>).
              Lo validamos contra tu repo antes de guardarlo.
            </p>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
              <label style="font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6e7681;">Token de acceso</label>
              <input type="password" class="__input__" autocomplete="off" spellcheck="false" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="background:#21262d;border:1px solid #30363d;color:#e6edf3;padding:11px 14px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;">
              <div style="font-size:11px;color:#6e7681;display:flex;justify-content:space-between;">
                <span>Pega solo el código, sin espacios al inicio o final.</span>
                <label style="display:flex;gap:6px;align-items:center;cursor:pointer;"><input type="checkbox" class="__show__"> mostrar</label>
              </div>
            </div>
            <div class="__err__" style="display:none;background:rgba(248,81,73,.1);border:1px solid rgba(248,81,73,.35);color:#f85149;padding:10px 13px;border-radius:8px;font-size:12.5px;margin-bottom:14px;line-height:1.5;"></div>
            <div style="display:flex;gap:10px;justify-content:space-between;align-items:center;">
              <button class="__back__" style="padding:11px 16px;border-radius:8px;border:1px solid #30363d;background:transparent;color:#8b949e;font:inherit;font-size:13px;cursor:pointer;">← Atrás</button>
              <button class="__ok__" style="padding:11px 22px;border-radius:8px;border:none;background:linear-gradient(135deg,#34d399 0%,#059669 100%);color:#0d1117;font:inherit;font-size:13px;font-weight:600;cursor:pointer;">Validar y guardar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const panels = overlay.querySelectorAll('.__panel__');
      const steps = overlay.querySelectorAll('.__step__');
      const input = overlay.querySelector('.__input__');
      const showCb = overlay.querySelector('.__show__');
      const err = overlay.querySelector('.__err__');
      const okBtn = overlay.querySelector('.__ok__');

      function render() {
        panels.forEach(p => { p.style.display = Number(p.dataset.step) === step ? '' : 'none'; });
        steps.forEach(s => {
          const i = Number(s.dataset.i);
          s.style.background = i === step ? '#34d399' : (i < step ? '#0d4f3c' : '#30363d');
        });
        sessionStorage.setItem(STEP_KEY, String(step));
        if (step === 3) setTimeout(() => input && input.focus(), 60);
      }
      render();

      function close(result) {
        sessionStorage.removeItem(STEP_KEY);
        overlay.remove();
        resolve(result);
      }
      function fail(msg) {
        if (!err) return;
        err.textContent = msg;
        err.style.display = '';
        okBtn.disabled = false;
        okBtn.textContent = 'Validar y guardar';
      }

      overlay.querySelectorAll('.__next__').forEach(btn => {
        btn.addEventListener('click', () => { step++; if (step > 3) step = 3; render(); });
      });
      overlay.querySelectorAll('.__back__').forEach(btn => {
        btn.addEventListener('click', () => { step--; if (step < 1) step = 1; render(); });
      });
      overlay.querySelectorAll('.__cancel__').forEach(btn => {
        btn.addEventListener('click', () => close({ ok: false, cancelled: true }));
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close({ ok: false, cancelled: true });
      });
      if (showCb) showCb.addEventListener('change', () => { input.type = showCb.checked ? 'text' : 'password'; });

      if (okBtn) {
        okBtn.addEventListener('click', async () => {
          const value = (input.value || '').trim();
          if (!value) { fail('Pega el token primero'); return; }
          if (!/^(ghp_|github_pat_)[A-Za-z0-9_-]{20,}$/.test(value)) {
            fail('El formato no coincide. Debe empezar por ghp_ o github_pat_…');
            return;
          }
          okBtn.disabled = true; okBtn.textContent = 'Validando…';
          setPAT(value);
          if (window.fnbGitHub && window.fnbGitHub.validatePAT) {
            const v = await window.fnbGitHub.validatePAT(value);
            if (!v.ok) {
              clearPAT();
              fail(v.error || 'No válido — revisa que tenga el scope `repo` y que apunte a este repo.');
              return;
            }
          }
          close({ ok: true, pat: value });
        });
      }
      if (input) {
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') okBtn.click(); });
      }
    });
  }

  // Exports
  window.fnbAuth = {
    hashPassword,
    verifyPassword,
    setSession,
    getSession,
    clearSession,
    setPAT,
    getPAT,
    clearPAT,
    markFreshAuth,
    isFreshAuth,
    clearFreshAuth,
    loginSuperAdmin,
    promptForPAT,
    promptForPATGuided,
    promptPasswordAndExecute,
    SESSION_TTL_MS,
    FRESH_TTL_MS,
  };
})();
