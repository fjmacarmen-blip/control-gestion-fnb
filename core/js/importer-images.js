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

  let libLoaded = false;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }
  async function ensureLibLoaded() {
    if (libLoaded) return;
    if (!window.imageCompression) await loadScript(CDN_COMPRESS);
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
    const normalize = s => (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const target = normalize(filename.replace(/\.[^.]+$/, ''));
    if (!target) return null;

    let best = null;
    let bestScore = 0;
    items.forEach((it, idx) => {
      const name = getNameFn ? getNameFn(it) : (it.n || it.nombre || it.name || '');
      const normName = normalize(name);
      if (!normName) return;
      let score = 0;
      if (target === normName) score = 100;
      else if (target.includes(normName) || normName.includes(target)) score = 70;
      else {
        // Substring de palabras (split en originales por espacios)
        const tParts = target.split(/[^a-z0-9]+/).filter(Boolean);
        const nParts = normName.split(/[^a-z0-9]+/).filter(Boolean);
        const overlap = tParts.filter(t => nParts.some(n => n.length > 2 && (t.includes(n) || n.includes(t))));
        if (overlap.length) score = 30 + overlap.length * 10;
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
