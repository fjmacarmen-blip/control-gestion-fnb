/**
 * Share component · v6.0 plataforma F&B
 * --------------------------------------------------
 * Barra de compartir reutilizable para CUALQUIER documento del evento,
 * tanto interno (plano de sala, menús especiales, orden de servicio) como
 * de cara al cliente final (presupuesto, contrato, factura).
 *
 * Cuatro acciones, sin dependencias externas ni CDN:
 *   🖨️  Imprimir / Guardar como PDF   → window.print()  (usa @media print del doc)
 *   ✉️  Email                          → mailto: prerelleno
 *   🟢  WhatsApp                        → wa.me  (con o sin teléfono destino)
 *   🔗  Copiar enlace                   → clipboard (fallback execCommand)
 *
 * API window.fnbShare:
 *   mount(target, optsOrFn)   inyecta la barra dentro de `target`
 *   toolbar(optsOrFn)         → HTMLElement listo para insertar
 *   printPDF()                atajo a window.print()
 *   email(opts) / whatsapp(opts) / copy(opts)
 *
 * opts (o función que los devuelve en el momento del click, para datos vivos):
 *   { title, summary, url, email, tel, filename, label, actions }
 *   - title:   asunto del email / encabezado del mensaje
 *   - summary: cuerpo de texto (multilínea permitida)
 *   - url:     enlace público a compartir (opcional)
 *   - email:   destinatario por defecto del mailto (opcional)
 *   - tel:     teléfono WhatsApp en formato internacional sin "+" (opcional)
 *   - actions: subconjunto de ['print','email','whatsapp','copy'] (por defecto todas)
 */
(function () {
  'use strict';

  var STYLE_ID = 'fnb-share-styles';
  var ALL_ACTIONS = ['print', 'email', 'whatsapp', 'copy'];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.fnb-share{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0;}',
      '.fnb-share-label{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted,#7a8aa0);margin-right:4px;}',
      '.fnb-share-btn{display:inline-flex;align-items:center;gap:7px;cursor:pointer;',
      '  font-family:inherit;font-size:13px;font-weight:600;line-height:1;',
      '  padding:9px 14px;border-radius:9px;border:1px solid var(--border-default,#2a3550);',
      '  background:var(--bg-surface,#141d33);color:var(--text,#e8edf6);',
      '  transition:transform .08s ease,border-color .15s ease,background .15s ease;min-height:40px;}',
      '.fnb-share-btn:hover{border-color:var(--accent,#34d399);transform:translateY(-1px);}',
      '.fnb-share-btn:active{transform:translateY(0);}',
      '.fnb-share-btn:focus-visible{outline:2px solid var(--accent,#34d399);outline-offset:2px;}',
      '.fnb-share-btn.is-primary{background:linear-gradient(135deg,var(--accent,#34d399),var(--accent-deep,#0f9b6c));color:var(--bg-base,#0a1126);border-color:transparent;}',
      '.fnb-share-btn .ico{font-size:15px;}',
      '.fnb-share-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);',
      '  background:var(--bg-elevated,#1d2840);color:var(--text,#e8edf6);border:1px solid var(--accent,#34d399);',
      '  padding:11px 18px;border-radius:10px;font-size:13px;font-family:inherit;z-index:9999;',
      '  box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;}',
      '.fnb-share-toast.is-on{opacity:1;transform:translateX(-50%) translateY(0);}',
      '@media print{.fnb-share,.fnb-share-toast{display:none !important;}}'
    ].join('');
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  function resolve(optsOrFn) {
    var o = (typeof optsOrFn === 'function') ? optsOrFn() : optsOrFn;
    return o || {};
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'fnb-share-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    setTimeout(function () {
      t.classList.remove('is-on');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
    }, 2200);
  }

  // ── Acciones ────────────────────────────────────────────
  function printPDF() {
    window.print();
  }

  function buildBody(opts) {
    var parts = [];
    if (opts.summary) parts.push(opts.summary);
    if (opts.url) parts.push(opts.url);
    return parts.join('\n\n');
  }

  function email(opts) {
    opts = opts || {};
    var dest = opts.email || '';
    var subject = opts.title || 'Documento del evento';
    var body = buildBody(opts);
    var href = 'mailto:' + encodeURIComponent(dest) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  function whatsapp(opts) {
    opts = opts || {};
    var text = [opts.title, buildBody(opts)].filter(Boolean).join('\n\n');
    var tel = (opts.tel || '').replace(/[^\d]/g, '');
    var base = tel ? ('https://wa.me/' + tel) : 'https://wa.me/';
    var href = base + '?text=' + encodeURIComponent(text);
    window.open(href, '_blank', 'noopener');
  }

  function copy(opts) {
    opts = opts || {};
    var text = opts.url || buildBody(opts) || '';
    var done = function () { toast('Enlace copiado ✓'); };
    var fail = function () { toast('No se pudo copiar'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text) ? done() : fail(); });
    } else {
      legacyCopy(text) ? done() : fail();
    }
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  var DEFS = {
    print:    { ico: '🖨️', text: 'Imprimir / PDF', primary: true,  fn: function () { printPDF(); } },
    email:    { ico: '✉️', text: 'Email',           primary: false, fn: email },
    whatsapp: { ico: '🟢', text: 'WhatsApp',        primary: false, fn: whatsapp },
    copy:     { ico: '🔗', text: 'Copiar enlace',   primary: false, fn: copy }
  };

  // ── Render ──────────────────────────────────────────────
  function toolbar(optsOrFn) {
    injectStyles();
    var seed = resolve(optsOrFn);
    var actions = (seed.actions && seed.actions.length) ? seed.actions : ALL_ACTIONS;

    var wrap = document.createElement('div');
    wrap.className = 'fnb-share noprint';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Compartir documento');

    var label = document.createElement('span');
    label.className = 'fnb-share-label';
    label.textContent = seed.label || 'Compartir';
    wrap.appendChild(label);

    actions.forEach(function (key) {
      var def = DEFS[key];
      if (!def) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fnb-share-btn' + (def.primary ? ' is-primary' : '');
      btn.innerHTML = '<span class="ico" aria-hidden="true">' + def.ico + '</span><span>' + def.text + '</span>';
      btn.addEventListener('click', function () {
        var opts = resolve(optsOrFn);
        def.fn(opts);
      });
      wrap.appendChild(btn);
    });

    return wrap;
  }

  function mount(target, optsOrFn) {
    var el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) return null;
    var bar = toolbar(optsOrFn);
    el.appendChild(bar);
    return bar;
  }

  window.fnbShare = {
    mount: mount,
    toolbar: toolbar,
    printPDF: printPDF,
    email: email,
    whatsapp: whatsapp,
    copy: copy
  };
})();
