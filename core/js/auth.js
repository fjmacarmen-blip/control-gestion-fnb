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
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

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
      const res = await fetch(authPath);
      if (!res.ok) return { ok: false, error: 'No se pudo leer auth.json (' + res.status + ')' };
      const data = await res.json();
      const users = (data && data.users) || [];
      const user = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
      if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' };
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return { ok: false, error: 'Usuario o contraseña incorrectos' };
      setSession({ email: user.email, name: user.name || user.email }, user.scope || 'super-admin');
      return { ok: true, user };
    } catch (e) {
      console.error('loginSuperAdmin error:', e);
      return { ok: false, error: 'Error inesperado: ' + e.message };
    }
  }

  // ── Modal de PAT ───────────────────────────────────────────────
  /**
   * Abre un modal in-page pidiendo el PAT al usuario. Devuelve una
   * Promise<{ok: bool, pat?: string, error?: string}>.
   * Si fnbGitHub está disponible, valida el PAT contra el repo antes
   * de aceptar. Si no, solo lo guarda.
   *
   * El modal se inyecta en document.body, NO requiere preexistir.
   */
  function promptForPAT(opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      // Limpiar modal previo si quedó
      const prev = document.getElementById('__patModal__');
      if (prev) prev.remove();

      const overlay = document.createElement('div');
      overlay.id = '__patModal__';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,17,23,.85);backdrop-filter:blur(6px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;';
      overlay.innerHTML = `
        <div style="background:#161b22;border:1px solid #30363d;border-radius:14px;width:100%;max-width:520px;padding:28px 26px;box-shadow:0 24px 60px rgba(0,0,0,.6);color:#e6edf3;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#34d399;margin-bottom:8px;">GitHub Access</div>
          <h2 style="font-size:22px;font-weight:600;line-height:1.2;margin-bottom:6px;">${opts.title || 'Necesitas un Personal Access Token'}</h2>
          <p style="font-size:13px;color:#8b949e;line-height:1.55;margin-bottom:18px;">
            ${opts.description || 'Para publicar cambios al repo, pega un PAT con scope <code style="background:#21262d;padding:1px 6px;border-radius:4px;color:#6ee7b7;font-family:\'JetBrains Mono\',monospace;font-size:11px;">repo</code>. Vive solo en esta pestaña (sessionStorage) y se borra al cerrar.'}
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
    loginSuperAdmin,
    promptForPAT,
    SESSION_TTL_MS,
  };
})();
