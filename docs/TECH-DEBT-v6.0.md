# Auditoría de deuda técnica · v6.0

**Fecha:** 2026-06-25
**Tras:** 36 versiones (v4.1 → v6.0) · 40+ PRs · 3 ADRs
**Método:** revisión cruzada de código + historial + cierre formal de v5.8 + módulos nuevos v6.0

## Resumen ejecutivo

| Categoría | Items | Estado vs v5.8 |
| --- | ---: | --- |
| 🔴 Blockers primer cliente real | **0** | ✅ Todos cerrados en v5.8 |
| 🟠 Importantes pre-producción seria | **4** | I3 + I5 heredados · I6 urgente · I7 nuevo |
| 🟡 Mejoras de calidad | **9** | Q1-Q8 heredados · Q9 nuevo v6.0 |
| 🟢 Aceptable · no urgente | **6** | A2-A7 heredados · A5 cerrado por v6.0 |

**Estado general:** el proyecto sigue en estado «vendible al primer cliente real pagado». Los 3 blockers originales fueron cerrados en v5.8. La deuda nueva de v6.0 es manejable: 1 item urgente (I6 migración) y 1 nuevo importante (I7 tests E2E páginas standalone). La disolución de la PWA cerró limpiamente el item A5 de la deuda anterior.

---

## ✅ Cerrado desde v5.7 / v5.8

| ID | Item | Versión cierre | Notas |
| --- | --- | --- | --- |
| B1 | Onboarding asistido del PAT | v5.8 | Wizard 3 pasos en `auth.js` |
| B2 | Tests E2E con Playwright | v5.8 | 10 tests · CI verde |
| B3 | Mirror automático del repo cliente | v5.8 | Workflow nightly + `config/clients.json` |
| I1 | Logo profesional | v5.7 | 3 propuestas en `branding/` |
| I2 | Plantilla propuesta económica | v5.7 | `.docx` editable en `templates-comerciales/` |
| I4 | Chat IA · histórico + cache system prompt | v5.8 | 50% reducción payload Pollinations |
| A5 | PWA solo para sala-móvil | v6.0 | PWA disuelta · `sala.html` integrada en dashboard |

---

## 🟠 Importantes pre-producción seria

### I3 · i18n dinámico incompleto (heredado de v5.7)

`fnbI18n.applyTo()` no se llama tras `innerHTML` dinámico en sala.html, métricas, carta pública. Si el usuario cambia de idioma, las cards y menús renderizados con JS quedan en español aunque el selector muestre EN.

**Origen:** A4 del `CODE-REVIEW-v5.7.md`.

**Coste:** 1 hora. Añadir `window.fnbI18n?.applyTo(el)` tras cada bloque de render dinámico + `addEventListener('i18n:change', rerender)`.

**Urgencia:** baja mientras el mercado objetivo sea exclusivamente España. Sube si Paco tiene contactos en establecimientos de Gibraltar (bilingüe EN/ES).

### I5 · Generación de PDFs robusta (heredado de v5.7)

Los documentos del proyecto (presupuesto, factura, QR, plano) dependen de que el usuario haga Ctrl+P. Funciona pero no es profesional para envío automático a clientes.

**Opciones:**
1. Playwright headless en CI que genera PDFs on-demand y los sube a una carpeta del repo.
2. API externa (CloudConvert, pdfShift) con clave de API del super-admin.

**Coste:** 1 día.

**Urgencia:** baja hasta que un cliente pida "mándame el presupuesto por email directo desde la plataforma".

### I6 · Migración entre versiones (heredado de v5.7 · URGENTE en v6.0)

v6.0 introdujo cambios de schema reales: disolución de `sala-movil.html`, nuevos campos en presupuesto (`evento_publico`), nuevas rutas. Si un cliente actualiza su fork a v6.0 sin migración, puede encontrar referencias a rutas eliminadas en sus accesos directos y en sus configs de menú.

**Estado actual:** no hay función `migrate(fromVersion, toVersion, projectData)`. Los datos de proyecto (`config.json`, `menus.json`, etc.) no tienen campo `_schemaVersion`.

**Coste:** 1 día.
- Añadir `_schemaVersion` a `config.json` de cada proyecto.
- Función `migrate()` en `core/js/loader.js` que detecta versión antigua y aplica transformaciones.
- Test unitario por cada migración (v5.x → v6.0).

**Urgencia:** ALTA. Necesario antes de que Paco actualice el repo de un cliente real.

### I7 · Tests E2E para páginas standalone v6.0 (nuevo)

Las 4 páginas nuevas de v6.0 no tienen cobertura Playwright:
- `core/pages/disenador-sala.html` — flujo drag-drop + guardar en localStorage
- `core/pages/factura-servicio.html` — renderizado desde sessionStorage
- `core/pages/qr-print.html` — generación QR carta + evento con hash SHA-256
- `dashboard/sala.html` — login necesario · tabs + carga de eventos del día

Los 10 tests actuales de `e2e/` no tocan ninguna de estas páginas.

**Coste:** 1-2 días para 4-6 specs nuevos en `e2e/`.

**Urgencia:** media. Los tests actuales cubren el flujo crítico de presupuesto. Las páginas v6.0 son nuevas y sin cobertura hay riesgo de regresión silenciosa.

---

## 🟡 Mejoras de calidad

### Q1 · Cobertura de tests del frontend público

Tests unitarios cubren motores (`metrics`, `escandallos`, `loader`). El frontend público (presupuesto-evento, recetario, carta-pública) no tiene tests automatizados propios. Se cubre con E2E (B2 cerrado), pero cobertura es parcial.

### Q2 · Modularización JS

Archivos `core/js/*.js` son IIFEs globales con `window.fnbX`. Funciona y escala para el tamaño actual. Migrar a ES modules cuando haya razón concreta (tree-shaking, lazy load más fino). `share.js` añade un patrón nuevo (`window.fnbShare`) que sigue el mismo estilo — consistente.

### Q3 · Type safety

JSDoc parcial. Sin TypeScript. Para portfolio personal sobra; para un equipo de 2+ escala mal. Mantener JSDoc en módulos críticos (`loader.js`, `metrics.js`, `share.js`).

### Q4 · `dashboard/editor.html` tiene ~2200 LOC

Mezcla 7 secciones + 5 modales. El módulo compartido `editor-core.js` funciona bien pero el HTML/JS inline del editor sigue monolítico. Refactorizable a 7 archivos `editor-{section}.js` si la base crece más de 3000 LOC.

### Q5 · CSS variables inconsistentes entre temas

`dashboard-theme.css` usa `--bg-base`, `--bg-surface`, `--text-muted`. `themes.css` (páginas frontend) usa `--bg`, `--bg-surface`, `--text-soft`. Los módulos nuevos de v6.0 mezclan ambas convenciones (`disenador-sala.html` usa el patrón dashboard, `factura-servicio.html` usa el patrón themes). No causa bugs pero complica el mantenimiento de una paleta unificada.

### Q6 · Race condition en `i18n.js:setLocale`

Click rápido ES→EN→ES en < 200ms puede aplicar el idioma incorrecto porque las Promises de `loadLocale` se resuelven en orden arbitrario. Fix: flag `isLoadingLocale` que ignore clicks durante carga. Edge case real pero muy raro.

### Q7 · Sin debounce en `checkAvailability`

Para 100+ presupuestos, el recálculo en cada keystroke del datepicker es perceptible. Debounce 250ms.

### Q8 · ADR pendiente · webhook TPV con backend

Cuando llegue el primer cliente con necesidad real de eventos TPV en tiempo real, hay que escribir ADR 014 sobre el backend mínimo. Pendiente desde ADR 013.

### Q9 · `share.js:email()` · dos bugs menores (nuevo · ver CODE-REVIEW-v6.0 A1 + A2)

`encodeURIComponent(dest)` codifica el `@` del destinatario. `window.location.href = href` navega la página actual. Ambos corregibles en 10 minutos antes del primer uso en producción.

---

## 🟢 Aceptable · no urgente

### A2 · Carpetas `mockups/` y `hotel/`

Residuales del pre-v4.1. Bajo riesgo de confusión. Borrarlas en spring cleaning.

### A3 · `normalizeToBase` null silencioso al mezclar unidades

Falla silenciosamente al mezclar masa+volumen en escandallos. El usuario ve cobertura baja y corrige la receta. Aceptable.

### A4 · Sin sitemap.xml por proyecto

Solo hay uno general. Aceptable hasta SEO orgánico activo.

### A6 · `i18n` solo en ES + EN

Sin portugués, catalán, francés. Estructura preparada para añadir cuando un cliente lo pida.

### A7 · Dependencias CDN

8 paquetes vía jsdelivr con SRI sha384. Si jsdelivr cae, la app degrada pero no rompe. Aceptable.

### A8 · `disenador-sala.html` · `legacyCopy` con execCommand obsoleto (nuevo · ver CODE-REVIEW-v6.0 B1)

Fallback del fallback del portapapeles. Funciona hoy. No urgente.

---

## Roadmap actualizado

### Sprint 2 · pre-cliente real (2-3 días) — cuando llegue primer contrato

- **I7** Tests E2E páginas standalone v6.0 (4-6 specs nuevos en `e2e/`)
- **Q9** Fix `email()` en `share.js` (10 min · ver CODE-REVIEW-v6.0 A1+A2)
- **I6** Sistema de migración + `_schemaVersion` en `config.json`

### Sprint 3 · post-piloto (2-3 días)

- **I3** i18n dinámico (1 h) — si el cliente tiene staff bilingüe
- **I5** PDFs robustos (1 día) — cuando el cliente pida envío automático
- **Q5** Unificar nomenclatura CSS variables

### Sprint 4 · entre clientes (5-7 días)

- Q1-Q8 según prioridad real manifestada por el uso

---

## Conclusión

El proyecto está en buen estado estructural. Los 3 blockers pre-piloto de v5.7 quedaron cerrados en v5.8. v6.0 añade deuda razonable:
- 1 item de cierre obligatorio antes del primer cliente real (I6 · migración).
- 1 item técnico nuevo urgente (I7 · E2E de páginas standalone).
- 2 bugs puntuales en `share.js` corregibles en 10 min (Q9 / CODE-REVIEW-v6.0 A1+A2).

Para portfolio personal y primer piloto comercial: **el proyecto está listo**. Para producción con múltiples clientes activos y actualizaciones frecuentes: I6 (migración) es la única pieza que puede causar problemas reales si se actualiza el repo de un cliente sin un procedimiento formal.
