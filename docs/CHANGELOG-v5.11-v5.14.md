# Changelog · Queens Bellybutton v5.11 → v5.14

> Junio 2026 · Cuatro versiones consecutivas que cierran auditoría, refinan
> diseño visual, profesionalizan el catálogo de recetas y añaden panel
> superadmin.

---

## v5.11 (PR #45) · Cierre de auditoría v5.10

Aplica los 9 correctivos altos identificados en la auditoría tridimensional
de v5.10 (ingeniería + diseño + comercial).

**Engineering altos (8):**
- Criptografía PAT con prefijo `ghp_` o `github_pat_` validado
  contra regex estricta (antes solo se chequeaba longitud)
- i18n race condition arreglado: `_localeRequestId` guard evita
  que dos `setLocale` concurrentes pisoteen el resultado
- Safari < 16.4 compatibility: `mdToHtml` reescrito sin regex lookbehind
  (rompía el chat IA en iPad antiguo)
- TTL 7 días en drafts de `localStorage` (antes acumulación infinita)
- `console.warn` en `loader.js` cuando project id inválido
  (antes fallback silencioso confundía debugging)
- Escape en cuerpos de error expuestos por `github-api.js` (XSS defensivo)
- Cuerpo de error de fetch saneado antes de mostrar al usuario
- `getRepoBase()` default alineado entre `metrics.js` y `loader.js`
  (`'../../'` ambos), fixing 404s en `/core/pages/`

**Design altos (5):**
- Headline landing reescrito sin clichés ("Gestión hostelera sin
  frameworks, con datos del cliente")
- Pitch deck: 2 headlines paralelísticos reescritos para mejor cadencia
- Pitch deck: 14 paths rotos `../branding/` → `branding/` (404s en GH Pages)
- CTA dashboard: gradiente → gold sólido (más legible)
- `role="alert"` en errores de login para accesibilidad

**Hotfixes v5.11.1 → v5.11.4:**
- v5.11.1: dish name en modal de composición era `<a>` con
  stopPropagation, bloqueaba el toggle del checkbox al hacer click
- v5.11.2: SW_VERSION estaba estancada en 5.0.0 desde mayo (11 deploys
  invisibles para clientes con SW cacheado). Bumpeada a 5.11.2.
- v5.11.3: `metrics.js` getRepoBase desalineado con loader.js
- **v5.11.4 (crítico):** `.sel-card::before` pseudo-elemento estaba
  interceptando clicks por hit-testing. Fix: `pointer-events: none`.
  Este era el bug por el que "Ver composición" no abría modal.

**Lección operativa:** SW_VERSION debe bumparse en CADA deploy con
cambios de shell, no solo en versiones mayores. Once deploys sin bump
significó que ningún usuario con visita previa veía las novedades.

---

## v5.12 (PR #46) · Iconos al lado del nombre

Decisión visual del usuario: los emojis dejan de flotar sobre las
imágenes de las cards y se reubican como **badge dorado pequeño al
lado del nombre del plato**.

| Archivo | Cambio |
| --- | --- |
| `core/pages/presupuesto-evento.html` | `.pkg-icon` y `.pkg-badge` removidos de `.pkg-thumb`. Nuevo `.sel-name-icon` (span inline) en todos los `.sel-name`. |
| `core/pages/recetario.html` | `emoji-overlay` y `modal-hero-emoji` removidos. Nuevos `.card-name-icon` (1.2rem) y `.modal-title-icon` (1.5rem). |
| `sw.js` | `SW_VERSION = '5.12.0'` |

CSS común aplicado: badge cuadrado 1.8rem con fondo `var(--gold-dim)`,
borde `var(--gold-border)`, margin-right 8-10px.

**Verificación:** 67 unit tests + 16 E2E.

---

## v5.13 (PR #47) · Escandallos detallados + sidebar de categorías

Tres cambios estructurales:

### 1. +36 fichas con precios Makro mayorista 2026

Recetario Miramar: **78 → 114 recetas**. Cada ficha nueva incluye:
- Ingredientes con gramaje exacto por ración
- Precio Makro indicado entre paréntesis (`16€/kg`, `45€/kg`, `4€/g`, etc.)
- 5-9 pasos de elaboración profesional
- Alérgenos declarados
- Materia prima `mp` por ración

Distribución:
- Entremeses: +9 (brochetas manchego/cherry/fresa, croquetas clásica
  y líquida ibérica, cucharilla salmorejo, vasito gazpacho, canapé
  foie, blini salmón, tartar cucurucho, caviar Beluga)
- Entrantes: +5 (carpaccio ternera, salmorejo sin gluten, ensalada
  gamba roja, tataki atún, tartar atún sin gluten)
- Postres: +7 (coulant 72%, crema catalana flameada, bienmesabe
  tartaleta, mini tarta La Viña, sorbete limón, mini pavlova, macarón)
- Cócteles: +7 (Aperol Spritz, Mojito Andaluz, Brisa Mediterránea
  signature, Old Fashioned, Espresso Martini, Negroni, Málaga Sour)

### 2. Nueva categoría "estaciones en vivo" (+8)

Carving jamón DOP Guijuelo, barra sushi con sushiman, wok asiático,
pasta fresca, pizzas al horno de leña, barra ostras y mariscos,
ceviche bar, eggs benedict brunch.

Las fichas de estaciones desglosan:
- Materia prima por pax
- Personal contratado (sushiman 35€/h, cortador 40€/h, pizzaiolo 30€/h)
- Alquiler de equipo (vitrina refrigerada 40€, horno leña móvil 80€)
- Coste/pax final desglosado en el último paso

### 3. Sidebar vertical sticky

`core/pages/recetario.html` reorganizado:
- En desktop (>900px): sidebar de 260px sticky con 3 grupos
  (Carta · Eventos · Operativa)
- En móvil: fallback a nav horizontal scrolleable
- Pills con conteo real actualizado desde `R[cat].length`

SW_VERSION → 5.13.0.

---

## v5.14 (PR #48) · Dashboard superadmin diferenciado

Nuevo `dashboard/superadmin.html` con **paleta deliberadamente
distinta** del resto del producto (verde+negro vs azul-marfil-oro).
Decisión del usuario: romper coherencia a propósito para señalizar
"este es otro modo".

### Paleta nueva (solo en este HTML)

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#060A07` | Fondo negro verdoso |
| `--green-deep` | `#0F4D2E` | Brand mark, proyecto avatars |
| `--green-bright` | `#00E676` | Accent, sparklines, pills, KPI deltas |
| `--green-glow` | `#00FF88` | Hover state, glow shadow |
| `theme-color` meta | `#0a1612` | vs `#0a1733` del dashboard director |

### Componentes

- **Auth gate:** verifica `scope === 'super-admin'`. Si no, muestra
  card "Acceso restringido" con link al login.
- **4 KPI cards** con sparklines SVG inline (Proyectos activos,
  Presupuestos, Volumen €, Próximos 30d)
- **Chart de volumen mensual** SVG con gradient fill, toggles 6M/12M/YTD
- **Tabla de proyectos** con health pills (activo/borrador/pausado),
  mini-sparkline 7d, presupuestos y volumen
- **Top 5 paquetes** con barras de progreso verdes
- **Distribución por tipo de evento**
- **Activity feed** con timestamps relativos ("hace 3d")

### Acceso

Botón "🛡️ Panel Superadmin" en `dashboard/index.html` que aparece
**solo** si `session.scope === 'super-admin'`, con gradiente
verde+sombra glow para diferenciarlo visualmente.

### Tests E2E nuevos

`e2e/superadmin.spec.js` con 3 specs:
- Sin sesión → muestra auth gate
- theme-color verde aplicado
- Título identifica el panel

**Verificación final:** 67 unit + 19 E2E (16 anteriores + 3 nuevos).

SW_VERSION → 5.14.0.

---

## Resumen ejecutivo de las 4 versiones

| Versión | Tema | Líneas tocadas | PR |
| --- | --- | --- | --- |
| v5.11 | Cierre auditoría + 4 hotfixes | ~600 | #45 |
| v5.12 | Iconos al lado del nombre | ~90 | #46 |
| v5.13 | Escandallos + sidebar | ~4 270 | #47 |
| v5.14 | Panel superadmin verde+negro | ~1 309 | #48 |

**Total:** 4 PRs, ~6 270 líneas, 0 regresiones en tests.
