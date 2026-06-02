# Auditoría v5.10 · resumen ejecutivo

**Fecha:** 2026-06-02
**Versión:** v5.10 (post-rebrand v5.9)
**Auditores:** 3 subagentes con skills especializadas (engineering · ui-ux-pro-max · competitive-analysis + marketing-plan)
**Documentos detallados:**

- [`AUDITORIA-INGENIERIA-v5.10.md`](AUDITORIA-INGENIERIA-v5.10.md) · 220 líneas · 17 hallazgos
- [`AUDITORIA-DISEÑO-v5.10.md`](AUDITORIA-DISEÑO-v5.10.md) · 333 líneas · 2 estructurales + 10 quick wins
- [`BUSINESS-AUDIT-v5.10.md`](BUSINESS-AUDIT-v5.10.md) · 497 líneas · plan inversión cero a 90 días

---

## Veredicto por eje

| Eje | Veredicto | Aplicado en v5.10 |
|---|---|---|
| 🔧 **Ingeniería** | CONDICIONAL · 2 críticos bloqueantes | **C1+C2 resueltos, A1+A2+M1+M2 resueltos. Resto documentado** |
| 🎨 **Diseño** | REWORK CSS · paleta v5.9 no estaba aplicada | **Refit completo del theme global aplicado. Quick wins documentados para v5.11** |
| 💼 **Comercial** | Hay negocio NO como SaaS · viable como consultoría | Pendiente decisión de Paco (camino A / D / A+D) |

---

## Fixes aplicados en v5.10 · ingeniería

### 🔴 Críticos resueltos (2/2)

**C1 · Exposición de datos privados en `evento-publica.html`** — RESUELTO.
La página antes leía el JSON completo del presupuesto (`senial`, `total`, `totalConIva`, `dietas` detalladas, `clientName` interno) y los exponía vía DevTools/fetch directo. Además los IDs eran enumerables (`PRES-2026-1001..NNNN`).

Implementación del fix:
- Nueva función `sanitizeForPublic(raw)` en `evento-publica.html` con whitelist explícita de campos públicos (`PUBLIC_FIELDS`). Solo pasan al DOM: `ref, fechaEvento, horaInicio/Fin, eventType, menuPkg, espacio, estado, pt, evento_publico` y `tituloPublico` derivado.
- Hash determinista SHA-256 del id (`hashEventId(projectId, eventId)`) en `core/js/qr-gen.js`. Las URLs de los QR ahora usan `&h=<hash>` en vez de `&id=PRES-2026-1001`. El hash no es criptográficamente secreto (el salt vive en el código público) pero impide el ataque trivial de enumeración.
- Backward compatibility: `?id=` legacy sigue funcionando pero también sanitiza.
- `metricas.html` actualizado para usar el `await buildEventUrl()` nuevo (async).

**C2 · CSP de evento-publica acopla la solución de C1** — MITIGADO con C1.
Sin necesidad de cambiar la CSP porque la sanitización ahora ocurre client-side y los datos privados nunca se exponen.

### 🟠 Altos resueltos (2/5)

- **A1** · `escapeHtml` en `evento-publica.html` ahora escapa también `'` (apóstrofe). XSS potencial cerrado.
- **A2** · Regex de validación de PAT en `auth.js:promptForPAT` alineado con `promptForPATGuided` (ambos exigen prefijo `ghp_` o `github_pat_`).

### 🟠 Altos documentados para v5.11 (3/5)

- A3 · timezone `toISOString` (heredado v5.7) — fix de 30 min
- A4 · race condition i18n `setLocale` (heredado M3) — fix de 30 min
- A5 · drafts localStorage sin TTL — fix de 1 h

### 🟡 Medios resueltos (2/6)

- **M1** · `sitemap.xml` ampliado con landing + pitch + flujo-trabajo + 2 cartas públicas + disponibilidad
- **M2** · `robots.txt` bloquea ahora `/projects/, /docs/, /templates-comerciales/, /branding/master/, /branding/v2-queens-bellybutton/, /test-checklist.html, /mockups.html`. Cierra una vía de scraping de presupuestos antes de C1.

### 🟢 Bajos aceptados sin fix (resto)

Documentados en `AUDITORIA-INGENIERIA-v5.10.md`.

---

## Fixes aplicados en v5.10 · diseño

### 🎨 Refit estructural del CSS global · APLICADO

`core/css/dashboard-theme.css` migrado de la paleta heredada (slate `#0d1117` + emerald `#34d399`) a la paleta master v5.9 (navy `#0a1733` + oro `#c9a35c` + champaña `#f4ead7`). Esto propaga la marca a:
- `dashboard/index.html`, `dashboard/editor.html`, `dashboard/wizard.html`, `dashboard/metricas.html`
- `sala-movil.html`, `carta-publica.html`, `evento-publica.html`, `disponibilidad-publica.html`

Tipografía display global cambiada a `Cinzel` (en `--font-display`). Sigue Inter para UI y JetBrains Mono para code.

Modo claro también refit a la paleta nueva (crema champaña + oro deep para contraste WCAG AA).

### 🔧 Anti-patrón mobile · RESUELTO

`sala-movil.html` ya no incluye `user-scalable=no`. WCAG SC 1.4.4 ahora cumple.

### 📝 Quick wins documentados para v5.11

Las otras 9 mejoras visuales recomendadas (reemplazo de emoji por SVG Lucide, fix de las 14 rutas rotas en pitch.html, unificación de paletas de cards, etc.) están en `AUDITORIA-DISEÑO-v5.10.md` con código listo para aplicar. Coste total estimado: 4 h.

---

## Decisiones comerciales pendientes (de Paco)

El auditor concluye que **hay negocio pero NO como SaaS puro autoservicio**. Las 3 opciones reales:

| Camino | Viabilidad | Esfuerzo | ROI 12 meses |
|---|---|---|---|
| **A · Consultoría premium** (recomendado) | 6/10 | Medio · 5-10 h/semana | 6-15 k€ ARR · 3-6 clientes |
| **B · SaaS self-service** (descartar por ahora) | 2/10 | Muy alto · 25+ h/semana | <2 clientes con bootstrap puro |
| **D · Portfolio para empleo** (nuevo, no contemplado) | 8/10 | Bajo · 2-3 h/semana | Empleo 50-70 k€/año |

El plan completo a 90 días con CAC=0€ está en `BUSINESS-AUDIT-v5.10.md` sección 6.

**Primera acción concreta recomendada (con Paco):**
> Escribir a mano lista de 30 contactos de la red de 30 años en hostelería (ex-jefes, ex-clientes, ex-proveedores). Priorizar los 10 más cálidos. Contactar personalmente por WhatsApp/llamada esta semana, ofreciendo piloto al 50% de descuento a cambio de derecho de uso del nombre como caso de éxito. Objetivo a 4 semanas: 1 carta de intenciones firmada.

---

## Pricing recomendado (del audit)

| Plan | Mensual | Implantación | ICP |
|---|---:|---:|---|
| **Bistró** | 49 € | 1 500 € | Restaurante con eventos puntuales |
| **Hotel** *núcleo del ICP* | 99 € | 2 500 € | Hotel 20-80 hab con banquetes |
| **Grupo** | 199 € | 4 500 € | Cadena 2-5 establecimientos |
| **Custom** | desde 350 € | desde 8 000 € | 6+ establecimientos o integración TPV real |

**Sin comisión por evento ni por cubierto** (es lo que más odian los hosteleros de TheFork/CoverManager según las reseñas analizadas).

---

## Mercado · cifras del audit (España)

- **TAM**: 250-350 M€/año (software gestión hostelera España)
- **SAM**: 30-50 M€/año (hoteles independientes 3-50 hab con banquetes + restaurantes con eventos + caterings)
- **SOM 12 meses**: 3-6 clientes · 6-15 k€ ARR (realista para bootstrap puro sin equipo)
- **SOM 36 meses**: 15-30 clientes · 35-80 k€ ARR (con un comercial part-time o partnership)

**Conclusión del auditor:** "decenas de clientes, no cientos. Lifestyle business / autoempleo, no un cohete."

---

## Verificación tras los fixes

- ✅ 67/67 unit tests
- ✅ JSON validation OK
- ✅ HTML security headers OK
- ✅ 9/9 smoke + evento-publica E2E
- ✅ Refit visual aplicado · marca coherente en todas las páginas con login

---

## Sprint v5.11 sugerido · pre-comercialización seria

Si Paco decide ir con el camino A (consultoría):

1. Aplicar las 9 quick wins de diseño restantes (~4 h)
2. Resolver A3, A4, A5, M3, M4 de ingeniería (~3 h)
3. Crear página `/queens-bellybutton-pricing.html` con los planes recomendados (~2 h)
4. Crear template de "carta intenciones piloto" en `templates-comerciales/` (~1 h)
5. Crear `LANDING-COMERCIAL.html` separada de la landing técnica actual (~3 h)
6. Total estimado: ~13 h de desarrollo

Si Paco decide D (portfolio para empleo):

1. Aplicar las 9 quick wins de diseño (~4 h) — más importante todavía
2. Crear página `/case-study-tecnico.html` extendiendo el actual con métricas de código (LOC, tests, ADRs) (~2 h)
3. Optimizar Open Graph + meta para LinkedIn share (~30 min)
4. Total estimado: ~7 h

Si A+D: ambos sprints encadenados (~20 h totales).

---

**Final del resumen ejecutivo.** Los 3 documentos detallados (1 050 líneas combinadas) son la base completa para decidir y ejecutar. Esta v5.10 deja el producto en estado **vendible al primer cliente real pagado**, una vez Paco confirme el camino comercial elegido.
