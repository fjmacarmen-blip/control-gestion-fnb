/**
 * Productos Connector · Fase 3.5.A.5 plataforma F&B (v4.11)
 * --------------------------------------------------
 * Abstracción sobre el catálogo de productos. Permite que cada proyecto
 * conecte su propio economato sin que el código cliente cambie. Ver
 * docs/adr/012-productos-conectores.md para el modelo completo.
 *
 * Tipos de source soportados:
 *   - static    items en el JSON del repo (default)
 *   - csv-url   GET CSV de URL pública (Google Sheets, etc.) + columnMapping
 *   - json-url  GET JSON de URL pública con array de items
 *   - api       (slot tipado · sin implementar · Fase 5+)
 *
 * API window.fnbProductos:
 *   loadProductos(projectId)            → { source, items, isCached, fromCache }
 *   syncProductos(projectId, opts?)     → { ok, items?, error? } (ignora cache)
 *   validateSource(source)              → { ok, error?, columnsDetected? }
 *   getCachedItems(projectId)           → items[] o null
 *   clearCache(projectId)
 *
 * Cache: localStorage key `fnb_productos_cache_<projectId>` con
 * { items, ts, source }. TTL configurable en source.refreshHours.
 */
(function () {
  'use strict';

  const CACHE_PREFIX = 'fnb_productos_cache_';
  const VALID_TYPES = ['static', 'csv-url', 'json-url', 'api'];

  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    return '../';
  }

  function cacheKey(projectId) { return CACHE_PREFIX + projectId; }

  function readCache(projectId) {
    try {
      const raw = localStorage.getItem(cacheKey(projectId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function writeCache(projectId, items, source) {
    try {
      localStorage.setItem(cacheKey(projectId), JSON.stringify({
        items, source, ts: new Date().toISOString(),
      }));
      return true;
    } catch (e) {
      console.warn('writeCache productos: quota?', e);
      return false;
    }
  }

  function clearCache(projectId) {
    localStorage.removeItem(cacheKey(projectId));
  }

  function getCachedItems(projectId) {
    const c = readCache(projectId);
    return c && c.items ? c.items : null;
  }

  // ── Fetchers por tipo ─────────────────────────────────────
  async function fetchJsonUrl(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    throw new Error('JSON sin array de items');
  }

  async function fetchCsvUrl(url, columnMapping) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();

    // PapaParse se carga vía importer-excel.js o lazy aquí
    if (!window.Papa) {
      if (window.fnbImporter && window.fnbImporter.ensureLibsLoaded) {
        await window.fnbImporter.ensureLibsLoaded();
      } else {
        throw new Error('PapaParse no disponible · incluir importer-excel.js');
      }
    }
    const result = window.Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
    if (result.errors && result.errors.length && !result.data.length) {
      throw new Error('CSV inválido: ' + result.errors[0].message);
    }
    return applyColumnMapping(result.data, columnMapping);
  }

  /**
   * Aplica columnMapping: { campo_destino: 'Nombre Columna CSV' }
   * Si no se da mapping, usa los nombres tal cual.
   */
  function applyColumnMapping(rows, mapping) {
    if (!mapping || !Object.keys(mapping).length) return rows;
    return rows.map(row => {
      const out = {};
      Object.entries(mapping).forEach(([destField, sourceCol]) => {
        let val = row[sourceCol];
        // Type coercion para campos numéricos comunes
        if (val != null && val !== '' && /precio|coste|cantidad|stock/.test(destField)) {
          const parsed = parseFloat(String(val).replace(',', '.').replace(/[^\d.-]/g, ''));
          if (isFinite(parsed)) val = parsed;
        }
        out[destField] = val;
      });
      return out;
    });
  }

  // ── API pública ───────────────────────────────────────────
  async function loadProductos(projectId) {
    // 1. Leer productos.json del repo (siempre, para tener source + items inline)
    const url = getRepoBase() + 'projects/' + projectId + '/productos.json';
    let repoData;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      repoData = await res.json();
    } catch (e) {
      console.warn('loadProductos: no se pudo leer productos.json del repo:', e);
      return { source: { type: 'static' }, items: [], isCached: false };
    }
    const source = repoData.source || { type: 'static' };
    const inlineItems = repoData.items || [];

    // 2. Si static, los items del JSON son la verdad
    if (source.type === 'static') {
      return { source, items: inlineItems, isCached: false };
    }

    // 3. Si remote, mirar cache primero
    const cache = readCache(projectId);
    if (cache && cache.items && cache.ts) {
      const ageMs = Date.now() - new Date(cache.ts).getTime();
      const ttlMs = (source.refreshHours || 24) * 3600 * 1000;
      if (ageMs < ttlMs) {
        return { source, items: cache.items, isCached: true, fromCache: 'fresh', cacheAge: ageMs };
      }
      // Cache stale: devolvemos pero marcamos
      return { source, items: cache.items, isCached: true, fromCache: 'stale', cacheAge: ageMs };
    }

    // 4. Sin cache, devolvemos los inline (último sync committeado) y dejamos al UI pedir sync
    return { source, items: inlineItems, isCached: false, fromCache: 'inline' };
  }

  async function syncProductos(projectId, opts) {
    opts = opts || {};
    const repoUrl = getRepoBase() + 'projects/' + projectId + '/productos.json';
    let source;
    try {
      const r = await fetch(repoUrl);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      source = opts.source || data.source || { type: 'static' };
    } catch (e) {
      return { ok: false, error: 'No se pudo leer productos.json: ' + e.message };
    }

    if (source.type === 'static') {
      return { ok: false, error: 'Source static no requiere sync · edita items en el editor' };
    }

    try {
      let items;
      if (source.type === 'csv-url') {
        items = await fetchCsvUrl(source.url, source.columnMapping);
      } else if (source.type === 'json-url') {
        items = await fetchJsonUrl(source.url);
      } else if (source.type === 'api') {
        return { ok: false, error: 'Tipo «api» no implementado · esperamos Fase 5+ (ADR 012)' };
      } else {
        return { ok: false, error: 'Tipo desconocido: ' + source.type };
      }

      if (!Array.isArray(items)) {
        return { ok: false, error: 'La fuente no devolvió un array de items' };
      }

      // Sincronizado correctamente: actualizar cache
      writeCache(projectId, items, source);
      return { ok: true, items, syncedAt: new Date().toISOString(), count: items.length };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function validateSource(source) {
    if (!source || !source.type) return { ok: false, error: 'source.type requerido' };
    if (!VALID_TYPES.includes(source.type)) {
      return { ok: false, error: 'type debe ser uno de: ' + VALID_TYPES.join(', ') };
    }
    if (source.type === 'static') return { ok: true };
    if (source.type === 'api')    return { ok: false, error: 'Tipo «api» aún no implementado' };

    if (!source.url) return { ok: false, error: 'URL requerida' };
    try {
      new URL(source.url); // throws si malformada
    } catch (e) {
      return { ok: false, error: 'URL malformada' };
    }

    try {
      if (source.type === 'csv-url') {
        const items = await fetchCsvUrl(source.url, source.columnMapping);
        if (!items.length) return { ok: false, error: 'CSV sin filas' };
        return { ok: true, columnsDetected: Object.keys(items[0]), sampleCount: items.length };
      }
      if (source.type === 'json-url') {
        const items = await fetchJsonUrl(source.url);
        if (!items.length) return { ok: false, error: 'JSON sin items' };
        return { ok: true, sampleCount: items.length };
      }
    } catch (e) {
      return { ok: false, error: 'Validación falló: ' + e.message };
    }

    return { ok: false, error: 'Tipo no manejado' };
  }

  window.fnbProductos = {
    loadProductos,
    syncProductos,
    validateSource,
    getCachedItems,
    clearCache,
    VALID_TYPES,
  };
})();
