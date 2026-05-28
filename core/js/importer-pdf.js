/**
 * Importer PDF · Fase 3.5.B plataforma F&B (v4.12)
 * --------------------------------------------------
 * Extrae texto de PDFs no escaneados con PDF.js (Mozilla, vía CDN).
 * Implementa el «nivel A» del ADR §7.6.2: parser de texto + UI
 * 2-columnas para copy-paste asistido. El nivel B (OCR con
 * Tesseract.js para escaneos) se difiere a una fase posterior.
 *
 * Lib pdfjs-dist 4.x cargada dinámicamente al primer uso (~700KB
 * minificada + worker en archivo separado).
 *
 * API window.fnbPdf:
 *   ensureLibLoaded()                       lazy-load PDF.js
 *   parsePdf(file)                          → { pages: [{ num, text, lines }] }
 *   extractItemsFromText(text, target)      → tentative items por heurística
 *   linesToParagraphs(lines)                → agrupa líneas en bloques
 */
(function () {
  'use strict';

  // PDF.js 4.x. Usamos el bundle "legacy" que funciona en navegadores modernos
  // sin necesidad de import maps. El worker se carga aparte.
  const CDN_PDFJS  = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/legacy/build/pdf.min.mjs';
  const CDN_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/legacy/build/pdf.worker.min.mjs';

  let libLoaded = false;
  let pdfjsLib = null;

  async function ensureLibLoaded() {
    if (libLoaded) return pdfjsLib;
    pdfjsLib = await import(CDN_PDFJS);
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_WORKER;
    }
    libLoaded = true;
    return pdfjsLib;
  }

  // ── Parsing ────────────────────────────────────────
  async function parsePdf(file) {
    const lib = await ensureLibLoaded();
    const buffer = await file.arrayBuffer();
    const doc = await lib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      // Items de PDF.js: { str, transform: [a,b,c,d,e,f] } · f = posY
      const items = tc.items.filter(it => it.str !== undefined);

      // Agrupar por línea según posY (con tolerancia)
      const linesMap = new Map();
      items.forEach(it => {
        const y = Math.round(it.transform[5] * 10) / 10;
        if (!linesMap.has(y)) linesMap.set(y, []);
        linesMap.get(y).push({ x: it.transform[4], str: it.str });
      });
      // Ordenar líneas top→bottom, dentro de cada línea left→right
      const sortedYs = [...linesMap.keys()].sort((a, b) => b - a);
      const lines = sortedYs.map(y => {
        const segs = linesMap.get(y).sort((a, b) => a.x - b.x);
        return segs.map(s => s.str).join(' ').replace(/\s+/g, ' ').trim();
      }).filter(l => l.length > 0);

      pages.push({
        num: i,
        text: lines.join('\n'),
        lines,
      });
    }
    return { numPages: doc.numPages, pages };
  }

  // ── Heurísticas de extracción ──────────────────────
  /**
   * Agrupa líneas consecutivas en párrafos cuando no hay separadores.
   * Devuelve [{ start, end, text }] con índices de línea original.
   */
  function linesToParagraphs(lines) {
    const paragraphs = [];
    let buf = [];
    let start = 0;
    lines.forEach((line, i) => {
      if (line === '') {
        if (buf.length) {
          paragraphs.push({ start, end: i - 1, text: buf.join(' ') });
          buf = [];
        }
        start = i + 1;
      } else {
        if (!buf.length) start = i;
        buf.push(line);
      }
    });
    if (buf.length) paragraphs.push({ start, end: lines.length - 1, text: buf.join(' ') });
    return paragraphs;
  }

  /**
   * Heurística simple: busca patrones tipo «Nombre del plato … 12,50 €»
   * y devuelve items tentativos. El usuario los revisa en la UI.
   * Trabaja sobre TODO el texto del PDF concatenado.
   */
  function extractItemsFromText(text, target) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length);
    const items = [];
    const priceRe = /(\d{1,3}(?:[.,]\d{2}))\s*(?:€|EUR|eur)/i;
    const plainPriceRe = /(\d{1,3}[.,]\d{2})\s*$/; // precio al final sin €

    lines.forEach((line, idx) => {
      const m = line.match(priceRe) || line.match(plainPriceRe);
      if (!m) return;
      const priceStr = m[1].replace(',', '.');
      const price = parseFloat(priceStr);
      if (!isFinite(price)) return;
      // Nombre = lo que está antes del precio
      const namePart = line.slice(0, m.index).replace(/[\.…\-–—]+$/, '').trim();
      if (namePart.length < 3) return;

      if (target === 'menus') {
        const id = namePart.toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
        items.push({
          sourceLine: idx,
          item: {
            id: id || ('item-' + idx),
            name: namePart,
            ppax: price,
            type: 'sentado',
            scope: 'all',
            badge: 'badge-est',
            g: 'g6',
            composition: {},
          },
        });
      } else if (target === 'recetas') {
        items.push({
          sourceLine: idx,
          item: {
            n: namePart,
            categoria: 'entrantes',  // default · el usuario corrige
            e: '🍴',
            g: 'g6',
            mp: price,
            ing: [],
            pasos: [],
          },
        });
      } else if (target === 'productos') {
        const id = namePart.toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
        items.push({
          sourceLine: idx,
          item: {
            id: id || ('prod-' + idx),
            nombre: namePart,
            categoria: 'otros',
            unidad: 'kg',
            precio: price,
            proveedor: '',
          },
        });
      }
    });

    return items;
  }

  window.fnbPdf = {
    ensureLibLoaded,
    parsePdf,
    extractItemsFromText,
    linesToParagraphs,
  };
})();
