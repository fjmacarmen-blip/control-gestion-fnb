/**
 * Loader de proyecto · Fase 1 plataforma F&B
 * --------------------------------------------------
 * Lee `?proyecto=<id>` (default: 'miramar') y carga todos los JSON
 * del proyecto en paralelo. Devuelve un objeto con la forma:
 *   { id, config, establecimiento, eventos, menus, recetas,
 *     dietas, productos, bebidas, extras }
 *
 * El loader es agnóstico de UI: no toca el DOM. Cada HTML llama a
 * window.loadProject() en su init y reasigna sus variables locales.
 *
 * Resolución de paths de imagen:
 *   Algunos JSON guardan rutas con prefijo `evt:` o `plt:` (eventos
 *   vs. platos). El consumidor llama a window.resolveImg(path, bases)
 *   para sustituir el prefijo por la base concreta que use ese HTML.
 */
(function () {
  'use strict';

  const DEFAULT_PROJECT_ID = 'miramar';

  function getProjectIdFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('proyecto') || DEFAULT_PROJECT_ID;
    } catch (e) {
      return DEFAULT_PROJECT_ID;
    }
  }

  /**
   * Calcula el base path hacia el repo desde la página actual.
   * presupuesto-evento.html vive en /cliente/ → necesita '../'
   * recetario.html vive en /recetario/ → necesita '../'
   * Permitimos override por <meta name="project-base" content="..."> si hace falta.
   */
  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    // Por defecto, asumimos que la página vive en una subcarpeta inmediata del repo.
    return '../';
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`No se pudo cargar ${url}: ${res.status}`);
    return res.json();
  }

  async function fetchJsonOptional(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function loadProject(id) {
    const projectId = id || getProjectIdFromURL();
    const base = getRepoBase() + 'projects/' + projectId + '/';

    const [config, establecimiento, eventos, menus, recetas, dietas, productos, bebidas, extras] = await Promise.all([
      fetchJson(base + 'config.json'),
      fetchJson(base + 'establecimiento.json'),
      fetchJson(base + 'eventos.json'),
      fetchJson(base + 'menus.json'),
      fetchJson(base + 'recetas.json'),
      fetchJson(base + 'dietas.json'),
      fetchJsonOptional(base + 'productos.json'),
      fetchJsonOptional(base + 'bebidas.json'),
      fetchJsonOptional(base + 'extras.json'),
    ]);

    return {
      id: projectId,
      config,
      establecimiento,
      eventos,
      menus,
      recetas,
      dietas,
      productos,
      bebidas,
      extras,
    };
  }

  /**
   * Resuelve un path de imagen con prefijo "evt:" o "plt:" usando las
   * bases que pase el HTML llamante (que vive en una carpeta concreta y
   * sabe sus rutas relativas). Si no hay prefijo, devuelve el path tal cual.
   */
  function resolveImg(path, bases) {
    if (!path) return path;
    if (path.startsWith('evt:')) return (bases && bases.evt ? bases.evt : '') + path.slice(4);
    if (path.startsWith('plt:')) return (bases && bases.plt ? bases.plt : '') + path.slice(4);
    return path;
  }

  window.loadProject = loadProject;
  window.resolveImg = resolveImg;
})();
