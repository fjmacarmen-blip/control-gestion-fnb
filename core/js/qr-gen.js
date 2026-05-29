/**
 * QR Generator · v5.0 plataforma F&B
 * --------------------------------------------------
 * Genera códigos QR para carta digital pública. La biblioteca
 * qrcode-generator (de dominio público, ~10KB) se carga lazy con SRI
 * solo cuando se llama a generateQR().
 *
 * API window.fnbQR:
 *   ensureLibLoaded()                            lazy-load CDN
 *   generateQR(text, opts?)                      → SVG string
 *   buildPublicMenuUrl(projectId, opts?)         → URL completa de la carta pública
 *   downloadQR(svgString, filename)              dispara descarga del SVG
 */
(function () {
  'use strict';

  const CDN_QR = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
  const SRI_QR = 'sha384-lQXOAyZwHXE55JFyrOMB7nY2Wv+m5ZWNtJcHrd1rceRQXAYNLak8ukN5TjBTcIwz';

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
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }
  async function ensureLibLoaded() {
    if (libLoaded) return;
    if (!window.qrcode) await loadScript(CDN_QR, SRI_QR);
    libLoaded = true;
  }

  /**
   * Genera un QR como SVG string. Acepta texto largo (URLs grandes).
   * opts: { size: px, fg: color, bg: color, level: 'L'|'M'|'Q'|'H' }
   */
  async function generateQR(text, opts) {
    await ensureLibLoaded();
    opts = opts || {};
    const level = opts.level || 'M';
    // Type 0 = auto (la lib calcula el tipo mínimo necesario)
    const qr = window.qrcode(0, level);
    qr.addData(text);
    qr.make();

    const count = qr.getModuleCount();
    const size = opts.size || 256;
    const margin = opts.margin == null ? 4 : opts.margin;
    const fg = opts.fg || '#000000';
    const bg = opts.bg || '#FFFFFF';
    const total = count + margin * 2;
    const scale = size / total;

    let cells = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          const x = (col + margin) * scale;
          const y = (row + margin) * scale;
          cells += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${scale.toFixed(2)}" height="${scale.toFixed(2)}"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="${size}" height="${size}" fill="${bg}"/>
      <g fill="${fg}">${cells}</g>
    </svg>`;
  }

  /**
   * Construye URL absoluta de la carta pública para un proyecto.
   * Resuelve respecto al origin actual + path base del repo.
   */
  function buildPublicMenuUrl(projectId, opts) {
    opts = opts || {};
    const origin = location.origin;
    // Detectar GitHub Pages: el repo está bajo /<repo>/, así que el path raíz
    // del proyecto en la web es /<repo>/. En localhost, el repo es la raíz.
    const pathParts = location.pathname.split('/').filter(Boolean);
    const isGhPages = location.host.endsWith('.github.io');
    const basePath = isGhPages && pathParts[0] ? '/' + pathParts[0] + '/' : '/';
    const targetPage = opts.page || 'carta-publica.html';
    return origin + basePath + targetPage + '?proyecto=' + encodeURIComponent(projectId);
  }

  function downloadQR(svgString, filename) {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'qr-carta.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  window.fnbQR = {
    ensureLibLoaded,
    generateQR,
    buildPublicMenuUrl,
    downloadQR,
  };
})();
