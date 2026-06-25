# Auditoría de documentación y material comercial · v6.0

**Fecha:** 2026-06-25
**Versión base:** v6.0 (PWA disuelta · sala responsive integrada · 3 roles · páginas nuevas disenador-sala / factura-servicio / qr-print)
**Alcance:** material comercial regenerado en v6.0 (`templates-comerciales/*`, pitch, mockups, guiones de vídeo, propuesta económica, `video-promo/`), `test-checklist.html`, coherencia de versión transversal (`package.json` ↔ `core/version.json`), coherencia de marca, y referencias internas (rutas, anclas, changelog).
**Método:** auditoría de detección **y remediación** — los hallazgos marcados *RESUELTO* se corrigieron en esta misma sesión. Lectura cruzada de los materiales comerciales + verificación de coherencia versión/marca contra las fuentes de verdad (`core/version.json`, wordmark del logo, script de rename v5.9) + comprobación de cobertura del checklist + evaluación basada en evidencia de las dos recomendaciones abiertas.

## Resumen ejecutivo

| Severidad | Cantidad | Estado |
| --- | ---: | --- |
| 🔴 Críticos | **0** | — |
| 🟠 Altos | **3** | **3 RESUELTOS en esta sesión** |
| 🟡 Medios | **4** | **3 RESUELTOS · 1 requiere decisión** |
| 🟢 Bajos | **2** | 1 RESUELTO · 1 documentado (aceptable) |

**Veredicto:** **APROBADO (post-remediación).** El material comercial v6.0 era de buena factura pero arrastraba **desincronizaciones de versión y de marca** propias de una regeneración rápida: el manifiesto `package.json` declaraba aún `5.17.0`, un test del checklist verificaba un badge/changelog de la era v5.17, dos pies de guion usaban la grafía con apóstrofo `Queen's`, el ancla del changelog en `version.json` no resolvía contra su heading (el click del badge no hacía scroll a la sección), y el checklist no cubría aún la documentación comercial regenerada. **Todos esos hallazgos se han corregido en esta sesión.** Queda **un solo punto que requiere decisión** (badge de versión en 3 páginas nuevas) y la **Recomendación 2 se retira con evidencia** (ver §Recomendaciones). Tras la remediación, la documentación es coherente con v6.0 de extremo a extremo.

---

## Metodología

**Skills aplicados (modo análisis):** rúbrica del skill `brand` para la sección de marca (canon de nombre, paleta, tipografía, coherencia de pies) y rúbrica de `verification-quality` para el cierre de hallazgos (cada fix verificado contra su fuente de verdad, no contra suposición). No se ejecutaron como skills aisladas: el proyecto es Vanilla JS + Markdown y no encaja con sus templates, pero se siguieron sus checklists — igual que en `AUDITORIA-INGENIERIA-v5.10.md`.

**Fuentes de verdad consultadas:**
- `core/version.json` → `6.0.0` · fecha `2026-06-25` · tag `v6.0` · `changelog_url` → `docs/DETALLE-PROYECTO.md#13--cambios-v60`. Su `history` incluye `5.20.0` (2026-06-24), lo que confirma que `package.json` estaba 3 minors atrasado.
- Wordmark del logo: `branding/v2-queens-bellybutton/A-pure/horizontal.svg` → `aria-label="Queens Bellybutton · horizontal"` (sin apóstrofo).
- `scripts/rename-to-queens-bellybutton.py` (v5.9): renombrado masivo a «Queens Bellybutton» (sin apóstrofo) → grafía canónica.
- `core/js/version-badge.js`: lee `version.json` dinámicamente y pinta el badge inferior-izquierdo enlazando al `changelog_url`.

**Materiales revisados:** `templates-comerciales/README.md`, `templates-comerciales/generate-propuesta.js`, `guion-video-avatar-heygen.md`, `guion-troceado-60s.md`, `test-checklist.html` (bloques de versión + cobertura), `package.json`, `video-promo/src/scenes/Scene07Sala.tsx`, `video-promo/src/components/KenBurnsImage.tsx`, `video-promo/src/Root.tsx`, los 8 assets de `video-promo/public/assets/`, e inventario de inclusión de `version-badge.js` en los 20 HTML del repo.

**Fuera de alcance:** contenido funcional de las páginas (cubierto por la auditoría de ingeniería v5.10 y los tests E2E); render real del MP4 (no se relanzó Remotion).

---

## 🟠 Altos (3 · todos resueltos)

### A1 · `package.json:3` · Versión desincronizada con el manifiesto canónico — **RESUELTO**

- **Archivo:line:** `package.json:3`
- **Síntoma:** declaraba `"version": "5.17.0"` mientras `core/version.json` (fuente de verdad que pinta el badge y el changelog) ya iba por `6.0.0`, con `5.20.0` registrado en su `history`. El manifiesto npm del proyecto estaba **3 minors + 1 major atrasado**.
- **Riesgo:** cualquier herramienta o lector que tome `package.json` como referencia de versión (CI, tags, badges de terceros, un futuro colaborador) reporta una versión falsa. Incoherencia en la cara más «oficial» del proyecto justo en el material de comercialización.
- **Fix aplicado:** `"version": "6.0.0"` (Recomendación 1). 1 línea.
- **Coste:** 2 min.

### A2 · `test-checklist.html` (bloque `b26t1`) · Test verificaba un badge/changelog de la era v5.17 — **RESUELTO**

- **Archivo:line:** `test-checklist.html` · bloque `b26t1`
- **Síntoma:** el test pedía verificar un badge «v5.17» y un `changelog_url` antiguo. Tras v6.0 el badge muestra `v6.0 · 25 jun 2026` (leído de `core/version.json`) y el changelog apunta a `docs/DETALLE-PROYECTO.md#13--cambios-v60`. Un tester de QA habría validado contra el valor equivocado y reportado un «fallo» inexistente (o aprobado un estado obsoleto).
- **Riesgo:** falso negativo/positivo en QA; erosiona la confianza en el checklist, que es la herramienta de verificación de cara al cliente.
- **Fix aplicado:** `b26t1` reescrito a `v6.0 · 25 jun 2026`, con enlaces a `index.html`, `core/version.json` y el ancla correcta del changelog, todos `target="_blank"`.
- **Coste:** 10 min.

### A3 · Inconsistencia de marca «Queen's» vs «Queens» en pies de guiones — **RESUELTO**

- **Archivo:line:** `templates-comerciales/guion-video-avatar-heygen.md:145` y `templates-comerciales/guion-troceado-60s.md:78`
- **Síntoma:** ambos pies de página rezaban `Queen's Bellybutton v6.0` (con apóstrofo), mientras los cuerpos de los mismos guiones y la grafía canónica usan `Queens Bellybutton` (sin apóstrofo). La forma con apóstrofo es un resabio del relato de origen («el ombligo de la reina»).
- **Riesgo:** material de cara a cliente con la marca escrita de dos formas distintas en el mismo documento. Señal de descuido en outreach comercial.
- **Fix aplicado:** ambos pies a `Queens Bellybutton v6.0`. Verificado contra el wordmark (`aria-label="Queens Bellybutton"`), el script de rename v5.9 y la dominancia en 38 archivos del repo (ver §Branding).
- **Coste:** 5 min.

---

## 🟡 Medios (4 · 3 resueltos)

### M1 · `test-checklist.html` · Sin cobertura de la documentación comercial v6.0 — **RESUELTO (sub-tarea solicitada)**

- **Archivo:line:** `test-checklist.html` · array `BLOCKS`
- **Síntoma:** el checklist no incluía ningún bloque para verificar el material comercial regenerado en v6.0 (propuesta, README de plantillas, guiones de vídeo, coherencia de versión/marca). Era exactamente el punto que el usuario pidió confirmar.
- **Fix aplicado:** nuevo bloque **`b27 · «Documentación comercial v6.0»`** con 6 tests:
  - `b27t1` · la propuesta `.docx` regenera con `npm install docx --no-save` + `node templates-comerciales/generate-propuesta.js`.
  - `b27t2` · `README.md` coherente con el script (fuente única, Calibri).
  - `b27t3` · guion HeyGen describe sala responsive **NO** PWA, 3 roles, y pie `Queens Bellybutton v6.0` sin apóstrofo (como el wordmark).
  - `b27t4` · guion troceado 60s coherente.
  - `b27t5` · `VIDEO-PROMO-GUION` con rutas válidas.
  - `b27t6` · coherencia transversal de versión, sin restos de `v5.x` ni de «PWA/app instalable».
  - Más `LEVEL_MAP['b27'] = 'admin'` y `BLOCK_URLS['b27'] = 'templates-comerciales/README.md'`.
- **Coste:** 25 min.

### M2 · `templates-comerciales/README.md:75-77` · Hitos con tags de versión obsoletos — **RESUELTO**

- **Archivo:line:** `templates-comerciales/README.md:75-77`
- **Síntoma:** la lista de «próximas plantillas» marcaba `(v5.8)`, `(v5.8)`, `(v5.9 cuando haya cliente)` como si fueran hitos cumplidos/planificados a versiones ya superadas. En v6.0 esos tags no significan nada y sugieren entregables atrasados.
- **Fix aplicado:** tags neutralizados a `(pendiente)` / `(pendiente)` / `(pendiente · cuando haya cliente)`.
- **Coste:** 5 min.

### M4 · `core/version.json:14` · El ancla del changelog no resolvía contra el heading real — **RESUELTO**

- **Archivo:line:** `core/version.json:14` (`changelog_url`) ↔ `docs/DETALLE-PROYECTO.md:430` (heading)
- **Síntoma:** el `changelog_url` apuntaba a `…/DETALLE-PROYECTO.md#13--cambios-v60`, pero el heading real era `## 13 · Cambios v6.0 (junio 2026) — epic estructural`, cuyo slug que genera GitHub es el largo `#13--cambios-v60-junio-2026--epic-estructural`. GitHub **no hace coincidencia por prefijo** de fragmentos: al hacer click en el badge, el documento cargaba pero **no hacía scroll a la sección §13** (caía al inicio del doc). La misma ancla rota estaba replicada en `test-checklist.html` (`b26t1`) y en este informe — las tres consistentes en la forma corta, lo que indica que el **ancla corta era la canónica pretendida** y el heading arrastraba texto descriptivo de más que rompía el slug.
- **Riesgo:** «mala referencia» de cara al usuario: la única acción interactiva del badge (ver el changelog en su sección) no funcionaba como anuncia el propio test `b26t1`. Un tester habría reportado fallo legítimo.
- **Fix aplicado:** alineado el heading al ancla canónica pretendida — `## 13 · Cambios v6.0` (slug verificable = exactamente `#13--cambios-v60`), preservando el descriptor en una línea bajo el título (`**Epic estructural · junio 2026.**`). No se tocó `version.json` ni `b26t1` ni este informe: las tres referencias resuelven ahora correctamente. Sin TOC ni enlaces internos que dependieran del heading anterior (verificado).
- **Coste:** 5 min.

### M3 · 3 páginas nuevas v6.0 sin badge de versión — **RESUELTO**

- **Archivo:line:** `core/pages/disenador-sala.html`, `core/pages/factura-servicio.html`, `core/pages/qr-print.html`
- **Síntoma:** los 17 HTML restantes del repo incluyen `core/js/version-badge.js`; estas 3 páginas nuevas de v6.0 no. Era una asimetría de coherencia.
- **Por qué se temía el auto-fix:** el badge es `position:fixed` inferior-izquierdo. En `factura-servicio.html` (documento de cara a cliente) y `qr-print.html` (página pensada para imprimir) se temía que un badge flotante «v6.0» se imprimiera encima del documento.
- **Resolución:** la preocupación de impresión resultó infundada — `version-badge.js:76` ya incluye `@media print{#qbb-version-badge{display:none!important}}`, así que el badge se auto-oculta al imprimir en cualquier página. Decisión de producto del usuario: añadirlo a las 3. Se insertó `<script src="../js/version-badge.js" defer></script>` antes de `</body>` en las tres páginas. Sin regla print extra (ya la trae el propio badge).
- **Coste real:** 5 min.

---

## 🟢 Bajos (2)

### B1 · `test-checklist.html` · eyebrow seguía en «v5.17» — **RESUELTO (sesión previa)**

El eyebrow de cabecera del checklist se actualizó a `Queens Bellybutton v6.0 · checklist interactivo`. Cerrado.

### B2 · `branding/README.md` · La narrativa de marca usa «Queen's Bellybutton» — **documentado, aceptable**

El brand bible cuenta el origen del nombre («Queen's Bellybutton · el ombligo de la reina»). Como **relato etimológico** es legítimo y no es un error. El canon operativo (UI, pies, wordmark, dominios, archivos) es sin apóstrofo. **Acción:** ninguna sobre el relato; vigilar que la grafía con apóstrofo no vuelva a migrar a pies/UI (como ocurría en A3).

---

## Branding (rúbrica skill `brand`)

**Nombre canónico:** **«Queens Bellybutton»** (sin apóstrofo). Evidencia triangulada:
1. Wordmark del logo — `branding/v2-queens-bellybutton/A-pure/horizontal.svg` → `aria-label="Queens Bellybutton"`.
2. Script de rename v5.9 — `scripts/rename-to-queens-bellybutton.py` normalizó el repo a la forma sin apóstrofo.
3. Dominancia — 38 archivos shipped usan la forma sin apóstrofo; la variante con apóstrofo solo sobrevivía en el relato de `branding/README.md` y en los 2 pies corregidos en A3.
4. Slug de directorio — `v2-queens-bellybutton` (sin apóstrofo, por seguridad de filesystem) refuerza el canon.

**Coherencia de marca en el material comercial (post-fix):** ✅ Todos los pies y cuerpos de los guiones, el checklist y el README de plantillas usan ahora «Queens Bellybutton v6.0» de forma uniforme.

**Sistema visual (referencia, sin hallazgos):**
- **Paleta:** slate `#0d1117` (fondo) + emerald `#34d399 → #059669` (acento/gradiente). Coherente entre dashboard, badge y material comercial.
- **Tipografía:** Inter (UI) + Playfair Display (display). La propuesta `.docx` usa **Calibri** deliberadamente (formato Word de cara a cliente, no web) — declarado correctamente en `README.md:19`; **no es hallazgo**.
- **Isotipo:** `border-radius` 22%.

**Anti-falsos-positivos verificados (no se «arreglaron» por no ser errores):**
- `templates-comerciales/README.md:19` «Calibri» coincide con `generate-propuesta.js` (`fontBody='Calibri'`). Correcto.
- La propuesta usa marca blanca «Plataforma F&B» / «Camino A» de forma deliberada (no es una fuga de marca ni un placeholder olvidado).
- Los cuerpos de ambos guiones ya decían «Queens Bellybutton» correctamente; solo fallaban los pies.

---

## Recomendaciones

### Recomendación 1 — Sincronizar `package.json` a `6.0.0` · **HECHA**

Ejecutada como fix A1. `package.json:3` → `"6.0.0"`. Alinea el manifiesto npm con `core/version.json` y con el badge que ve el cliente.

### Recomendación 2 — Recapturar `sala-movil-*.png` a 2× · **INVESTIGADA → RETIRADA por evidencia**

La recomendación original era recapturar `video-promo/public/assets/sala-movil-hoy.png` y `sala-movil-empty.png` (500×641) a 2× por nitidez. **La evidencia la retira:**

1. **No son un outlier.** Los 8 assets del vídeo comparten **altura uniforme de 641 px**: los de escritorio son `1370×641`, los de móvil `500×641`. La pareja sala sigue exactamente la convención del proyecto; recapturar **solo** esos dos a 2× crearía inconsistencia de resolución con los otros 6.
2. **Se renderizan a ~1:1.** La composición master es `1920×1080` (`Root.tsx:23-24`; las otras dos son 1080×1080 y 1080×1920, más pequeñas). El panel de sala mide `480×615` (`Scene07Sala.tsx:75,89`) y `KenBurnsImage` usa `objectFit:"cover"` con zoom **máx. ×1.06** (`KenBurnsImage.tsx:53` + zooms `[1,1.06]`/`[1.06,1]`). Aspect del panel (0.78) ≈ aspect del PNG (0.78): el origen de 500 px mapea a 480 px de salida (~4% de reducción) y, en el pico de zoom, ~6% de ampliación. Imperceptible.
3. **El 2× solo importaría a 4K.** No hay composición 4K configurada. Subir solo esta pareja no aporta nitidez visible al output real.

**Conclusión:** sin acción sobre los PNG. Una mejora de nitidez real solo tendría sentido como **recaptura global de los 8 assets** si en el futuro se pasa el vídeo a 4K — fuera del alcance de esta auditoría.

**Recomendación derivada (sustituye en utilidad a la 2) — EJECUTADA:** se resolvió M3 añadiendo el badge de versión a las 3 páginas nuevas; el badge ya se auto-oculta al imprimir (`version-badge.js:76`), de modo que la asimetría de coherencia de v6.0 queda cerrada sin riesgo en factura/QR.

---

## Lo que está BIEN

- **Material comercial libre de PWA.** Ningún guion, pitch ni README menciona ya «app instalable» / «PWA»; todos describen la sala como vista responsive integrada en el panel (coherente con la épica v6.0).
- **3 roles consistentes** (super-admin / director-administrador / cliente sin login) en ambos guiones y el pitch.
- **Propuesta generada desde código** (`generate-propuesta.js`) → versionable en git, regenerable al 100%, documentado en README.
- **`core/version.json` como fuente de verdad única** del badge y el changelog, leída dinámicamente por `version-badge.js`.
- **Checklist data-driven** (`BLOCKS` + `LEVEL_MAP` + `BLOCK_URLS`): añadir cobertura fue declarativo y de bajo riesgo.
- **Convención de assets de vídeo disciplinada** (altura uniforme 641 px), lo que de hecho es la razón por la que la Recomendación 2 se retira.

---

## Conclusión

El material comercial regenerado en v6.0 era sólido en fondo (mensaje, estructura, marca blanca de la propuesta) pero arrastraba el típico **drift de una regeneración rápida**: versión del manifiesto atrasada, un test de QA apuntando a la era v5.17, dos pies con la marca mal escrita y un checklist sin cobertura del propio material. **Los cuatro se han corregido en esta sesión** (A1, A2, A3, M1), más los hitos obsoletos del README (M2), el ancla rota del changelog (M4) y el eyebrow (B1).

El **último punto de decisión** (M3 · badge de versión en 3 páginas nuevas) **también se cerró**: el badge se añadió a las tres y se auto-oculta al imprimir, así que no hay riesgo en factura/QR. La **Recomendación 2 se retira con evidencia técnica** en lugar de ejecutarse a ciegas. **Veredicto: documentación v6.0 coherente y aprobada** tras la remediación.
