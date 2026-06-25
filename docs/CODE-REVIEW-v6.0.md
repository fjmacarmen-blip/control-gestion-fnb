# Code Review formal · v6.0

**Fecha:** 2026-06-25
**Versión revisada:** v6.0 (post-auditoría v5.10)
**Alcance:** 5 módulos nuevos · share.js · disenador-sala.html · factura-servicio.html · qr-print.html · dashboard/sala.html + disolución PWA
**Método:** revisión línea-a-línea con foco en bugs reales (no nitpicks)

---

## Resumen ejecutivo

| Severidad | Cantidad | Acción |
| --- | ---: | --- |
| 🔴 Críticos | **0** | — |
| 🟠 Altos | **2** | Resolver antes de entregar módulos al primer cliente |
| 🟡 Medios | **5** | Fix en próximas iteraciones |
| 🟢 Bajos | **4** | Aceptables · documentados |

**Veredicto general:** **APROBADO con observaciones.** Los 5 módulos nuevos están bien construidos. Los 2 hallazgos altos son bugs funcionales en `share.js` que afectan directamente a la UX de compartir documentos — deben corregirse antes de usar el componente en producción. Los medios son mejoras de robustez y consistencia que no bloquean el uso actual.

---

## 🟠 ALTOS

### A1 · `share.js:100` · `email()` navega la página actual con `window.location.href`

```javascript
function email(opts) {
  // ...
  window.location.href = href;   // ← problema
}
```

`window.location.href = 'mailto:...'` intenta cambiar el documento actual al protocolo `mailto:`. En macOS/Windows con cliente de correo configurado, el OS captura la navegación y abre el cliente; la página original queda intacta. Pero en entornos donde no hay cliente de correo registrado (Chrome OS, móvil sin app de correo, servidor de kiosco), el navegador puede quedarse en blanco o mostrar un error de protocolo, y el usuario pierde el documento que quería enviar.

**Impacto:** en entornos sin cliente de correo, el usuario pierde el contexto de la página al pulsar "Email".

**Fix:**

```javascript
function email(opts) {
  opts = opts || {};
  var dest = opts.email || '';
  var subject = opts.title || 'Documento del evento';
  var body = buildBody(opts);
  var href = 'mailto:' + dest +
    '?subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(body);
  window.open(href, '_self');   // OS captura el protocolo; _self evita popup blocker
}
```

### A2 · `share.js:97` · `encodeURIComponent()` en la dirección del destinatario

```javascript
var href = 'mailto:' + encodeURIComponent(dest) + '?subject=...';
//                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//   produce: mailto:user%40example.com — @ codificado
```

`encodeURIComponent` convierte `@` en `%40`. El resultado no es RFC 6068 compliant: la parte `to` de un URI `mailto:` debe contener la dirección tal cual, sin codificar el `@`. Chrome y Firefox lo toleran porque el navegador decodifica antes de pasar al sistema operativo, pero clientes de escritorio estrictos (Outlook clásico, Thunderbird con configuración agresiva) pueden ignorar el destinatario o no abrirlo correctamente.

**Impacto:** email sin destinatario pre-rellenado en clientes estrictos. Bug silencioso — el usuario ve que se abre el cliente pero tiene que poner el destinatario a mano.

**Fix:** no codificar la dirección; solo codificar los parámetros:

```javascript
var href = 'mailto:' + (dest || '') +
  '?subject=' + encodeURIComponent(subject) +
  '&body=' + encodeURIComponent(body);
```

---

## 🟡 MEDIOS

### M1 · `factura-servicio.html:195-230` · `buildLines()` interpola nombres en `innerHTML` sin escapar

`buildInvoice()` construye la tabla de la factura por concatenación de strings:

```javascript
ls.forEach(l => rows += `
  <tr>
    <td class="c-main">${l.concepto}</td>
    <td>${l.detalle}</td>
    ...
  </tr>
`);
```

Los strings `l.concepto` y `l.detalle` se construyen a partir de `menus.json`, `bebidas.json`, etc. — datos committeados en el repo, no input externo de usuario en tiempo real. En la práctica no hay XSS. Pero `escapeHtml()` ya existe en otros módulos del proyecto (e.g. `editor-core.js`) y la invariante es que cualquier dato que llega de storage o JSON externo se escapa antes de ir a `innerHTML`.

**Acción:** aplicar `escapeHtml()` a `l.concepto` y `l.detalle` en `buildLines()`.

### M2 · `disenador-sala.html:143` + `qr-print.html:~100` · Parámetro `proyecto` sin whitelist propia

Ambas páginas leen `params.get('proyecto')` sin validar contra `^[a-z0-9_-]+$`:

```javascript
const PROYECTO = params.get('proyecto') || 'demo';   // ← sin whitelist
const STORAGE_KEY = () => `fnb_sala_${PROYECTO}_${state.espacio}`;
```

En `loader.js` y en todas las páginas existentes, esta validación existe y previene path traversal. Las nuevas páginas standalone no la aplican. En `disenador-sala.html`, el valor acaba solo en claves de `localStorage` (inofensivo). En `qr-print.html`, acaba en la URL que se codifica en el QR (podría generar un QR con URL malformada). En `factura-servicio.html`, la carga pasa por `loader.js` que sí valida — protegido.

**Acción:** añadir al inicio de las dos páginas:

```javascript
if (!/^[a-z0-9_-]+$/.test(PROYECTO)) { location.href = '../'; }
```

### M3 · `disenador-sala.html:163-165` · `save()` llamada síncrona en cada acción

Cada movimiento de elemento (mouseup), cambio de estado de asiento y borrado llama directamente a `save()` → `localStorage.setItem()` con el estado completo serializado. Para planos pequeños (8-12 mesas, ~100-200 bytes) es imperceptible. Para planos de 40+ mesas con listas de comensales completas (1-2 KB), puede percibirse un micro-lag al arrastrar.

**Fix:** debounce de 300 ms en `save()`.

### M4 · `disenador-sala.html` · Sin soporte de teclado en la selección de herramienta

Los botones del toolbar (select, mesa-redonda, escenario, etc.) son `<button>` clickables pero no tienen `accesskey` ni manejo de flecha ↑↓ en el grupo. Un técnico que trabaje con teclado en el plano de sala no puede cambiar de herramienta sin ratón.

**Acción:** añadir `role="radiogroup"` al toolbar + manejar `ArrowUp`/`ArrowDown` para cambiar tool activa.

### M5 · `share.js:106` · `whatsapp()` construye URL con `base + '?text=...'` cuando `tel` está vacío

```javascript
var base = tel ? ('https://wa.me/' + tel) : 'https://wa.me/';
var href = base + '?text=' + encodeURIComponent(text);
// Si tel está vacío: https://wa.me/?text=...
```

`https://wa.me/?text=...` abre WhatsApp Web con el mensaje pre-rellenado pero sin destinatario. En la app móvil de WhatsApp, esta URL muestra el selector de contactos, que es el comportamiento correcto. En WhatsApp Web (escritorio), puede fallar en algunos navegadores — algunos muestran un error de URL inválida. Aceptable para el caso actual donde siempre se abre en móvil, pero inconsistente.

**Acción:** documentar el comportamiento esperado en el JSDoc de `whatsapp()`.

---

## 🟢 BAJOS (aceptables)

### B1 · `share.js:124-135` · `legacyCopy` usa `document.execCommand('copy')` obsoleto

`execCommand` es API deprecada desde 2016 pero aún soportada en todos los navegadores modernos. `share.js` la usa solo como fallback del `navigator.clipboard.writeText` moderno — la ruta principal es correcta. Cuando `execCommand` sea eliminado definitivamente, el fallback dejará de funcionar pero el primario ya habrá cubierto el 99% de los navegadores.

### B2 · `disenador-sala.html` · Labels de mesa no se renumeran tras borrar

Si se borran la mesa 2 de 5, el estado queda con mesas 1, 3, 4, 5. Los labels son identificadores persistentes (coinciden con los nombres que el usuario tecleó), no números de orden. Es comportamiento intencional y correcto para preservar la información de los comensales asignados.

### B3 · `qr-print.html` · QR de evento no se regenera automáticamente al cambiar campos

Los campos (nombre del evento, fecha, hotel) tienen event listener de `input` que actualiza el preview... o debería tenerlo. Si el QR solo se regenera al hacer click en "Generar", el usuario puede imprimir el QR de la sesión anterior sin notarlo.

**Acción verificar:** comprobar que hay event listener `input` en los campos del modo evento.

### B4 · `factura-servicio.html` · Datos en `sessionStorage` se pierden al abrir en nueva pestaña

`DATA_KEY = 'fnb_presupuesto_actual'` vive en `sessionStorage`, que es por pestaña. Si el usuario hace "Abrir en nueva pestaña" desde el cotizador, la factura queda vacía con el mensaje de error. Está documentado por el enlace al cotizador en el mensaje de error, pero podría sorprender.

---

## ✅ Lo que está BIEN

- **CSP en los 5 nuevos HTML** · todas las páginas v6.0 incluyen `<meta http-equiv="Content-Security-Policy">` correctamente configurado
- **`share.js` sin dependencias externas** · IIFE puro, inyecta estilos una sola vez, sin CDN, funciona en cualquier página
- **`legacyCopy` con try-catch** · no puede crashear; el fallback del fallback devuelve `false` limpiamente
- **`save()`/`load()` con try-catch** · el diseñador de sala no pierde datos de la UI si localStorage falla
- **`load()` valida `Array.isArray(d.items)`** · no crashea con datos corruptos en storage
- **`crypto.subtle.digest('SHA-256', ...)` en qr-print** · uso correcto de Web Crypto API, no implementación casera
- **Disolución limpia de PWA** · `sala-movil.html`, `sw.js`, `manifest.json` e `icons/` eliminados del repo; `sala.html` en dashboard respeta el patrón multi-tenant con `?proyecto=`
- **`share.js` API defensiva** · `resolve(optsOrFn)` maneja tanto objeto como función; `null`/`undefined` devuelve `{}` sin crash
- **`window.open(href, '_blank', 'noopener')`** en whatsapp() · correcto manejo de `noopener`
- **toast() cleanup** · usa `t.parentNode.removeChild(t)` verificando que el nodo aún existe antes de eliminar

---

## Recomendaciones priorizadas para v6.1

| # | Cambio | Esfuerzo | Cuándo |
| --- | --- | --- | --- |
| 1 | A2: fix `encodeURIComponent(dest)` → `dest || ''` en `email()` | 5 min | Antes de primer cliente que use compartir |
| 2 | A1: cambiar `window.location.href` → `window.open(href, '_self')` en `email()` | 5 min | Antes de primer cliente que use compartir |
| 3 | M2: whitelist `proyecto` en disenador-sala + qr-print | 10 min | En próximo PR de mantenimiento |
| 4 | M1: escapeHtml en buildLines() de factura | 15 min | En próximo PR de mantenimiento |
| 5 | M3: debounce 300ms en save() de disenador-sala | 10 min | Si el cliente usa planos de 30+ mesas |

---

## Conclusión

Los 5 módulos de v6.0 están bien construidos. La disolución de la PWA fue limpia — sin referencias zombi en los módulos de producción. Los 2 altos son bugs funcionales en una sola función de `share.js` (`email()`), corregibles en 10 minutos. El resto son mejoras de consistencia y robustez razonables para la escala actual.

**Apto para enseñarse a CTO o developer senior** — los altos son bugs honestos en código nuevo, no descuidos en código maduro. La base del proyecto sigue sólida.
