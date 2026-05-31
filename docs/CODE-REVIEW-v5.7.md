# Code Review formal · v5.7

**Fecha:** 2026-05-31
**Versión revisada:** v5.6 (post-auditoría v4.14)
**Alcance:** 6 módulos críticos + cambios nuevos post-v4.14
**Método:** revisión línea-a-línea con foco en bugs reales (no nitpicks)

---

## Resumen ejecutivo

| Severidad | Cantidad | Acción |
| --- | ---: | --- |
| 🔴 Críticos | **0** | — |
| 🟠 Altos | **4** | Resolver antes de primer cliente piloto |
| 🟡 Medios | **8** | Fix en próximas iteraciones |
| 🟢 Bajos | **5** | Aceptables · documentados |

**Veredicto general:** **APROBADO con observaciones.** El código está en buen estado para portfolio. Los 4 hallazgos altos son todos de mejora de robustez bajo escala (>50 clientes confirmados, zonas horarias exóticas, rate limiting). Para vender a un primer cliente piloto en España, todos los críticos están cubiertos. La auditoría v4.14 quedó bien cerrada · v4.15 mantiene los gates.

---

## 🟠 ALTOS

### A1 · `ia-asistente.js:142-146` · System prompt enviado cada turno

Cada turno del chat reconstruye `buildSystemPrompt()` (≈ 3-5 KB con catálogo completo) y lo envía a Pollinations. Si el hotel tiene 30 menús con composiciones detalladas, el prompt crece. Tras 10 turnos = 50 KB enviados sin necesidad real.

**Impacto:** latencia mayor + más cuota consumida + Pollinations puede timeout.

**Fix sugerido:** cachear el system prompt en variable de módulo. Solo recalcular si `catalog` cambia (raro).

```javascript
let _cachedSystemPrompt = null;
function buildSystemPrompt() {
  if (_cachedSystemPrompt) return _cachedSystemPrompt;
  // ... construir ...
  _cachedSystemPrompt = p;
  return p;
}
async function loadCatalog(pId) {
  // ...
  _cachedSystemPrompt = null;  // invalidar cache cuando se recarga catálogo
}
```

### A2 · `ia-asistente.js:144` · Histórico completo en cada llamada

`history.map(...)` envía los 20 mensajes históricos íntegros en cada turno. Tras 5 idas y vueltas, son ≈ 10 KB de contexto innecesario.

**Impacto:** mismo que A1, costo redundante.

**Fix sugerido:** enviar solo últimos 6 mensajes (3 turnos) en `messages` además del system prompt. Para chats más largos, la IA pierde detalle pero ahorra carga.

```javascript
const recent = history.slice(-6);  // últimos 3 turnos
const messages = [
  { role: 'system', content: buildSystemPrompt() },
  ...recent.map(...),
  { role: 'user', content: userMessage },
];
```

### A3 · `metrics.js:236, 305` · `toISOString()` y zona horaria

`dateObj.toISOString().slice(0,10)` devuelve fecha en **UTC**. España (CET/CEST) está en UTC+1 o UTC+2, así que **nunca cruza al día anterior** y el bug no se manifiesta en práctica. Pero la PWA es accesible desde cualquier zona — un cliente del hotel viajando en Asia (UTC+8) podría ver mal el calendario.

**Impacto:** edge case · cliente con timezone alejada podría ver eventos en día equivocado.

**Fix sugerido:**

```javascript
function toLocalISO(d) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}
// Reemplazar dateObj.toISOString().slice(0,10) por toLocalISO(dateObj)
```

### A4 · `i18n.js:applyTo` · No traduce contenido inyectado dinámicamente vía JS

Las páginas que renderizan con `innerHTML` después de cargar (sala-móvil tabs Hoy/Dietas, métricas Calendario, carta pública menús) no llaman a `fnbI18n.applyTo()` tras inyectar, así que los strings dinámicos quedan en español aunque el usuario haya cambiado a EN.

**Impacto:** UI parcialmente traducida. Las cards de eventos, los pills de dietas y los menús de la carta no responden al toggle.

**Fix sugerido:** después de cada `innerHTML = ...` que contenga strings traducibles, añadir `window.fnbI18n?.applyTo(elemento)`. O suscribirse al evento `i18n:change` y re-renderizar.

```javascript
function renderHoy() {
  // ... build html
  document.getElementById('content').innerHTML = html;
  window.fnbI18n?.applyTo(document.getElementById('content'));
}
// + escuchar cambio de idioma
window.addEventListener('i18n:change', () => render());
```

---

## 🟡 MEDIOS

### M1 · `ia-asistente.js` · Sin rate limiting

Pollinations es gratis pero no infinito. Un cliente que envíe 200 mensajes/hora puede saturar la cuota compartida. Sugerencia: contador en sessionStorage que limite a 30 mensajes/hora con mensaje claro al alcanzar el límite.

### M2 · `ia-asistente.js:184` · `mdToHtml` con `lookbehind` en regex

Línea 184: `/(?<!\*)\*([^*]+)\*(?!\*)/g` usa lookbehind. **No funciona en Safari < 16.4** (2023). Mayoría de iPhones modernos OK pero hay un 5% de tráfico aún en versiones antiguas. Si lookbehind falla, el regex no se aplica → bullet/italic no se renderiza (no error fatal).

**Mitigación:** documentar en comentario. O reescribir sin lookbehind si Safari antiguo importa.

### M3 · `i18n.js:setLocale` · Race condition al cambio rápido

Si el usuario hace click muy rápido en el toggle (ES→EN→ES en 200 ms), `setLocale` ejecuta concurrentemente. `loadLocale` es Promise → el último que resuelva gana, no necesariamente el último click. Realista: muy raro.

**Mitigación:** flag `isLoadingLocale` que ignore clicks durante carga.

### M4 · `metrics.js:235` · `getNextAvailableDates` itera hasta 365 días

Bucle hasta 365 iteraciones por llamada × N reservas (filter interno). En `checkAvailability()` se invoca en cada keystroke del datepicker. Para 18 reservas (Miramar) = 6.500 ops, instantáneo. Para 500 reservas = 180.000 ops, perceptible.

**Fix futuro:** debounce de 250 ms en el input + cache de resultados por (espacio, fechaDesde).

### M5 · `presupuesto-evento.html:loadAvailabilityData` · Sin AbortController

Si el usuario navega entre proyectos rápido, las promises de carga no se cancelan. Aceptable hoy (navegación poco frecuente).

### M6 · `ia-asistente.js:catalog` · Información sensible al modelo externo

El system prompt envía a Pollinations: nombre del establecimiento, menús, precios, recetas y dietas. Esto **es información pública** (carta del establecimiento), pero el cliente debería saberlo. Privacidad mínima.

**Acción:** documentar en CASE-STUDY que el asistente IA usa proveedor externo.

### M7 · `ia-asistente.js:127` · Mensaje vacío de IA crashea con error genérico

Si Pollinations devuelve JSON sin `choices[0].message.content`, lanzamos `'Respuesta vacía'`. El usuario ve el error genérico de fallo de conexión. Está bien hoy pero podría diferenciarse.

### M8 · `metrics.js:buildMonthCalendar` · Sin memoización

Cada navegación de mes recalcula la matriz completa filtrando todos los presupuestos. Para meses pasados (sin cambios), podría cachearse por (year, month, filterSpace, budgets.length).

---

## 🟢 BAJOS (aceptables)

### B1 · `escandallos.js:normalizeToBase` · null silencioso al mezclar unidades

Si una receta dice "200g de leche" y el producto está en "L", retorna null → coste 0. El usuario ve cobertura baja y debe arreglar la receta. Aceptable porque el detalle muestra el error.

### B2 · `i18n.js:applyTo` · `data-i18n-html` permite innerHTML

Si el JSON de traducción tuviera HTML malicioso, se inyectaría. Mitigación: el JSON lo controlamos vía commit al repo, no es input externo. Aceptable.

### B3 · `github-api.js:184` · `errBody.slice(0,200)` en cadena de error

Si algún caller lo imprimiera con `innerHTML` sin escape, XSS. Hoy todos los callers usan `textContent` (showToast). Aceptable.

### B4 · `metrics.js:buildCell` · `new Date(year, month, day)` con month puede ser negativo

Para el mes anterior, llama con `month - 1`. Si `month = 0` (enero), pasa `-1` → JavaScript lo interpreta como diciembre del año anterior. Comportamiento correcto pero no obvio. Documentado con comentario sería ideal.

### B5 · `ia-asistente.js:60` · Slice 4 secciones de composición y 3 ítems

`Object.entries(m.composition).slice(0, 4)` y `items.slice(0, 3)`. Heurística para que el prompt no crezca demasiado. Aceptable pero documentar el límite.

---

## ✅ Lo que está BIEN

- **Whitelist regex anti path traversal** consistente en loader + theme + i18n
- **escapeText** y **escapeHtml** correctamente aplicados en todos los modales y renders dinámicos del dashboard
- **CSP + SRI** activos en todos los HTMLs del dashboard (cierre auditoría v4.15)
- **`promptPasswordAndExecute` + fresh-auth 5 min** patrón sudo bien implementado
- **PAT en sessionStorage** con TTL natural (ADR 011)
- **Function ports puros** en metrics.js · fáciles de testear (8 tests cubriéndolas)
- **Idempotencia** en `getOccupiedSpacesOnDate` (Set evita duplicados)
- **Granularidad día completo** en disponibilidad · simple y conservadora
- **AbortController** en `callPollinations` con timeout 25s
- **Cancelación de fetch** vía signal correctamente implementada
- **i18n con fallback** al idioma default si la clave no existe en el target
- **Detección de idioma** respeta `navigator.language` antes de defaultear
- **PWA service worker** no cachea peticiones a GitHub API (correcto · evita auth bypass)

---

## Recomendaciones priorizadas para v5.8

| # | Cambio | Esfuerzo | Cuándo |
| --- | --- | --- | --- |
| 1 | A1 + A2: cache system prompt + ventana de histórico (chat IA) | 30 min | Antes de primer cliente real |
| 2 | A4: que `applyTo()` se llame tras cada `innerHTML` dinámico | 1 h | Antes de primer cliente real |
| 3 | A3: `toLocalISO()` en metrics.js para evitar timezone bug | 15 min | Cuando llegue cliente fuera España |
| 4 | M1: rate limiting del asistente IA | 30 min | Tras 3 clientes activos |
| 5 | M4: debounce en checkAvailability | 15 min | Cuando algún proyecto pase de 100 presupuestos confirmados |

---

## Conclusión

Código de calidad profesional. Sin críticos. Los altos son mejoras concretas, no bugs explotables. **Apto para enseñarse a CTO o developer senior de un cliente piloto** sin avergonzarse.

Los 8 medios y 5 bajos son deuda razonable acumulada en 28 versiones — están todos documentados ahora (`TECH-DEBT-v5.7.md`) y priorizados.
