/**
 * Loader de proyecto · Fase 1 plataforma F&B (v4.1.1)
 * --------------------------------------------------
 * Lee `?proyecto=<id>` (default: 'miramar') y carga los JSON del
 * proyecto en paralelo. Devuelve un objeto con la forma:
 *   { id, config, establecimiento, eventos, menus, recetas,
 *     dietas, productos, bebidas, extras }
 *
 * window.loadProject(id?, { keys? })
 *   - id (opcional): fuerza un proyecto; si se omite se lee de la URL.
 *   - keys (opcional): subconjunto de secciones a cargar.
 *     Default: todas. Útil para no descargar JSONs que la página no usa.
 *
 * Seguridad: el id se valida contra /^[a-z0-9_-]+$/ para impedir
 * path traversal (`?proyecto=../foo` se ignora y cae al default).
 *
 * UX helpers (banner global):
 *   window.showLoadingBanner(msg) · window.hideLoadingBanner()
 *   window.showErrorBanner(msg)
 */
(function () {
  'use strict';

  const DEFAULT_PROJECT_ID = 'miramar';
  const VALID_ID_RE = /^[a-z0-9_-]+$/;

  function getProjectIdFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('proyecto');
      if (!raw) return DEFAULT_PROJECT_ID;
      return VALID_ID_RE.test(raw) ? raw : DEFAULT_PROJECT_ID;
    } catch (e) {
      return DEFAULT_PROJECT_ID;
    }
  }

  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    return '../';
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar ' + url + ': ' + res.status);
    return res.json();
  }

  async function fetchJsonOptional(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  const SECTIONS = {
    config:         { fn: fetchJson,         file: 'config.json' },
    establecimiento:{ fn: fetchJson,         file: 'establecimiento.json' },
    eventos:        { fn: fetchJson,         file: 'eventos.json' },
    menus:          { fn: fetchJson,         file: 'menus.json' },
    recetas:        { fn: fetchJson,         file: 'recetas.json' },
    dietas:         { fn: fetchJson,         file: 'dietas.json' },
    productos:      { fn: fetchJsonOptional, file: 'productos.json' },
    bebidas:        { fn: fetchJsonOptional, file: 'bebidas.json' },
    extras:         { fn: fetchJsonOptional, file: 'extras.json' },
  };

  async function loadProject(id, opts) {
    const projectId = id || getProjectIdFromURL();
    const base = getRepoBase() + 'projects/' + projectId + '/';
    const keys = (opts && Array.isArray(opts.keys) && opts.keys.length)
      ? opts.keys.filter(k => k in SECTIONS)
      : Object.keys(SECTIONS);

    const entries = await Promise.all(keys.map(async k => {
      const { fn, file } = SECTIONS[k];
      return [k, await fn(base + file)];
    }));

    const out = { id: projectId };
    for (const [k, v] of entries) out[k] = v;
    return out;
  }

  // ── UX helpers ─────────────────────────────────────────────────
  const BANNER_ID = '__loader_banner__';
  const BANNER_BASE = 'position:fixed;top:0;left:0;right:0;text-align:center;' +
    'padding:8px 16px;font:13px/1.4 system-ui,sans-serif;letter-spacing:.5px;' +
    'z-index:99999;border-bottom:1px solid;';

  function showLoadingBanner(msg) {
    let el = document.getElementById(BANNER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = BANNER_ID;
      document.body.appendChild(el);
    }
    el.style.cssText = BANNER_BASE + 'background:#0a1228;color:#c9a84c;border-color:#3a4566;';
    el.textContent = msg || 'Cargando…';
    return el;
  }
  function hideLoadingBanner() {
    const el = document.getElementById(BANNER_ID);
    if (el) el.remove();
  }
  function showErrorBanner(msg) {
    let el = document.getElementById(BANNER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = BANNER_ID;
      document.body.appendChild(el);
    }
    el.style.cssText = BANNER_BASE + 'background:#3a0a0a;color:#ff8a8a;border-color:#ff8a8a;';
    el.textContent = '⚠ ' + (msg || 'Error cargando proyecto');
    return el;
  }

  window.loadProject = loadProject;
  window.showLoadingBanner = showLoadingBanner;
  window.hideLoadingBanner = hideLoadingBanner;
  window.showErrorBanner = showErrorBanner;
})();
