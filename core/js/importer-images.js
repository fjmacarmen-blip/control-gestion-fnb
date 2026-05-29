/**
 * Importer Imágenes · Fase 3.5.C plataforma F&B (v4.13)
 * --------------------------------------------------
 * Bulk upload de imágenes con compresión client-side, auto-matching
 * por nombre de archivo y fallback de generación IA via Pollinations.ai
 * (sin API key, según D9 del ADR).
 *
 * Lib browser-image-compression (CDN) ~10KB. Lazy-load al primer uso.
 *
 * Estrategia (D9 del ADR):
 *  - max 1600px lado largo
 *  - WebP calidad 80%
 *  - target ≤250KB por imagen
 *  - thumbnail 400px para previews
 *
 * API window.fnbImages:
 *   ensureLibLoaded()                       lazy-load browser-image-compression
 *   compressImage(file, opts?)              File → File comprimido WebP
 *   compressMany(files, onProgress?)        bulk con progreso
 *   autoMatchByFilename(filename, items)    matching contra recetas/menús
 *   fileToDataUrl(file)                     File → data URL (base64)
 *   generateAIImage(prompt, opts?)          Pollinations.ai · sin API key
 *   buildAIPrompt(item)                     construye prompt para receta/menú
 */
(function () {
  'use strict';

  const CDN_COMPRESS = 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js';
  const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt/';
  // SRI · cierre auditoría C1 (v4.15)
  const SRI_COMPRESS = 'sha384-dHP9fwqd9BAiDh9uJ0p10khgbbcFMh34bVEiCnJ1Ah/AT2T2k4t572VEo3WXzxXp';

  let libLoaded = false;
  function loadScript(src, integrity) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      if (integrity) {
        s.integrity = integrity;
        s.crossOrigin = 'anonymous';
      }
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('No se pudo cargar ' + src + ' (¿hash SRI obsoleto?)'));
      document.head.appendChild(s);
    });
  }
  async function ensureLibLoaded() {
    if (libLoaded) return;
    if (!window.imageCompression) await loadScript(CDN_COMPRESS, SRI_COMPRESS);
    libLoaded = true;
  }

  // ── Compresión ────────────────────────────────────
  async function compressImage(file, opts) {
    await ensureLibLoaded();
    opts = opts || {};
    const options = {
      maxSizeMB: opts.maxSizeMB || 0.25,        // 250 KB
      maxWidthOrHeight: opts.maxWidthOrHeight || 1600,
      useWebWorker: true,
      fileType: opts.fileType || 'image/webp',
      initialQuality: opts.initialQuality || 0.8,
    };
    return window.imageCompression(file, options);
  }

  async function compressMany(files, onProgress) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const compressed = await compressImage(f);
        results.push({ ok: true, original: f, compressed, originalSize: f.size, finalSize: compressed.size });
      } catch (e) {
        results.push({ ok: false, original: f, error: e.message });
      }
      if (onProgress) onProgress(i + 1, files.length, results[results.length - 1]);
    }
    return results;
  }

  // ── Auto-matching por nombre de archivo ──────────
  /**
   * Compara filename (sin extensión) contra una lista de items con
   * .nombre (recetas) o .name (menús). Retorna el item de mejor match
   * o null si no hay similitud razonable.
   */
  function autoMatchByFilename(filename, items, getNameFn) {
    // Normalize a string keeping word separators (collapses accents + lowercase
    // but preserves spaces/dashes so we can split into tokens).
    const normalizeKeepSep = s => (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s_-]/g, '');
    const tokensOf = s => normalizeKeepSep(s).split(/[\s_-]+/).filter(t => t.length > 0);
    // Concatenated version sin separadores para exact/contains
    const flatten = s => normalizeKeepSep(s).replace(/[\s_-]/g, '');

    const targetTokens = tokensOf(filename.replace(/\.[^.]+$/, ''));
    const targetFlat = flatten(filename.replace(/\.[^.]+$/, ''));
    if (!targetFlat) return null;
    // Stopwords cortas comunes en español que no aportan al match
    const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'al', 'a', 'y', 'o', 'en', 'con', 'del']);

    let best = null;
    let bestScore = 0;
    items.forEach((it, idx) => {
      const name = getNameFn ? getNameFn(it) : (it.n || it.nombre || it.name || '');
      const nameFlat = flatten(name);
      const nameTokens = tokensOf(name).filter(t => !STOP.has(t));
      if (!nameFlat) return;
      let score = 0;
      if (targetFlat === nameFlat) score = 100;
      else if (targetFlat.includes(nameFlat) || nameFlat.includes(targetFlat)) score = 80;
      else {
        // Score por intersección de tokens significativos (>2 chars, no stopwords)
        const tTokens = targetTokens.filter(t => !STOP.has(t) && t.length > 2);
        const nSet = new Set(nameTokens.filter(t => t.length > 2));
        const overlap = tTokens.filter(t => nSet.has(t));
        if (overlap.length) {
          // Cada token compartido vale 25; satura a 80 para no eclipsar contains
          score = Math.min(80, overlap.length * 25);
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = { item: it, idx, score };
      }
    });
    if (bestScore < 30) return null;
    return best;
  }

  // ── File → data URL ──────────────────────────────
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  // ── Pollinations.ai (gratis, sin API key) ────────
  /**
   * Construye un prompt en inglés a partir de un item de receta/menú.
   * Devuelve URL directa de la imagen generada (no se descarga aún).
   */
  function buildAIPrompt(item) {
    const name = item.n || item.nombre || item.name || 'gourmet dish';
    const alergen = item.alergen || '';
    let prompt = 'professional food photography, ' + name + ', restaurant plating, top view, natural light, vibrant colors, elegant';
    if (alergen.toLowerCase().includes('mariscos') || /gamba|langosta|pulpo|sepia|mejillon|navaja/i.test(name)) {
      prompt += ', seafood';
    }
    if (/postre|tarta|coulant|crema|sorbete|panna/i.test(name)) {
      prompt += ', dessert plate, fine pastry';
    }
    return prompt;
  }

  function generateAIImage(prompt, opts) {
    opts = opts || {};
    const w = opts.width || 1024;
    const h = opts.height || 768;
    const seed = opts.seed || Math.floor(Math.random() * 1e9);
    const enhanced = encodeURIComponent(prompt);
    const url = POLLINATIONS_BASE + enhanced + '?width=' + w + '&height=' + h + '&seed=' + seed + '&nologo=true&model=flux';
    return url; // navegador puede mostrarla directamente como <img src>
  }

  // ── Descargar una URL como Blob (para guardar) ───
  async function urlToBlob(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.blob();
  }

  window.fnbImages = {
    ensureLibLoaded,
    compressImage,
    compressMany,
    autoMatchByFilename,
    fileToDataUrl,
    generateAIImage,
    buildAIPrompt,
    urlToBlob,
  };
})();
