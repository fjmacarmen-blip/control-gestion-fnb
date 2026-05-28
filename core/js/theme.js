/**
 * Theme applier · Frontend público de proyectos (v4.5)
 * --------------------------------------------------
 * Lee config.tema del proyecto activo y aplica
 * <html data-theme="<id>"> antes del primer render.
 *
 * Carga este script ANTES que loader.js para evitar FOUC.
 * Si no se encuentra config.json o el tema es desconocido, se cae
 * al default ('navy-boutique', el del piloto Miramar).
 */
(function () {
  'use strict';

  const VALID_THEMES = [
    'navy-boutique',
    'mediterraneo',
    'tipico-andaluz',
    'moderno-minimalista',
    'cercano-rustico',
  ];
  const DEFAULT_THEME = 'navy-boutique';

  function getProjectIdFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('proyecto');
      if (!raw) return 'miramar';
      return /^[a-z0-9_-]+$/.test(raw) ? raw : 'miramar';
    } catch (e) { return 'miramar'; }
  }

  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    return '../../';
  }

  function applyTheme(themeId) {
    const id = VALID_THEMES.includes(themeId) ? themeId : DEFAULT_THEME;
    document.documentElement.setAttribute('data-theme', id);
    document.documentElement.dataset.themeApplied = id;
  }

  /**
   * Setea un tema y persiste preview en sessionStorage (solo para el editor).
   * El frontend público lo lee del config.json del proyecto.
   */
  function previewTheme(themeId) {
    applyTheme(themeId);
    try { sessionStorage.setItem('fnb_theme_preview', themeId); } catch (e) {}
  }

  // Prioridad: ?tema= (query) > preview sessionStorage > config.json del proyecto > default
  let overrideActive = false;

  (function eagerApply() {
    try {
      const urlTheme = new URLSearchParams(window.location.search).get('tema');
      if (urlTheme && VALID_THEMES.includes(urlTheme)) {
        applyTheme(urlTheme);
        overrideActive = true;
        return;
      }
      const preview = sessionStorage.getItem('fnb_theme_preview');
      if (preview && VALID_THEMES.includes(preview)) {
        applyTheme(preview);
        overrideActive = true;
      }
    } catch (e) {}
  })();

  // Cache compartida del fetch de config.json para que loader.js y theme.js
  // no la pidan dos veces en el mismo arranque (alto #5 auditoría).
  // Mismo projectId → misma Promise. Otros consumidores (loader, metrics) hacen:
  //   await window.fnbTheme.getConfig(projectId)
  const configCache = new Map();
  function getConfig(projectId) {
    const id = projectId || getProjectIdFromURL();
    if (configCache.has(id)) return configCache.get(id);
    const url = getRepoBase() + 'projects/' + id + '/config.json';
    const promise = fetch(url)
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);
    configCache.set(id, promise);
    return promise;
  }
  function invalidateConfig(projectId) {
    if (projectId) configCache.delete(projectId);
    else configCache.clear();
  }

  // Carga config.json y aplica el tema definitivo si no hay override activo
  async function bootstrapThemeFromConfig() {
    if (overrideActive) return;
    const cfg = await getConfig();
    applyTheme((cfg && cfg.tema) || DEFAULT_THEME);
  }

  bootstrapThemeFromConfig();

  window.fnbTheme = {
    apply: applyTheme,
    preview: previewTheme,
    list: () => VALID_THEMES.slice(),
    getConfig,
    invalidateConfig,
    DEFAULT: DEFAULT_THEME,
  };
})();
