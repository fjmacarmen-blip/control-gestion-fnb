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
    SESSION_TTL_MS,
  };
})();
