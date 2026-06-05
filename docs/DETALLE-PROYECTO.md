# Detalle del proyecto · Queens Bellybutton v5.17

> **¿Estás en la última versión?** Mira el badge esquina inferior izquierda
> de cualquier página HTML del producto. Si pone `v5.17 · 5 jun 2026`,
> sí. Si pone una versión anterior, fuerza recarga (Ctrl+Shift+R).
> Documento detallado del proyecto · actualizado 5 junio 2026.

> Inventario completo del proyecto: qué hay, dónde está, cómo se relaciona.
> Documento técnico de referencia. Para versión corta ver `RESUMEN-EJECUTIVO.md`.

## 1 · Estructura general del repositorio

```
control-gestion-fnb/
├── index.html                    Landing pública (5 cards · v5.0)
├── carta-publica.html            Carta digital pública por proyecto
├── sala-movil.html               PWA · vista del equipo de sala
├── manifest.json                 PWA manifest
├── sw.js                         Service worker (cache + offline)
├── icons/                        Icon set PWA (192/512 SVG)
├── robots.txt · sitemap.xml      SEO básico
│
├── core/                         CÓDIGO COMPARTIDO
│   ├── css/
│   │   ├── dashboard-theme.css   Paleta slate+emerald + light mode override
│   │   └── themes.css            5 temas frontend (data-theme=…)
│   ├── js/
│   │   ├── loader.js             Carga proyectos · validación ID anti-traversal
│   │   ├── auth.js               bcrypt soft auth · sessionStorage · re-verify
│   │   ├── github-api.js         REST wrapper · commit atómico multi-archivo
│   │   ├── editor-core.js        Drafts localStorage · quota check · validación
│   │   ├── theme.js              Aplicador de temas con prioridad
│   │   ├── metrics.js            Agregaciones puras de presupuestos
│   │   ├── importer-excel.js     SheetJS + PapaParse + autoMap
│   │   ├── importer-pdf.js       pdf.js + extracción heurística
│   │   ├── importer-images.js    Compress WebP + autoMatch + IA fallback
│   │   ├── productos-connector.js  4 niveles (static/csv/json/api)
│   │   ├── tpv-connector.js      4 niveles (simulator/csv-poll/tpv/webhook)
│   │   ├── escandallos.js        Coste por receta · PVP sugerido
│   │   ├── qr-gen.js             SVG QR descargable
│   │   └── appearance.js         Light/dark toggle persistente
│   └── pages/                    Frontend público del establecimiento
│       ├── presupuesto-evento.html
│       ├── recetario.html
│       ├── contrato-servicios.html
│       └── orden-servicio.html
│
├── dashboard/                    PANEL DEL DIRECTOR
│   ├── index.html                Login + listado de proyectos
│   ├── editor.html               CRUD de 6 secciones + escandallos + QR
│   ├── wizard.html               4 pasos + marketplace plantillas
│   ├── metricas.html             Presupuestos + agenda + Chart.js
│   └── auth.json                 Hash bcrypt super-admin
│
├── projects/                     DATOS POR ESTABLECIMIENTO
│   ├── index.json                Manifest de proyectos visibles
│   ├── miramar/                  Hotel Miramar Algeciras · 5*GL
│   ├── restaurante-casa-lola/    Marbella · mediterraneo
│   └── demo/                     Esqueleto vacío · regresión
│
├── templates/                    MARKETPLACE DE PLANTILLAS
│   ├── index.json                Listado de templates
│   ├── cafeteria/                Brunch · coffee · moderno-minimalista
│   ├── marisqueria/              Arroces · mariscadas · mediterraneo
│   └── hotel-rural/              Maridajes · bodas íntimas · cercano-rustico
│
├── docs/
│   ├── arquitectura-plataforma.md
│   ├── CASE-STUDY.md
│   ├── AUDITORIA-v4.14.md
│   ├── RESUMEN-EJECUTIVO.md      ← Este nivel
│   ├── DETALLE-PROYECTO.md       ← Este documento
│   ├── COMERCIALIZACION.md
│   └── adr/
│       ├── 011-pat-sessionstorage.md
│       ├── 012-productos-conectores.md
│       └── 013-tpv-connectors.md
│
├── scripts/
│   └── change-password.html      Generador standalone de hash bcrypt
│
├── test/                         59 tests Node nativos
│   ├── auto-match.test.js
│   ├── loader-validation.test.js
│   ├── escape-html.test.js
│   ├── escandallos.test.js
│   ├── tpv-connector.test.js
│   ├── qr-url.test.js
│   ├── validate-jsons.js         Validador estático
│   └── check-security-headers.js Smoke CSP+SRI
│
├── .github/workflows/tests.yml   CI · 3 jobs
└── flujo-trabajo.html            Visual del flujo end-to-end
   test-checklist.html            Checklist interactivo de QA
```

## 2 · Capacidades por audiencia

### 2.1 · Administrador (Paco / consultor)

| Capacidad | Dónde | Cómo |
| --- | --- | --- |
| Crear proyecto nuevo | `/dashboard/wizard.html` | 4 pasos · elige plantilla del marketplace · publica con PAT |
| Editar 6 secciones | `/dashboard/editor.html` | Establecimiento · menús · recetas · productos · tema · QR |
| Calcular escandallos | Editor · sección recetas · botón 💰 | Cruza recetas con catálogo productos · % escandallo + PVP sugerido |
| Generar QR carta | Editor · sección establecimiento · botón 📱 | SVG descargable · URL detecta GitHub Pages vs localhost |
| Importar Excel/CSV | Editor · menús o recetas · botón 📥 | SheetJS · auto-map columnas · validate antes |
| Importar PDF | Editor · cualquier sección · botón 📄 | pdf.js · copy-paste asistido 2 columnas |
| Importar imágenes bulk | Editor · recetas · botón 🖼 | Compress WebP · auto-match filename · IA fallback |
| Conectar economato | Editor · productos | 4 niveles: static/csv-url/json-url/api |
| Ver métricas | `/dashboard/metricas.html` | 2 vistas · Chart.js · presupuestos + agenda |
| Publicar cambios | Cualquier sección · botón ☁ Publicar | Re-verify password · commit atómico vía GitHub API |
| Rotar password | `/scripts/change-password.html` | Generador bcrypt standalone · copy-paste a auth.json |

### 2.2 · Equipo de sala (PWA móvil)

| Capacidad | URL | Función |
| --- | --- | --- |
| Eventos del día + 7 días | `/sala-movil.html?proyecto=X&vista=hoy` | Cliente · hora · espacio · menú · pax + dietas |
| Protocolos por pulsera | `?vista=dietas` | Cada dieta crítica con instrucciones cocina/sala/bebidas |
| Ocupación próximos 30d | `?vista=espacios` | Por espacio · % ocupación · catálogo completo |
| Simulador TPV | `?vista=tpv` | 2 escenarios pregrabados · eventos en directo |
| Instalación como app | "Añadir a pantalla de inicio" | Funciona offline tras primera visita |

### 2.3 · Cliente final potencial (público · self-service)

| Capacidad | URL |
| --- | --- |
| Cotizador interactivo de eventos | `/core/pages/presupuesto-evento.html?proyecto=X` |
| Solicitar presupuesto formal (mailto + clipboard + WhatsApp) | botón final del cotizador |
| Carta digital del establecimiento | `/carta-publica.html?proyecto=X` |
| Filtros por tipo de menú | Tabs en la carta |
| Alérgenos siempre visibles | Bloque rojo abajo |

**v5.2 ·** el cotizador NO envía a un backend (no hay backend). Construye un email con todo el detalle y abre `mailto:` al email del hotel. Como respaldo, copia al portapapeles y ofrece enviarlo por WhatsApp. El hotel recibe la solicitud y la formaliza con el cotizador en `?modo=interno`.

### 2.4 · Cliente del establecimiento (comensal · día del servicio)

| Capacidad | URL |
| --- | --- |
| Carta digital del día | `/carta-publica.html?proyecto=X` (vía QR de la mesa) |

## 3 · Módulos de motor (`core/js/`)

| Módulo | LOC | Función principal | API window |
| --- | --- | --- | --- |
| loader.js | 152 | Carga proyectos · whitelist regex | loadProject, fnbFetch |
| auth.js | 380 | Bcrypt + modal PAT + re-verify | fnbAuth |
| github-api.js | 305 | REST wrapper · commits atómicos | fnbGitHub |
| editor-core.js | 274 | Drafts localStorage · validate | fnbEditor |
| theme.js | 109 | Aplicador temas + cache config | fnbTheme |
| metrics.js | 187 | Agregaciones pures | fnbMetrics |
| importer-excel.js | 280 | SheetJS lazy · autoMap | fnbImporter |
| importer-pdf.js | ~180 | pdf.js ESM dinámico | fnbPdf |
| importer-images.js | 184 | Compress + autoMatch + IA | fnbImages |
| productos-connector.js | 237 | 4 niveles catálogo | fnbProductos |
| tpv-connector.js | ~220 | 4 niveles TPV · pub/sub | fnbTPV |
| escandallos.js | 220 | Cost + match + PVP | fnbEscandallos |
| qr-gen.js | 105 | SVG QR + URL builder | fnbQR |
| appearance.js | 90 | Light/dark + persistencia | fnbAppearance |

## 4 · Datos por proyecto

Cada `projects/<id>/` contiene 10 JSON + carpeta `budgets/`:

```
config.json            id · tema · categoria · locale
establecimiento.json   razón social · dirección · espacios · contacto
menus.json             paquetes (sentado/cóctel/brunch/coffee/barra)
recetas.json           categorías → recetas con ing[] + pasos[] + mp
productos.json         source{type,url,...} + items[] (ADR 012)
eventos.json           categorías + tipos de evento
dietas.json            7 dietas estándar con protocolo cocina/sala
bebidas.json           catálogo de bebidas (opcional)
extras.json            mesas · iluminación · floral · música · etc.
auth.json              usuarios del proyecto (no super-admin)
budgets/
  index.json           manifest de presupuestos
  PRES-2026-NNNN.json  un archivo por presupuesto
```

## 5 · Integraciones externas

| Servicio | Para qué | Coste | Configuración |
| --- | --- | --- | --- |
| GitHub API | Commits del editor | gratis con PAT | sessionStorage |
| GitHub Pages | Hosting estático | gratis | automático |
| jsdelivr CDN | bcryptjs, xlsx, papaparse, chart.js, pdf.js, browser-image-compression, qrcode-generator | gratis | SRI sha384 pineado |
| Pollinations.ai | Generación de fotos plato | gratis sin API key | URL params |
| Google Fonts | Inter + JetBrains Mono + Playfair | gratis | preconnect |

## 6 · Seguridad (defensa en profundidad)

| Mecanismo | Implementación |
| --- | --- |
| Whitelist regex ID proyecto | `^[a-z0-9_-]+$` en loader y theme |
| escapeHtml consistente | 46+ usos en dashboard |
| escapeText en modales auth | C3 v4.15 |
| Subresource Integrity | sha384 + crossorigin en 7 CDN scripts |
| Content Security Policy | meta en 5 HTMLs + frame-ancestors 'self' |
| PAT en sessionStorage | TTL natural a cierre pestaña (ADR 011) |
| Re-verify en destructivas | promptPasswordAndExecute · fresh-auth 5min |
| Cache no-store en auth.json | Consistente login + re-verify |
| Validate session.tema | Whitelist de 5 valores |
| Validate productos.source.type | Whitelist 4 valores (ADR 012) |
| Quota check localStorage | 4MB warn · 5MB hard limit |
| AbortController en fetches | 30s timeout en GitHub API (M2 v4.15) |

## 7 · Testing y CI

| Job | Tests | Smoke |
| --- | --- | --- |
| node-tests | 59 (auto-match · loader-validation · escape-html · escandallos · tpv-connector · qr-url) | unit tests puros |
| json-validate | 67 archivos parsean · 3 proyectos completos · ADR 012 cumplido | smoke |
| html-lint | CSP presente en 5 HTMLs · 6 scripts CDN con integrity+crossorigin · meta description+og en landing | smoke |

GitHub Action en cada push a main, feat/* y fix/*.

## 8 · Métricas del repo (v5.1)

| Métrica | Valor |
| --- | --- |
| LOC JS core | ~2 600 |
| LOC HTML dashboard | ~3 800 |
| LOC HTML core/pages | ~5 600 |
| LOC HTML público (sala+carta) | ~900 |
| Archivos JSON totales | 67 |
| Presupuestos seed | 30 (18 Miramar + 12 Casa Lola) |
| Tests automatizados | 59 |
| ADRs | 3 |
| Plantillas marketplace | 3 |
| CDN externos con SRI | 7 (1 ESM documentado sin) |
| PRs cerrados a main | 28 |
| Tags publicados | 4 (v4.14, v4.15, v5.0, v5.1) |
| Coste mensual operación | 0 € |

## 9 · Roadmap viable (no especulativo)

| Versión | Cuándo | Qué | Pre-requisito |
| --- | --- | --- | --- |
| v5.2 | Cuando llegue primer cliente real Glop | Implementación real de OAuth Glop dentro del stub | Cliente piloto + cuenta Glop |
| v5.3 | Cuando aparezca primera necesidad webhook tiempo real | Backend mínimo Cloudflare Worker | ~5 €/mes infraestructura |
| v6.0 | Cuando haya 3+ clientes | Multi-tenant separado (no más sub-paths) · panel super-admin con todos los clientes | Decisión comercial |
| v6.1 | Después | Marketplace público de plantillas con submissions de la comunidad | v6.0 |

## 10 · Cambios v5.11 → v5.17 (junio 2026)

### v5.11 · Cierre de auditoría
Aplica los 9 correctivos altos de la auditoría v5.10 (criptografía PAT,
i18n race condition, Safari < 16.4 markdown, TTL drafts, console.warn en
loader, escape en errores GitHub API, mejoras de prosa en pitch y landing,
fix navy header, ARIA `role="alert"` en login errors). Tag `v5.11.4`
incluye el fix crítico de `.sel-card::before` con `pointer-events:none`
que estaba bloqueando el modal de composición en el cotizador.

### v5.12 · Iconos al lado del nombre
Decisión de diseño del usuario: los emojis dejan de flotar sobre las
imágenes de las cards y se reubican como **badge dorado pequeño al lado
del nombre del plato**. Aplica a:
- `presupuesto-evento.html` · cards de paquetes, eventos e ítems
- `recetario.html` · cards y modal de receta

Clases CSS nuevas: `.sel-name-icon`, `.card-name-icon`, `.modal-title-icon`.
SW_VERSION → 5.12.0.

### v5.13 · Escandallos detallados + sidebar
**+36 fichas nuevas** con precios Makro mayorista 2026 (jamón ibérico
16€/kg, atún rojo 45€/kg, foie 60€/kg, Beluga 4€/g, gamba roja Málaga
50€/kg, etc.). Total recetas: 78 → 114.

- **Entremeses** (+9): brochetas manchego/cherry/fresa, croquetas clásica
  y líquida ibérica, cucharilla salmorejo, vasito gazpacho, canapé foie,
  blini salmón, tartar atún cucurucho, caviar Beluga
- **Entrantes** (+5): carpaccio ternera, salmorejo sin gluten, ensalada
  gamba roja, tataki atún, tartar atún sin gluten
- **Postres** (+7): coulant 72%, crema catalana flameada, bienmesabe
  tartaleta, mini tarta La Viña, sorbete limón, mini pavlova, macarón
  frambuesa-lichi
- **Cócteles** (+7): Aperol Spritz, Mojito Andaluz, Brisa Mediterránea
  (signature de la casa), Old Fashioned, Espresso Martini, Negroni,
  Málaga Sour

**Nueva categoría "Estaciones en vivo" (+8):** carving jamón ibérico DOP
Guijuelo, barra sushi con sushiman, wok asiático, pasta fresca, pizzas al
horno de leña, barra ostras y mariscos, ceviche bar, eggs benedict brunch.
Cada estación incluye desglose de materia prima + personal + alquiler equipo.

**UI · sidebar vertical sticky** en el recetario (desktop) con 3 grupos:
Carta · Eventos · Operativa. Fallback horizontal scrolleable en móvil.
SW_VERSION → 5.13.0.

### v5.14 · Dashboard superadmin diferenciado
Nuevo `dashboard/superadmin.html` con **paleta deliberadamente distinta**
(negro verdoso `#060A07` + verde fluorescente `#00E676`) rompiendo a
propósito la coherencia con el dashboard de directores. Solo accesible
con sesión `scope === 'super-admin'`.

Componentes:
- 4 KPI cards con sparklines SVG (proyectos activos, presupuestos,
  volumen €, próximos 30d)
- Chart de volumen mensual con gradient fill (6M/12M/YTD)
- Tabla de proyectos con health pills + sparkline 7d
- Top 5 paquetes con barras
- Distribución por tipo de evento
- Activity feed con timestamps relativos

Acceso desde `dashboard/index.html`: botón "🛡️ Panel Superadmin" con
gradiente verde que aparece **solo** si la sesión es super-admin.

Test E2E nuevo en `e2e/superadmin.spec.js` (3 specs). SW_VERSION → 5.14.0.

## 11 · Métricas del repo (v5.14)

| Métrica | v5.1 | v5.14 |
| --- | --- | --- |
| LOC JS core | ~2 600 | ~3 200 |
| LOC HTML dashboard | ~3 800 | ~5 100 |
| LOC HTML core/pages | ~5 600 | ~6 800 |
| Archivos JSON totales | 67 | 70+ |
| Recetas Miramar | 78 | **114** |
| Categorías recetario | 6 | **7** (+ estaciones) |
| Presupuestos seed | 30 | 30 |
| Tests automatizados | 59 | 67 (unit) + 19 (E2E) |
| ADRs | 3 | 3 |
| PRs cerrados a main | 28 | 48 |
| Tags publicados | 4 | 8 (v4.14, v4.15, v5.0, v5.1, v5.10, v5.12, v5.13, v5.14) |
| Coste mensual operación | 0 € | 0 € |

### v5.15 · Tema verde extendido a zona admin (PR #50)

Nuevo `core/css/theme-superadmin.css` reutilizable que sobrescribe CSS
variables. Aplicado a `dashboard/wizard.html` y `scripts/change-password.html`.
Las páginas neutras (login, editor, métricas, landing) mantienen
azul-marfil-oro. Badge "ADMIN ZONE" automático arriba a la derecha.
SW_VERSION → 5.15.0.

### v5.16 · Menús especiales completos (PR #51)

Cierra una carencia detectada por el usuario: las dietas marcadas en el
cotizador no tenían menús reales detrás.

- `dietas.json`: añadida **👶 Infantil** con color rosa. **Total 8 dietas.**
- `menus.json`: **+8 paquetes type:"menu_especial"** con composición real
  (cóctel + 3 entrantes/primeros/segundos/postres a elegir + bodega +
  garantías).
- `recetas.json`: **+39 recetas** con campo `dietas[]` multi-valor.
  **Total Miramar: 114 → 153.**
- Cotizador: **paso 2.5 nuevo "Menús adaptados por dieta"** con tarjetas
  coloreadas, control de totales (warning si suma dietas > pax) y
  enlaces ↗ al recetario.
- Recetario: **sidebar "Filtrar por dieta"** con 8 botones de colores y
  pills coloreadas en cada card.
- E2E nuevo: `e2e/menus-especiales.spec.js` (4 specs).

SW_VERSION → 5.16.0.

### v5.17 · Colores transversal + versioning visible (PR #52)

Cierra v5.16 propagando colores y añade un sistema para que el usuario
nunca revise documentos viejos sin darse cuenta.

**Colores transversal cierre:**
- `sala-movil.html` · `renderDietPills` alineado (8 dietas + infantil,
  kosher actualizado de morado a amarillo con emoji 🕎)
- `presupuesto-evento.html` · `renderDietasPillsHTML()` genera pills
  coloreadas para el resumen final (paso 7)

**Sistema de versioning visible:**
- **`core/version.json`** nuevo: `{ version, date, tag, title,
  highlights[], changelog_url, history[] }`
- **`core/js/version-badge.js`** nuevo: badge fijo esquina inferior
  izquierda con punto verde, versión y fecha. Click → changelog.
  Hover → tooltip con highlights. localStorage recuerda última versión
  vista; si hay nueva, parpadea.
- **Inyectado en 17 HTMLs principales**: landing, pitch, mockups, flujo,
  sala-móvil, disponibilidad-publica, evento-publica, carta-publica,
  test-checklist, dashboard (5), scripts/change-password, core/pages (2).
- E2E nuevo: `e2e/version-badge.spec.js` (4 specs).

**Lección operativa:** todo cambio de versión a partir de ahora se
refleja automáticamente en todas las páginas. No más versiones invisibles
para usuarios con cache.

SW_VERSION → 5.17.0.

## 12 · Métricas del repo (v5.17)

| Métrica | v5.14 | v5.17 |
| --- | --- | --- |
| LOC JS core | ~3 200 | ~3 700 |
| LOC HTML dashboard | ~5 100 | ~5 200 |
| LOC HTML core/pages | ~6 800 | ~7 800 |
| Archivos JSON totales | 70+ | 72+ |
| Recetas Miramar | 114 | **153** |
| Categorías recetario | 7 | 7 |
| Paquetes (menus.json) | 26 | **34** (8 especiales) |
| Dietas | 7 | **8** (+ infantil) |
| Tests automatizados | 67+19 | 67+27 |
| Tags publicados | 8 | **12** (v4.14, v4.15, v5.0, v5.1, v5.10, v5.12-v5.17) |
| PRs cerrados a main | 48 | 52 |
