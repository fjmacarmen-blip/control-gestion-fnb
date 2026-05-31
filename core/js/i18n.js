/**
 * i18n · v5.5 plataforma F&B
 * --------------------------------------------------
 * Sistema de internacionalización con dos idiomas: español (default)
 * e inglés. Diseño minimalista, sin dependencias.
 *
 * Cómo funciona:
 *  - Strings traducibles viven en core/i18n/{locale}.json
 *  - HTML marca elementos con data-i18n="clave.path" (cuerpo) o
 *    data-i18n-attr="placeholder:clave|title:clave2" (atributos)
 *  - JS puede usar window.fnbI18n.t('clave') en cualquier momento
 *  - Selector ES/EN inyectable en cualquier topbar
 *
 * Detección de idioma:
 *  1. localStorage.fnb_locale si existe (preferencia del usuario)
 *  2. navigator.language ('en-*' → 'en', resto → 'es')
 *  3. Fallback 'es'
 *
 * Eventos:
 *  - window dispatches 'i18n:change' cuando cambia el idioma
 *
 * API window.fnbI18n:
 *   setLocale(loc)       cambia idioma y aplica al DOM
 *   getLocale()          → 'es' | 'en'
 *   t(key, vars?)        traduce una clave · acepta vars {name: 'X'}
 *   applyTo(root?)       recorre el DOM y traduce data-i18n*
 *   injectSelector(host) inyecta toggle ES/EN compacto
 *   onChange(cb)         registra listener
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'fnb_locale';
  const SUPPORTED = ['es', 'en'];
  const DEFAULT = 'es';

  let currentLocale = null;
  let dictionaries = {}; // { es: {...}, en: {...} }
  const loadingPromises = {}; // dedupe carga concurrent
  const listeners = new Set();

  // ── Resolución del idioma inicial ─────────────────
  function detectInitialLocale() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch {}
    const nav = (navigator.language || 'es').toLowerCase();
    if (nav.startsWith('en')) return 'en';
    return DEFAULT;
  }

  // ── Path resolver para claves anidadas ────────────
  function resolveKey(obj, path) {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, k) => (acc && acc[k] != null) ? acc[k] : undefined, obj);
  }

  // ── Sustitución de variables {name} ───────────────
  function interpolate(str, vars) {
    if (typeof str !== 'string' || !vars) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : '{' + k + '}'));
  }

  // ── Detectar la ruta base del repo (similar a loader.js) ─
  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    // En core/pages/ el repo está dos niveles arriba
    if (location.pathname.includes('/core/pages/')) return '../../';
    // En dashboard/ el repo está un nivel arriba
    if (location.pathname.includes('/dashboard/')) return '../';
    return '';
  }

  // ── Carga de diccionario ──────────────────────────
  function loadLocale(loc) {
    if (dictionaries[loc]) return Promise.resolve(dictionaries[loc]);
    if (loadingPromises[loc]) return loadingPromises[loc];
    const url = getRepoBase() + 'core/i18n/' + loc + '.json';
    loadingPromises[loc] = fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(dict => { dictionaries[loc] = dict; return dict; })
      .catch(err => {
        console.warn('[i18n] No se pudo cargar', url, err);
        dictionaries[loc] = {};
        return {};
      });
    return loadingPromises[loc];
  }

  // ── Traducción ───────────────────────────────────
  function t(key, vars) {
    if (!key) return '';
    const dict = dictionaries[currentLocale] || {};
    let val = resolveKey(dict, key);
    if (val == null && currentLocale !== DEFAULT) {
      // Fallback al idioma default si tenemos su dict ya cargado
      val = resolveKey(dictionaries[DEFAULT] || {}, key);
    }
    if (val == null) return key; // Sin traducción · devolvemos la clave (visible para diagnóstico)
    return interpolate(val, vars);
  }

  // ── Aplicar al DOM ───────────────────────────────
  function applyTo(root) {
    root = root || document;
    // Textos: data-i18n="clave"
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = t(key);
      if (translated && translated !== key) el.textContent = translated;
    });
    // Atributos: data-i18n-attr="placeholder:clave|title:clave2|aria-label:clave3"
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split('|').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          const translated = t(key);
          if (translated && translated !== key) el.setAttribute(attr, translated);
        }
      });
    });
    // HTML interno (raro pero útil): data-i18n-html="clave"
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const translated = t(key);
      if (translated && translated !== key) el.innerHTML = translated;
    });
    // Actualizar lang del documento
    document.documentElement.setAttribute('lang', currentLocale);
  }

  // ── Cambio de idioma ─────────────────────────────
  async function setLocale(loc) {
    if (!SUPPORTED.includes(loc)) loc = DEFAULT;
    currentLocale = loc;
    try { localStorage.setItem(STORAGE_KEY, loc); } catch {}
    await loadLocale(loc);
    if (loc !== DEFAULT) await loadLocale(DEFAULT); // pre-cargar fallback
    applyTo();
    // Disparar evento + callbacks
    listeners.forEach(cb => { try { cb(loc); } catch (e) { console.error('[i18n]', e); } });
    window.dispatchEvent(new CustomEvent('i18n:change', { detail: { locale: loc } }));
  }

  function getLocale() { return currentLocale; }
  function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

  // ── Selector ES/EN compacto ───────────────────────
  function injectSelector(host) {
    if (!host) return null;
    if (host.querySelector('.i18n-toggle')) return host.querySelector('.i18n-toggle');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'i18n-toggle';
    btn.setAttribute('aria-label', 'Cambiar idioma');
    btn.title = 'Cambiar idioma · Change language';
    btn.style.cssText = 'background:transparent;border:1px solid currentColor;opacity:.7;padding:6px 11px;border-radius:8px;cursor:pointer;font:600 11px/1 inherit;letter-spacing:.5px;text-transform:uppercase;color:inherit;display:inline-flex;align-items:center;gap:6px;';
    function refresh() {
      btn.innerHTML = '<span style="opacity:.7">🌐</span> ' + (currentLocale === 'es' ? 'ES' : 'EN');
    }
    btn.addEventListener('click', () => {
      setLocale(currentLocale === 'es' ? 'en' : 'es');
      refresh();
    });
    onChange(refresh);
    refresh();
    host.appendChild(btn);
    return btn;
  }

  // ── Boot ─────────────────────────────────────────
  const initialLocale = detectInitialLocale();
  // Cargar diccionario en background; setLocale se completará tras la carga
  setLocale(initialLocale);

  window.fnbI18n = {
    setLocale,
    getLocale,
    t,
    applyTo,
    injectSelector,
    onChange,
    SUPPORTED,
    DEFAULT,
  };
})();
