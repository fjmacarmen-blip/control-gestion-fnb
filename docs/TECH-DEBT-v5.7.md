# Auditoría de deuda técnica · v5.7

**Fecha:** 2026-05-31
**Tras:** 28 versiones (v4.1 → v5.6) · 36 PRs · 3 ADRs
**Método:** revisión cruzada de código + historial + ADRs + decisiones explícitas pendientes

## Resumen ejecutivo

| Categoría | Items | Coste total estimado |
| --- | ---: | --- |
| 🔴 Blockers primer cliente real | **3** | 2-3 días |
| 🟠 Importantes pre-producción | **6** | 4-5 días |
| 🟡 Mejoras de calidad | **8** | 5-7 días |
| 🟢 Aceptable · no urgente | **7** | n/a |

**Total estimado para "production-ready":** 11-15 días de trabajo concentrado.

**Decisión recomendada:** los 3 blockers son obligatorios. Los 6 importantes se pueden negociar con el cliente como "fase 2". Los demás son refactor que mejor hacer entre clientes.

---

## 🔴 Blockers para primer cliente real pagado

> **STATUS update v5.8 (2026-06-02):** los 3 blockers han sido cerrados.
> Ver [`TECH-DEBT-v5.8.md`](TECH-DEBT-v5.8.md) para el detalle del cierre.
> Resumen: B1 → wizard guiado de PAT, B2 → 10 tests Playwright en CI,
> B3 → workflow `mirror-client-repos.yml` con cron nightly.

### B1 · Onboarding asistido del PAT

**Síntoma:** hoy el cliente tiene que crear su Personal Access Token de GitHub a mano siguiendo doc del ADR 011. Para un hostelero de 55 años eso es fricción inaceptable.

**Origen:** decisión D5 del arquitectura-plataforma.md — escritura vía GitHub API con PAT del cliente.

**Coste:** 1 día.

**Solución sugerida:**
- Vídeo de 90 segundos paso a paso (Loom o similar)
- Wizard interactivo que abre la URL correcta de GitHub con los scopes pre-rellenados
- O bien: backend mínimo (Cloudflare Worker) que mantenga un único PAT del super-admin y la app se autentica contra él

### B2 · Sin tests E2E

**Síntoma:** 67 tests unitarios. **Cero** tests E2E del flujo crítico (login → editar menú → publicar → ver en frontend público).

**Origen:** decisión deliberada de no añadir CI E2E hasta tener un caso real.

**Coste:** 1-2 días para Playwright + 5 tests del flujo crítico.

**Solución sugerida:** GitHub Action con Playwright headless que:
1. Levante el servidor estático
2. Login al dashboard
3. Edite una receta
4. Publique (modo dry-run)
5. Verifique que aparece en presupuesto-evento

### B3 · No hay backups del repo del cliente

**Síntoma:** el cliente vive en su repo de GitHub. Si por error elimina la organización o cierra la cuenta, pierde TODO. No hay sistema de mirror o backup automático.

**Origen:** asumimos que GitHub = backup. Pero el cliente sí puede borrarse a sí mismo.

**Coste:** 0.5 días (mirror nightly a un repo nuestro privado).

**Solución sugerida:** GitHub Action programada (cron) que hace `git mirror` del repo del cliente a un bucket de Cloudflare R2 o a un repo backup.

---

## 🟠 Importantes pre-producción seria

### I1 · Logo profesional

Hoy es texto "F&B" con degradado. Para vender en serio necesita marca real. Se aborda en v5.7.

### I2 · Plantilla de propuesta económica editable

Mencionada en COMERCIALIZACION.md sección "Materiales semana 2". Sin ella, cada email comercial de Paco es construir desde cero. Se aborda en v5.7 (`docx`).

### I3 · A4 del code-review · i18n no aplica a contenido dinámico

Ver CODE-REVIEW-v5.7.md A4. Hoy la UI cambia entre ES/EN pero las cards/eventos/menús renderizados con JS quedan en español. Estado: i18n al 70%. Falta 30% para coverage completa.

**Coste:** 1 hora.

### I4 · A1 + A2 del code-review · Chat IA con histórico/system prompt redundante

Cada turno envía el contexto completo. Acceptable hoy con uso bajo, pero a escala satura Pollinations. **Coste:** 30 min.

### I5 · Generación de PDFs robusta

Hoy depende de "el usuario hace Ctrl+P en Chrome". Funciona pero requiere acción manual. Para enviar propuestas profesionales, mejor:
- O instalar Playwright headless en CI para generar PDFs server-side
- O usar API gratuita tipo CloudConvert (riesgo: dependencia externa)

**Coste:** 1 día.

### I6 · Mecanismo de actualización del cliente

Cuando publique v6.0 con un breaking change (cambio de schema), ¿cómo migra el cliente sin perder sus datos? Hoy no hay sistema. **Necesario antes de hacer cambios incompatibles.**

**Coste:** 1 día (función `migrate(fromVersion, toVersion, projectData)` con tests).

---

## 🟡 Mejoras de calidad

### Q1 · Cobertura de tests del frontend público

Solo tenemos unit tests de motores (`metrics`, `escandallos`, etc.). El frontend público (presupuesto-evento, recetario) no tiene tests automatizados. Se cubrirá con E2E (B2).

### Q2 · Modularización JS

Archivos `core/js/*.js` son IIFEs globales con `window.fnbX`. Funciona pero no escala bien. Migrar a ES modules cuando haya razón concreta (tree-shaking, lazy load más fino).

### Q3 · Type safety

JSDoc parcial. Sin TypeScript. Para portfolio personal sobra; para equipo escala mal. Mantener JSDoc al menos en módulos críticos.

### Q4 · `dashboard/editor.html` tiene 2200 LOC

Es el archivo más grande del proyecto. Mezcla 7 secciones + 5 modales. Compartió bien la lógica con `core/js/editor-core.js` pero el HTML/JS del propio editor sigue monolítico. Refactorizable a 7 archivos `editor-{section}.js`.

### Q5 · CSS variables inconsistentes

`dashboard-theme.css` y `themes.css` definen variables similares con prefijos distintos (`--bg-base` vs `--bg`). Sin convención clara. Para mantener escala, unificar nomenclatura.

### Q6 · M3 del code-review · Race condition en setLocale

Cambio rápido de idioma puede aplicar el equivocado. Edge case real.

### Q7 · M4 del code-review · Sin debounce en checkAvailability

Para 100+ presupuestos, perceptible. Debounce 250ms.

### Q8 · ADR pendiente · webhook TPV con backend

Cuando llegue el primer cliente con necesidad real de eventos TPV en tiempo real, hay que escribir ADR 014 sobre el backend mínimo (Cloudflare Worker como receptor). Pendiente desde ADR 013.

---

## 🟢 Aceptable · no urgente

### A1 · `OFERTA BODAS 2011.xls` en archive/

Excel legacy del antiguo hotel. En `.gitignore`, no se commitea. Documentado.

### A2 · Carpetas `mockups/` y `hotel/`

Residuales del pre-v4.1. Bajo riesgo de confusión por estar fuera del flujo nuevo. Borrarlas en spring cleaning.

### A3 · `B1 code-review` · normalizeToBase null silencioso

Sí, falla silenciosamente al mezclar masa+volumen. El usuario ve cobertura baja y arregla. Aceptable.

### A4 · Sin sitemap.xml por proyecto

Cada hotel tendría que tener su sitemap. Hoy solo hay uno general. Aceptable hasta SEO orgánico activo.

### A5 · PWA solo para sala-móvil

`carta-publica.html` no es PWA instalable. ¿Debería serlo? Probablemente no — los clientes la abren una vez vía QR, no necesitan instalarla.

### A6 · `i18n` solo en ES + EN

No hay portugués, catalán, francés. Cuando llegue el cliente que lo pida, se traduce. Estructura preparada.

### A7 · Dependencias CDN

8 paquetes vía jsdelivr (bcryptjs, xlsx, papaparse, pdf.js, chart.js, browser-image-compression, qrcode-generator, marked). Todos pineados con SRI sha384. Si jsdelivr cae, la app degrada pero no rompe (los críticos tienen fallback). Aceptable.

---

## Roadmap sugerido

### Sprint 1 · pre-piloto (4-6 días)
- B1 Onboarding asistido del PAT
- B2 Tests E2E con Playwright
- B3 Mirror automático del repo cliente
- I1 Logo profesional ← se aborda en v5.7
- I2 Propuesta económica editable ← se aborda en v5.7

### Sprint 2 · post-piloto (3-4 días)
- I3 i18n cobertura completa con dinámico
- I4 Optimización chat IA (cache + ventana histórico)
- I5 Generación de PDFs robusta (Playwright headless)
- I6 Sistema de migración entre versiones

### Sprint 3 · mejoras (5-7 días entre clientes)
- Q1 a Q8 según prioridad real

---

## Conclusión

Para portfolio personal: **el proyecto está en muy buen estado**. Para vender al primer cliente real: **los 3 blockers son obligatorios**. Sin ellos, el cliente queda atascado en el onboarding (B1) o pierde datos en accidente (B3) o nos enfrentamos a bugs no detectados (B2).

Los 6 importantes son negociables pero recomendables. Si Paco quiere salir con cliente pagado en 30 días, hay que invertir 4-6 días en los 3 blockers + I1 + I2 (ya en v5.7).
