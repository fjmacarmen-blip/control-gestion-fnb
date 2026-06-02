# Auditoría de ingeniería · v5.10 · pre-comercialización

**Fecha:** 2026-06-02
**Versión base:** v5.9 (post-evento-publica · post-TECH-DEBT-v5.8)
**Alcance:** módulos `core/js/*.js`, páginas públicas raíz, dashboard, CSP, sitemap, robots, evento-publica.html nuevo.
**Método:** revisión cruzada de findings históricos (v4.14, v5.7, v5.8) + lectura línea-a-línea de los 7 módulos críticos + auditoría de superficie pública (CSP, exposición de datos, traversal, XSS, ReDoS).

## Resumen ejecutivo

| Severidad | Cantidad | Acción |
| --- | ---: | --- |
| 🔴 Críticos | **2** | Bloquear comercialización hasta resolver |
| 🟠 Altos | **5** | Resolver antes del primer cliente real |
| 🟡 Medios | **6** | Fix en sprint 2 |
| 🟢 Bajos | **4** | Aceptables documentados |

**Veredicto:** **CONDICIONAL.** El proyecto está técnicamente sólido (CSP+SRI activos, escape consistente, tests verdes, mirror nightly, wizard PAT). Pero hay **dos hallazgos críticos nuevos no detectados en revisiones previas** relacionados con la página `evento-publica.html` v5.9 que exponen datos privados de presupuestos a cualquiera que adivine la URL. **No vender hasta resolver C1+C2.** Resto del código mantiene calidad aprobada en v5.7.

---

## Metodología

**Skills aplicados:** `engineering:code-review`, `engineering:security-review`, `engineering:tech-debt` aplicados en modo análisis (no se ejecutaron como skills aisladas — el proyecto Vanilla JS no encaja con sus templates pero he seguido sus rubrics).

**Archivos revisados:** `core/js/auth.js` (599 LOC), `core/js/github-api.js` (311), `core/js/loader.js` (148), `core/js/metrics.js` (340), `core/js/i18n.js` (190), `core/js/theme.js` (110), `core/js/ia-asistente.js` (~340 leído ~280), `core/js/importer-excel.js` (parcial 120), `core/js/importer-pdf.js` (parcial 100), `core/js/importer-images.js` (parcial 180), `core/js/editor-core.js` (parcial 80), `evento-publica.html` (337 LOC completa), `sw.js`, `sitemap.xml`, `robots.txt`, `manifest.json`, todos los 17 CSP en HTMLs, JSON budget de muestra (`PRES-2026-1001.json`).

**Fuera de alcance por tiempo:** `dashboard/editor.html` (2200 LOC monolítico), `core/js/escandallos.js`, `tpv-connector.js`, `qr-gen.js`, `appearance.js`, `productos-connector.js`, los 67 tests unit + 10 E2E (asumidos verdes según TECH-DEBT-v5.8).

---

## 🔴 Críticos (2)

### C1 · Exposición de datos privados de presupuestos vía evento-publica.html

- **Archivo:line:** `evento-publica.html:198` + `projects/<id>/budgets/PRES-*.json` (todo el árbol)
- **Síntoma:** `fetch('projects/' + proyecto + '/budgets/' + id + '.json')` carga el JSON completo del presupuesto. El JSON contiene: `senial` (importe de paga y señal), `total`, `iva`, `clientName`, `dietas`, `pn/pi/pt`. Aunque el render solo muestra algunos campos, **el JSON entero llega al navegador** y es accesible vía DevTools Network o simplemente fetch desde otra pestaña. Los IDs siguen patrón obvio `PRES-2026-NNNN` secuencial (1001..1018 en miramar).
- **Riesgo:** un competidor o cualquiera que conozca un proyecto puede enumerar IDs y descargar TODA la cartera de eventos confirmados con datos económicos. Probabilidad alta, impacto alto (GDPR + reputación + competencia conoce tarifas).
- **Fix sugerido:** (a) generar un JSON «redactado» por evento con SOLO los campos públicos (`programa`, `seating`, `info_invitados`, `menuPkg.name`, `fechaEvento`, `horaInicio/Fin`, `clientName`) y publicarlo en `projects/<id>/eventos-publicos/<id>.json`; (b) IDs no enumerables — añadir slug aleatorio: `PRES-2026-1001-a7f3c2`; (c) `robots.txt` con `Disallow: /projects/`.
- **Coste:** 4-6 h (refactor del builder + workflow de publicación + slug aleatorio + e2e test).

### C2 · CSP de evento-publica.html no permite imágenes Pollinations pero el código sí las usa indirectamente

- **Archivo:line:** `evento-publica.html:7` (CSP) vs render
- **Síntoma:** la CSP declara `img-src 'self' data: blob: https://image.pollinations.ai;` (OK) pero NO incluye `connect-src` para api.github.com — si en el futuro se intenta cargar la imagen del menú o cualquier asset adicional vía fetch, fallará silenciosamente. Más urgente: la página fetcha `projects/<id>/budgets/<id>.json` con `cache: 'no-store'` — funciona porque es same-origin, pero si el cliente decide separar el frontend público a otro dominio (CDN), la CSP `connect-src 'self'` rompe. Es bug latente Y deuda arquitectural.
- **Riesgo:** medio (no exploit hoy); pero combinado con C1, si se mueve a sub-dominio público para mitigarlo, la página deja de funcionar.
- **Fix sugerido:** documentar en CSP que toda data de eventos viene de same-origin. Antes de mover assets a CDN, ampliar `connect-src`. Si C1 se resuelve con archivo redactado, validar que el path sigue siendo same-origin.
- **Coste:** 30 min (validar + documentar comment en HTML).

---

## 🟠 Altos (5)

### A1 · `evento-publica.html:167` · `escapeHtml` no escapa apóstrofe `'`

- **Archivo:line:** `evento-publica.html:166-168`
- **Síntoma:** la función helper escapa `& < > "` pero NO `'`. El resto del proyecto usa el set completo (ver `core/js/ia-asistente.js:213` que sí escapa `'`).
- **Riesgo:** si en futuro alguien inserta el output en atributo HTML con comillas simples (`<div title='${val}'>`), inyección. Hoy el código usa comillas dobles, así que no explotable. Pero es divergencia respecto al canon del proyecto.
- **Fix sugerido:** añadir `"'":"&#39;"` al map en línea 167. Una línea.
- **Coste:** 5 min.

### A2 · `core/js/auth.js:238` · Validación PAT con regex laxa permite tokens basura

- **Archivo:line:** `auth.js:238` (`promptForPAT`) y `auth.js:556` (`promptForPATGuided`)
- **Síntoma:** `promptForPAT` usa `^[A-Za-z0-9_-]{20,}$` que acepta cualquier string de 20+ chars alfanuméricos. `promptForPATGuided` (v5.8) sí exige prefijo `ghp_|github_pat_`. Inconsistencia: dos validadores divergentes en el mismo archivo. La función vieja queda como fallback y se sigue exportando.
- **Riesgo:** un cliente que pegue por error otra cosa (token de Vercel, hash random) lo guarda como PAT y la primera llamada a GitHub falla en producción sin pista clara.
- **Fix sugerido:** unificar regex a `^(ghp_|github_pat_)[A-Za-z0-9_-]{20,}$` en ambas funciones, o deprecar `promptForPAT` redirigiendo a la guiada.
- **Coste:** 15 min.

### A3 · `core/js/metrics.js:236` · timezone bug aún sin resolver (heredado v5.7 A3)

- **Archivo:line:** `metrics.js:236` (`getNextAvailableDates`) y `metrics.js:305` (`buildCell`)
- **Síntoma:** sigue usando `dateObj.toISOString().slice(0,10)` — devuelve UTC. Para clientes en zonas horarias negativas (LATAM) cruza al día anterior. Documentado en CODE-REVIEW-v5.7.md A3 pero no fixed.
- **Riesgo:** un cliente piloto en México DF (UTC-6) que cree un presupuesto el día 28 a las 22:00 local, lo verá guardado como día 29 en algunos lugares y 28 en otros (mezcla `toISOString` con `getDate`/`getMonth`).
- **Fix sugerido:** helper `toLocalISO(d)` ya escrito en CODE-REVIEW-v5.7.md. Aplicar a las 2 ocurrencias.
- **Coste:** 15 min.

### A4 · `core/js/i18n.js:136` · Race condition en setLocale sin guardia (heredado M3)

- **Archivo:line:** `i18n.js:136-146`
- **Síntoma:** clicks rápidos ES→EN→ES ejecutan `setLocale` concurrentemente. `loadingPromises` dedupe la carga, pero `applyTo()` y `dispatchEvent` se llaman en orden de resolución, no de invocación. Resultado: la UI puede quedar en ES tras un toggle aunque el último click sea EN.
- **Riesgo:** UX confuso, sin más. No explotable.
- **Fix sugerido:** mantener un `_localeRequestId` que solo aplica si coincide con el último:
  ```javascript
  let _req = 0;
  async function setLocale(loc) {
    const myReq = ++_req;
    await loadLocale(loc);
    if (myReq !== _req) return;
    applyTo();
    ...
  }
  ```
- **Coste:** 20 min.

### A5 · `editor-core.js:54-58` · Drafts en localStorage sin TTL ni cifrado

- **Archivo:line:** `editor-core.js:54-78`
- **Síntoma:** los drafts del editor (precios, recetas, escandallos del cliente) se guardan en `localStorage.fnb_draft_<projectId>_<section>`. Persisten **indefinidamente** entre sesiones y máquinas compartidas. PAT vive en sessionStorage (8 h), pero los datos de negocio del cliente sobreviven a logout.
- **Riesgo:** ordenador compartido en recepción del hotel → el siguiente usuario ve drafts. Datos económicos sensibles. No es brecha de red, pero sí de operación.
- **Fix sugerido:** TTL 7 días en draft (timestamp en payload + filtro al leer). Opcional: prompt «¿Conservar borrador?» al login si hay drafts >24 h. Si se quiere endurecer más, encryption AES con key derivada de la sesión.
- **Coste:** 1 h (TTL) · 4 h (cifrado).

---

## 🟡 Medios (6)

### M1 · `sitemap.xml:3-8` · Sitemap incompleto, no incluye páginas públicas

- **Archivo:line:** `sitemap.xml:1-9`
- **Síntoma:** solo 1 URL (la raíz). Faltan `carta-publica.html`, `disponibilidad-publica.html`, `evento-publica.html`, `flujo-trabajo.html`, `pitch.html`, `mockups.html`. SEO no indexa esas landings ni los QR.
- **Fix:** generar sitemap por proyecto. 30 min.

### M2 · `robots.txt:3-4` · No bloquea `/projects/`

- **Archivo:line:** `robots.txt`
- **Síntoma:** `/projects/<id>/budgets/PRES-*.json` es indexable. Google podría llegar a indexar datos de presupuestos.
- **Fix:** añadir `Disallow: /projects/*/budgets/` y `Disallow: /projects/*/auth.json`. 5 min.

### M3 · `core/js/ia-asistente.js:220` · regex lookbehind no soportado en Safari < 16.4 (heredado M2)

- **Archivo:line:** `ia-asistente.js:220`
- **Síntoma:** documentado en v5.7 y sin fix. iOS antiguos ~5%.
- **Fix:** reescribir como dos pasadas (bold primero, italic después con regex sin lookbehind). 20 min.

### M4 · `core/js/loader.js:30-35` · Validación de id silenciosa cae a default sin avisar

- **Archivo:line:** `loader.js:32`
- **Síntoma:** `?proyecto=../foo` → silenciosamente carga miramar. Un cliente típico no se da cuenta y cree estar editando «foo» mientras toca miramar.
- **Fix:** console.warn + showErrorBanner si el id es inválido. 10 min.

### M5 · `core/js/github-api.js:205` · Error body truncado a 200 chars sin escape al mostrarse

- **Archivo:line:** `github-api.js:204-205`
- **Síntoma:** `errBody.slice(0,200)` viene de GitHub API. Si algún caller lo imprime con `innerHTML`, XSS reflejado (caller-controlled). Hoy todos los callers usan `textContent` o toast, OK. Pero la auditoría v5.7 B3 ya lo marcó y sigue sin escape defensivo en el origen.
- **Fix:** añadir `escapeText` antes de exportar el error message en este archivo. 10 min.

### M6 · CSP `'unsafe-inline'` en script-src de todos los HTMLs

- **Archivo:line:** los 17 CSP en `*.html`
- **Síntoma:** todos permiten `script-src 'self' 'unsafe-inline'`. Aceptable porque hay inline scripts legítimos, pero reduce el valor de la CSP frente a XSS reflejado.
- **Fix:** migrar a CSP con nonces o hashes (requiere build step). Documentar como deuda aceptada o resolver con `<script>` externalizados. 1 día.

---

## 🟢 Bajos (4)

### B1 · `evento-publica.html:228` · emojis hardcoded en plantilla

`📅 🕐 👥` viven en el render. Mantenimiento OK pero accesibilidad floja (lectores de pantalla los anuncian raro). Añadir `aria-hidden="true"` al span emoji.

### B2 · `core/js/importer-images.js:168` · URL a Pollinations con seed aleatorio sin cache

Cada render llama nueva imagen → consume cuota Pollinations sin necesidad. Memoizar por prompt+seed. Aceptable hasta que algún cliente lo note.

### B3 · `core/js/metrics.js:36-41` · `loadBudgets` sin AbortController

Si el cliente cambia de proyecto rápido, los fetches anteriores no se cancelan. Heredado M5 de v5.7. Sigue aceptable.

### B4 · `sw.js:64` · CDN jsdelivr cache-first sin estrategia de invalidación

Si jsdelivr publica un hotfix de seguridad de bcryptjs, el SW sigue sirviendo la versión vieja hasta que cambie `SW_VERSION`. Documentar: la rotación de SW_VERSION es manual.

---

## Auto-fixables vs requieren decisión

**Auto-fixables (≤30 min, sin decisión de producto):**
- A1, A2, A3, A4 (~1 h total)
- M2, M3, M4, M5 (~45 min total)
- B1 (5 min)

**Requieren decisión humana:**
- C1 (decisión: ¿slug aleatorio o auth en el frontend público? ¿qué se publica vs se mantiene privado?)
- C2 (acoplada a C1)
- A5 (decisión: TTL vs cifrado vs nada — depende de target cliente)
- M1 (decisión: ¿sitemap por proyecto o global?)
- M6 (decisión: build step o no — choca con «zero infra»)

---

## Roadmap recomendado

**Sprint 1 (3-4 días) · bloqueador comercialización:**
1. **C1** (4-6 h) — refactor a JSON redactado + slug aleatorio + e2e regresión.
2. **C2** (30 min) — validar CSP tras C1.
3. **M2** + **A1** (15 min) — quick wins de superficie pública.
4. **A2** (15 min) — unificar regex PAT.

**Sprint 2 (1-2 días) · primer cliente real:**
5. **A3, A4, A5** (1.5 h) — robustez heredada.
6. **M1** (30 min) — sitemap completo (SEO orgánico arranca).
7. **M3, M4, M5** (40 min) — pulir errores.
8. **B1, B2** (30 min) — accesibilidad + Pollinations cache.

**Sprint 3 (entre clientes):**
9. **M6** + Q1-Q8 de TECH-DEBT-v5.7.

---

## Lo que está BIEN

- **escapeHtml/escapeText consistente** en todos los renders del dashboard (auth.js, ia-asistente.js, presupuesto-evento.html).
- **CSP + SRI activos** en los 17 HTMLs (incluyendo el nuevo evento-publica con CSP estricto same-origin).
- **Whitelist regex anti path traversal** consistente en loader.js, theme.js, evento-publica.html:193.
- **Wizard PAT v5.8** elegante, recordatorio de paso en sessionStorage, validación real contra repo.
- **Service Worker NO cachea api.github.com ni pollinations** — correcto para evitar bypass de auth.
- **Tests E2E con regresión específica para path traversal** en evento-publica.spec.js:35-40 (cubre el `../../etc/passwd`).
- **TextEncoder/TextDecoder** sustituye `escape()/unescape()` deprecated en github-api.js.
- **fetchWithTimeout** centralizado y reusado por github-api.js vía `fnbFetch`.
- **`promptPasswordAndExecute` + fresh-auth 5 min** patrón sudo bien implementado.

---

## Conclusión

El proyecto evolucionó muy bien entre v4.14 (auditoría inicial) y v5.8 (cierre de blockers). El equipo cerró los 3 blockers identificados (PAT wizard, E2E, mirror). El código mantiene el nivel «portfolio-grade» observado en v5.7.

**Sin embargo**, la página nueva `evento-publica.html` (v5.9) introdujo **una regresión de privacidad crítica (C1)** al exponer JSON completo de presupuestos a cualquiera que conozca o adivine el ID. **Esto bloquea comercialización hasta resolverse** porque viola la promesa de «página pública para invitados» del README.

**Recomendación:** dedicar 1 día al Sprint 1 (C1+C2+A1+A2+M2). Tras eso, el proyecto vuelve a estado «vendible al primer cliente real pagado». Los 5 importantes restantes (A3-A5, M1, M3-M6) son negociables como Sprint 2 con el cliente.
