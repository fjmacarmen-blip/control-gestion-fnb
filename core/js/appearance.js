/**
 * Appearance · v5.0 plataforma F&B
 * --------------------------------------------------
 * Toggle entre modo oscuro (default) y modo claro, con persistencia
 * en localStorage. El modo se aplica vía atributo
 * `data-appearance="light|dark"` en <html>.
 *
 * El default respeta `prefers-color-scheme` del SO si no hay preferencia
 * explícita guardada. Una vez el usuario toca el toggle, se persiste.
 *
 * API window.fnbAppearance:
 *   get()                → 'dark' | 'light'
 *   set(mode)            aplica + persiste
 *   toggle()             alterna
 *   injectToggle(el)     inyecta botón listo para usar en `el`
 */
(function () {
  'use strict';

  const KEY = 'fnb_appearance';
  const VALID = new Set(['dark', 'light']);

  function getSystemPref() {
    if (typeof matchMedia !== 'function') return 'dark';
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function read() {
    try {
      const v = localStorage.getItem(KEY);
      return VALID.has(v) ? v : null;
    } catch { return null; }
  }
  function write(mode) {
    try { localStorage.setItem(KEY, mode); } catch {}
  }

  function apply(mode) {
    if (!VALID.has(mode)) mode = 'dark';
    document.documentElement.setAttribute('data-appearance', mode);
    document.documentElement.dataset.appearanceApplied = mode;
    // Sincronizar meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#f8fafc' : '#0d1117');
  }

  function get() {
    return document.documentElement.getAttribute('data-appearance') || 'dark';
  }
  function set(mode) {
    apply(mode);
    write(mode);
  }
  function toggle() {
    set(get() === 'dark' ? 'light' : 'dark');
  }

  // Inicialización temprana (antes del paint si el script va en head)
  const stored = read();
  apply(stored || getSystemPref());

  // Sincronizar si cambia la preferencia del SO mientras no hay override
  if (typeof matchMedia === 'function') {
    matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', e => {
      if (read()) return; // si hay preferencia explícita, ignorar
      apply(e.matches ? 'light' : 'dark');
    });
  }

  function injectToggle(el) {
    if (!el) return null;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'appearance-toggle';
    btn.setAttribute('aria-label', 'Cambiar tema claro/oscuro');
    btn.title = 'Cambiar tema (modo claro/oscuro)';
    btn.style.cssText = 'background:transparent;border:1px solid var(--border-default);color:var(--text-soft);padding:7px 11px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;display:inline-flex;align-items:center;gap:6px;line-height:1;';
    function refresh() {
      btn.textContent = get() === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
    }
    btn.addEventListener('click', () => { toggle(); refresh(); });
    refresh();
    el.appendChild(btn);
    return btn;
  }

  window.fnbAppearance = { get, set, toggle, injectToggle };
})();
