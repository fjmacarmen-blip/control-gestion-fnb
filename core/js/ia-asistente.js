/**
 * Asistente IA · v5.5 plataforma F&B
 * --------------------------------------------------
 * Chat client-side que ayuda al cliente final a confeccionar su menú.
 * Usa Pollinations.ai text API (gratis, sin API key, sin cuenta).
 *
 * Estrategia:
 *  1. Cuando el cliente abre el chat, cargamos el catálogo del proyecto
 *     (menús + composiciones + dietas + tipos de evento).
 *  2. Construimos un system prompt con TODO el catálogo en formato
 *     compacto (~3-5 KB de contexto típico).
 *  3. Cada turno del usuario se envía a Pollinations con histórico.
 *  4. La respuesta se renderiza como markdown simple.
 *
 * Decisiones de diseño:
 *  - Pollinations text es asíncrono · puede tardar 5-15 s · mostramos loader
 *  - No hay function calling en v1 · solo texto (en v2 vendrá «aplicar al cotizador»)
 *  - Histórico de conversación en sessionStorage (no persiste entre sesiones)
 *  - Si Pollinations falla, fallback a mensaje informativo + WhatsApp/email
 *
 * API window.fnbIA:
 *   loadCatalog(projectId)      precarga el catálogo del proyecto
 *   ask(userMessage)            envía mensaje y devuelve respuesta async
 *   reset()                     limpia el histórico
 *   injectChatUI(host?)         inyecta el chat flotante en la página
 */
(function () {
  'use strict';

  const POLLINATIONS_URL = 'https://text.pollinations.ai/';
  const STORAGE_KEY = 'fnb_ia_chat';

  let catalog = null;
  let projectId = null;
  let history = [];
  let chatOpen = false;
  let isLoading = false;

  // ── Construcción del system prompt ─────────────────
  function buildSystemPrompt() {
    if (!catalog) return 'Eres el asistente del establecimiento. Aún no se ha cargado el catálogo.';
    const est = catalog.establecimiento || {};
    const menus = (catalog.menus && catalog.menus.paquetes) || [];
    const eventos = (catalog.eventos && catalog.eventos.tipos) || [];
    const dietas = catalog.dietas && catalog.dietas.instrucciones ? Object.keys(catalog.dietas.instrucciones) : [];

    let p = `Eres el asistente comercial del establecimiento "${est.nombre_comercial || est.razon_social || 'el establecimiento'}".\n`;
    p += `Categoría: ${est.categoria || 'hostelería'}.\n\n`;

    if (eventos.length) {
      p += 'TIPOS DE EVENTO DISPONIBLES:\n';
      eventos.forEach(e => {
        p += `- ${e.name}: ${e.desc || ''}\n`;
      });
      p += '\n';
    }

    if (menus.length) {
      p += 'MENÚS DISPONIBLES:\n';
      menus.forEach(m => {
        if (m.ppax === 0) return;
        p += `\n[${m.name}] · ${m.ppax} €/pax · ${m.type}\n`;
        if (m.desc) p += `  ${m.desc}\n`;
        if (m.composition) {
          Object.entries(m.composition).slice(0, 4).forEach(([sec, items]) => {
            p += `  ${sec}: ${items.slice(0, 3).join(', ')}${items.length > 3 ? '...' : ''}\n`;
          });
        }
      });
      p += '\n';
    }

    if (dietas.length) {
      p += `DIETAS GESTIONADAS: ${dietas.join(', ')}.\n\n`;
    }

    p += `INSTRUCCIONES IMPORTANTES:
- Solo recomienda menús de la lista anterior. NO inventes platos ni precios.
- Si el cliente pide algo que no está, di honestamente que no lo tienes y propón la alternativa más cercana.
- Calcula totales así: precio_pax × número_pax + 10% IVA. Indica si IVA está incluido o no.
- Sé conciso (3-5 frases por respuesta). Habla como un maître profesional, cercano.
- Si el cliente quiere reservar, dile que pulse «Solicitar Presupuesto Formal» en el paso 7 del cotizador.
- Si pregunta cosas no relacionadas con eventos/menú, redirige amablemente.
- Responde en el mismo idioma que el cliente.`;

    return p;
  }

  // ── Carga del catálogo ─────────────────────────────
  async function loadCatalog(pId) {
    projectId = pId;
    if (!window.loadProject) {
      console.warn('[fnbIA] loadProject no disponible · necesita loader.js');
      return;
    }
    try {
      catalog = await window.loadProject(pId, { keys: ['establecimiento', 'menus', 'eventos', 'dietas'] });
    } catch (e) {
      console.warn('[fnbIA] Error cargando catálogo:', e);
      catalog = null;
    }
  }

  // ── Llamada a Pollinations text ────────────────────
  async function callPollinations(messages) {
    // Pollinations soporta POST con formato OpenAI-compatible en /openai
    // o GET con prompt en URL. Usamos POST para enviar histórico estructurado.
    const body = {
      messages,
      model: 'openai-fast',  // modelo gratis rápido
      jsonMode: false,
    };
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch(POLLINATIONS_URL + 'openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      // Formato OpenAI-compatible: { choices: [{ message: { content: '...' } }] }
      const text = data.choices?.[0]?.message?.content || data.content || data.text || '';
      if (!text) throw new Error('Respuesta vacía');
      return text.trim();
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') throw new Error('La consulta tardó demasiado · prueba con una pregunta más simple');
      throw e;
    }
  }

  // ── API pública: ask ───────────────────────────────
  async function ask(userMessage) {
    if (!userMessage || !userMessage.trim()) return null;
    if (isLoading) return null;
    isLoading = true;

    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];

    try {
      const reply = await callPollinations(messages);
      history.push({ role: 'user', content: userMessage, ts: Date.now() });
      history.push({ role: 'assistant', content: reply, ts: Date.now() });
      persistHistory();
      return reply;
    } catch (e) {
      throw e;
    } finally {
      isLoading = false;
    }
  }

  function reset() {
    history = [];
    persistHistory();
  }

  function persistHistory() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20))); } catch {}
  }
  function restoreHistory() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) history = JSON.parse(raw) || [];
    } catch { history = []; }
  }
  restoreHistory();

  // ── Markdown muy básico → HTML seguro ──────────────
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function mdToHtml(text) {
    let html = escapeHtml(text);
    // Bold **txt**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic *txt*
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    // Listas - item / * item
    html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>(?:\n<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');
    // Saltos de línea
    html = html.replace(/\n\n+/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');
    return html;
  }

  // ── UI flotante de chat ────────────────────────────
  const CHIPS = [
    '🍽️ Menú para 80 pax · boda íntima',
    '🌱 Opción vegana · 30 personas',
    '🥂 Cóctel ejecutivo · 50 pax',
    '🎂 Menú infantil · cumpleaños',
    '💡 Sugerencias de menú para una cena formal',
  ];

  function injectChatUI(host) {
    host = host || document.body;
    if (document.getElementById('__iaChatRoot__')) return;

    const root = document.createElement('div');
    root.id = '__iaChatRoot__';
    root.innerHTML = `
      <style>
        #__iaChatRoot__ * { box-sizing: border-box; }
        #__iaFab__ {
          position: fixed; bottom: 24px; right: 24px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: #0d1117;
          border: none; cursor: pointer;
          font-size: 24px;
          box-shadow: 0 10px 30px rgba(52,211,153,.4);
          z-index: 9998;
          transition: transform .15s;
          display: flex; align-items: center; justify-content: center;
        }
        #__iaFab__:hover { transform: scale(1.08); }
        #__iaFab__.hidden { display: none; }
        #__iaPanel__ {
          position: fixed; bottom: 24px; right: 24px;
          width: 380px; max-width: calc(100vw - 32px);
          height: 580px; max-height: calc(100vh - 48px);
          background: #161b22; color: #e6edf3;
          border: 1px solid #30363d;
          border-radius: 16px;
          box-shadow: 0 30px 80px rgba(0,0,0,.5);
          display: none; flex-direction: column;
          z-index: 9999;
          font-family: Inter, system-ui, sans-serif;
          overflow: hidden;
        }
        #__iaPanel__.open { display: flex; animation: iaSlideUp .25s ease both; }
        @keyframes iaSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .iaHead {
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: #0d1117;
          padding: 14px 18px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .iaHead .iaTitle { font-weight: 700; font-size: 15px; }
        .iaHead .iaSub { font-size: 11px; opacity: .8; margin-top: 1px; }
        .iaHead button { background: rgba(13,17,23,.2); border: none; color: #0d1117; width: 28px; height: 28px; border-radius: 7px; cursor: pointer; font-size: 14px; font-weight: 700; }
        .iaHead button:hover { background: rgba(13,17,23,.4); }
        .iaBody {
          flex: 1; overflow-y: auto;
          padding: 16px 18px;
          font-size: 13px; line-height: 1.6;
        }
        .iaMsg { margin-bottom: 14px; max-width: 90%; }
        .iaMsg.user { margin-left: auto; background: rgba(52,211,153,.12); border: 1px solid rgba(52,211,153,.3); border-radius: 12px 12px 4px 12px; padding: 9px 13px; color: #e6edf3; }
        .iaMsg.assistant { background: #21262d; border: 1px solid #30363d; border-radius: 12px 12px 12px 4px; padding: 11px 14px; color: #e6edf3; }
        .iaMsg.assistant ul { margin: 6px 0 6px 18px; padding: 0; }
        .iaMsg.assistant li { margin-bottom: 3px; }
        .iaMsg.assistant p { margin: 0 0 6px; }
        .iaMsg.assistant p:last-child { margin-bottom: 0; }
        .iaMsg.assistant strong { color: #6ee7b7; }
        .iaMsg.error { background: rgba(248,81,73,.1); border: 1px solid rgba(248,81,73,.3); color: #f85149; padding: 9px 13px; border-radius: 8px; font-size: 12px; }
        .iaTyping {
          display: inline-flex; gap: 4px; padding: 10px 14px;
          background: #21262d; border: 1px solid #30363d; border-radius: 12px 12px 12px 4px;
        }
        .iaTyping span { width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; animation: iaPulse 1.2s infinite; }
        .iaTyping span:nth-child(2) { animation-delay: .2s; }
        .iaTyping span:nth-child(3) { animation-delay: .4s; }
        @keyframes iaPulse { 0%, 60%, 100% { opacity: .3; transform: scale(.8); } 30% { opacity: 1; transform: scale(1.1); } }
        .iaChips {
          padding: 8px 14px 0;
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .iaChip {
          background: transparent;
          border: 1px solid #30363d;
          color: #8b949e;
          padding: 5px 10px;
          border-radius: 100px;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
        }
        .iaChip:hover { color: #6ee7b7; border-color: #6ee7b7; }
        .iaInput {
          border-top: 1px solid #30363d;
          padding: 12px 14px;
          display: flex; gap: 8px;
        }
        .iaInput input {
          flex: 1; background: #0d1117; border: 1px solid #30363d;
          color: #e6edf3; padding: 9px 12px; border-radius: 8px;
          font-family: inherit; font-size: 13px;
        }
        .iaInput input:focus { outline: none; border-color: #34d399; }
        .iaInput button {
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: #0d1117; border: none; padding: 0 16px;
          border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
        }
        .iaInput button:disabled { opacity: .5; cursor: wait; }
        .iaWelcome {
          color: #8b949e; font-size: 12px;
          padding: 16px; background: #0d1117; border: 1px dashed #30363d;
          border-radius: 8px; margin-bottom: 14px; line-height: 1.6;
        }
        .iaFoot {
          font-size: 10px; color: #6e7681; text-align: center;
          padding: 6px 14px 10px;
          border-top: 1px solid #30363d;
        }
        @media (max-width: 480px) {
          #__iaPanel__ { width: 100vw; height: 100vh; right: 0; bottom: 0; max-height: 100vh; max-width: 100vw; border-radius: 0; }
          #__iaFab__ { bottom: 16px; right: 16px; }
        }
      </style>
      <button id="__iaFab__" title="Asistente IA · te ayuda a elegir el menú">💬</button>
      <div id="__iaPanel__" role="dialog" aria-label="Asistente IA">
        <div class="iaHead">
          <div>
            <div class="iaTitle">Asistente IA</div>
            <div class="iaSub">Te ayudo a elegir el mejor menú</div>
          </div>
          <button id="__iaClose__" aria-label="Cerrar chat">✕</button>
        </div>
        <div class="iaBody" id="__iaBody__"></div>
        <div class="iaChips" id="__iaChips__"></div>
        <form class="iaInput" id="__iaForm__">
          <input type="text" id="__iaInputBox__" placeholder="Escribe tu pregunta…" autocomplete="off" maxlength="500">
          <button type="submit" id="__iaSend__">↑</button>
        </form>
        <div class="iaFoot">Respuestas generadas por IA · pueden contener imprecisiones · confirma con el equipo</div>
      </div>
    `;
    host.appendChild(root);

    // Event handlers
    const fab = document.getElementById('__iaFab__');
    const panel = document.getElementById('__iaPanel__');
    const body = document.getElementById('__iaBody__');
    const form = document.getElementById('__iaForm__');
    const input = document.getElementById('__iaInputBox__');
    const sendBtn = document.getElementById('__iaSend__');

    fab.addEventListener('click', () => openChat(panel, fab, body));
    document.getElementById('__iaClose__').addEventListener('click', () => closeChat(panel, fab));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || isLoading) return;
      input.value = '';
      await sendMessage(text, body, sendBtn);
    });

    renderChips();
  }

  function openChat(panel, fab, body) {
    chatOpen = true;
    panel.classList.add('open');
    fab.classList.add('hidden');
    renderBody(body);
    setTimeout(() => document.getElementById('__iaInputBox__')?.focus(), 100);
  }
  function closeChat(panel, fab) {
    chatOpen = false;
    panel.classList.remove('open');
    fab.classList.remove('hidden');
  }

  function renderBody(body) {
    if (!history.length) {
      body.innerHTML = `
        <div class="iaWelcome">
          <strong style="color:#6ee7b7;">¡Hola!</strong> Soy tu asistente para configurar el evento perfecto.
          Cuéntame qué tipo de celebración tienes en mente (boda, cena de empresa, cumpleaños...), número aproximado
          de comensales y cualquier necesidad especial (vegetarianos, alérgicos). Te propongo el menú que mejor encaja.
        </div>
      `;
      return;
    }
    body.innerHTML = history.map(m => {
      if (m.role === 'user') return '<div class="iaMsg user">' + escapeHtml(m.content) + '</div>';
      return '<div class="iaMsg assistant">' + mdToHtml(m.content) + '</div>';
    }).join('');
    body.scrollTop = body.scrollHeight;
  }

  function renderChips() {
    const chipsEl = document.getElementById('__iaChips__');
    if (!chipsEl) return;
    chipsEl.innerHTML = CHIPS.map(c => '<button class="iaChip" type="button">' + escapeHtml(c) + '</button>').join('');
    chipsEl.querySelectorAll('.iaChip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.textContent.trim();
        const body = document.getElementById('__iaBody__');
        const sendBtn = document.getElementById('__iaSend__');
        await sendMessage(text, body, sendBtn);
      });
    });
  }

  async function sendMessage(text, body, sendBtn) {
    if (isLoading) return;
    // Render user message inmediatamente
    history.push({ role: 'user', content: text, ts: Date.now() });
    renderBody(body);
    // Indicador "escribiendo..."
    body.innerHTML += '<div class="iaMsg assistant" id="__iaTypingMsg__"><div class="iaTyping"><span></span><span></span><span></span></div></div>';
    body.scrollTop = body.scrollHeight;
    sendBtn.disabled = true;

    try {
      isLoading = true;
      const messages = [
        { role: 'system', content: buildSystemPrompt() },
        ...history.map(h => ({ role: h.role, content: h.content })),
      ];
      const reply = await callPollinations(messages);
      history.push({ role: 'assistant', content: reply, ts: Date.now() });
      persistHistory();
      document.getElementById('__iaTypingMsg__')?.remove();
      renderBody(body);
    } catch (e) {
      document.getElementById('__iaTypingMsg__')?.remove();
      const errMsg = 'No pude conectar con el asistente (' + (e.message || 'error') + '). Inténtalo de nuevo en un momento o contacta directamente con el equipo del establecimiento.';
      body.innerHTML += '<div class="iaMsg error">⚠ ' + escapeHtml(errMsg) + '</div>';
      body.scrollTop = body.scrollHeight;
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
    }
  }

  window.fnbIA = {
    loadCatalog,
    ask,
    reset,
    injectChatUI,
  };
})();
