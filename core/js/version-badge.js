/**
 * v5.17 · Badge de versión visible
 *
 * Carga core/version.json e inyecta un badge fijo en la esquina inferior
 * izquierda con la versión actual + enlace al changelog. Sirve para que
 * Paco (y cualquier visitante) sepa de un vistazo qué versión está mirando
 * y evite revisar archivos viejos.
 *
 * USO: añadir <script src="<base>/core/js/version-badge.js" defer></script>
 * a cualquier HTML principal. El script auto-detecta la ruta relativa al
 * version.json según la profundidad de la página.
 *
 * Comportamiento:
 *  - Click en el badge: abre el changelog en pestaña nueva
 *  - Hover: muestra los highlights de la última versión
 *  - localStorage: recuerda última versión vista; si hay nueva, parpadea
 *  - data-version-hide en el body para ocultar (páginas de impresión)
 *  - print: oculto automáticamente
 */
(function () {
  'use strict';

  // Auto-detección de la ruta a version.json según profundidad
  function detectBasePath() {
    // Si la página declara meta name="project-base", usarla
    var meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.getAttribute('content')) {
      var b = meta.getAttribute('content').replace(/\/$/, '');
      return b + '/core/version.json';
    }
    // Fallback: detectar por path. Páginas en raíz → 'core/version.json'
    // Páginas en dashboard/ o core/pages/ → '../core/version.json'
    var path = location.pathname;
    var depth = (path.match(/\//g) || []).length - 1;
    // raíz típica: /index.html → depth 1 (1 slash final + 1 antes)
    // dashboard/ → depth 2
    // core/pages/foo.html → depth 3
    if (path.endsWith('/') || depth <= 1) return 'core/version.json';
    if (depth === 2) return '../core/version.json';
    return '../../core/version.json';
  }

  function fmtFechaCorta(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  }

  function injectBadge(info) {
    if (document.body.hasAttribute('data-version-hide')) return;
    if (document.getElementById('qbb-version-badge')) return; // idempotente

    var seen = (function () {
      try { return localStorage.getItem('qbb_last_seen_version'); }
      catch { return null; }
    })();
    var isNew = seen !== info.version;

    var style = document.createElement('style');
    style.textContent = ''
      + '#qbb-version-badge{position:fixed;bottom:14px;left:14px;z-index:9998;'
      +   'display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;'
      +   'background:rgba(15,20,35,.85);backdrop-filter:blur(8px);'
      +   'border:1px solid rgba(255,255,255,.12);color:#e8efe9;'
      +   'font:600 11px/1.2 \'JetBrains Mono\',ui-monospace,monospace;'
      +   'text-decoration:none;letter-spacing:.5px;text-transform:uppercase;'
      +   'transition:all 200ms ease;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}'
      + '#qbb-version-badge:hover{transform:translateY(-2px);border-color:#00e676;color:#00e676;box-shadow:0 0 16px rgba(0,230,118,.25)}'
      + '#qbb-version-badge .qbb-vb-dot{width:7px;height:7px;border-radius:50%;background:#00e676;box-shadow:0 0 6px #00e676}'
      + '#qbb-version-badge.is-new .qbb-vb-dot{animation:qbb-vb-pulse 1.6s ease-in-out infinite}'
      + '#qbb-version-badge.is-new{border-color:#00e676;color:#00e676}'
      + '#qbb-version-badge .qbb-vb-date{opacity:.65;font-weight:400;text-transform:none;letter-spacing:.2px}'
      + '@keyframes qbb-vb-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}'
      + '@media print{#qbb-version-badge{display:none!important}}'
      + '@media(max-width:480px){#qbb-version-badge{font-size:10px;padding:5px 10px;bottom:10px;left:10px}}';
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.id = 'qbb-version-badge';
    if (isNew) a.classList.add('is-new');
    a.href = info.changelog_url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    var title = info.tag + ' · ' + (info.title || '') + '\n\nÚltimos cambios:\n' +
      (info.highlights || []).map(function(h){ return '· ' + h; }).join('\n');
    a.title = title;
    a.setAttribute('aria-label', 'Versión ' + info.tag + ' · ' + (info.title || ''));
    a.innerHTML = '<span class="qbb-vb-dot"></span>' +
      '<span>' + (info.tag || ('v' + info.version)) + '</span>' +
      '<span class="qbb-vb-date">· ' + fmtFechaCorta(info.date) + '</span>';
    a.addEventListener('click', function () {
      try { localStorage.setItem('qbb_last_seen_version', info.version); } catch {}
      a.classList.remove('is-new');
    });
    document.body.appendChild(a);
  }

  function load() {
    var url = detectBasePath();
    fetch(url, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (info) {
        if (!info || !info.version) return;
        window.qbbVersion = info;
        injectBadge(info);
      })
      .catch(function (e) { /* silencioso · no debe romper la página */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
