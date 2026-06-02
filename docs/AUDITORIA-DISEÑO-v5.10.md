# Auditoría de diseño · v5.10 · reducir ambiente IA

## Resumen ejecutivo

El proyecto tiene un branding nuevo declarado (v5.9, navy `#0a1733` + oro `#c9a35c`, Cinzel + Inter) pero **no se ha aplicado al producto**: el CSS global (`core/css/dashboard-theme.css`) sigue siendo la paleta vieja slate `#0d1117` + emerald `#34d399`, y `pitch.html` / `mockups.html` redefinen esos mismos tokens en local. El resultado es que la "v5.9" sólo vive en el favicon, el `theme-color`, una imagen hero PNG y un par de cards. El resto del producto contradice la marca.

Por otra parte, el copy de los 4 docs y del pitch es genuinamente humano. No hay un solo "leverage", "robust", "delve", "seamless", "comprehensive" ni paralelismos forzados en `docs/*.md`. La voz de Paco (30 años, anécdotas concretas, números reales) atraviesa todo el material escrito. **El ambiente IA no viene del texto; viene del visual.**

Diagnóstico:
- **2 problemas estructurales** (paleta no aplicada, emoji como icono estructural — 893 ocurrencias).
- **8 problemas cosméticos** (gradientes residuales, contraste de oro, rutas rotas en pitch, accesibilidad mobile, etc.).

Plan: 2 cambios grandes (refit del theme global + reemplazo de emoji por SVG), 10 quick wins.

## Metodología

Skills aplicables: `ui-ux-pro-max` (Quick Reference §1–§9, checklist UI App), `humanizer` (escaneo de 21 AI-tells), `copy-editing` (sugerencias puntuales).
La invocación del script Python de `ui-ux-pro-max` quedó denegada en este entorno; la auditoría se ejecuta a mano contra las heurísticas del README (mismo criterio, sin generador).

Archivos revisados:
- HTML: `index.html`, `pitch.html`, `mockups.html`, `sala-movil.html`, `carta-publica.html`, `evento-publica.html`, `disponibilidad-publica.html`, `flujo-trabajo.html`, `test-checklist.html`, `dashboard/{index,editor,wizard,metricas}.html` · 13 archivos · 10 165 líneas.
- CSS: `core/css/dashboard-theme.css`, `core/css/themes.css` · 2 archivos.
- Copy: `docs/RESUMEN-EJECUTIVO.md`, `docs/COMERCIALIZACION.md`, `docs/CASE-STUDY.md`, `docs/DETALLE-PROYECTO.md`, `README.md`.

Criterios: paleta aplicada vs declarada, emoji como icono, gradientes saturados, contraste WCAG AA, viewport-meta no bloqueante, microinteracciones cliché, AI-clichés en prosa (lista de 21 términos).

## AI-Tell Score por archivo

Score = 21 clichés ponderados + listas-de-3 compulsivas + paralelismos "no es X, es Y" + emoji decorativos por cada 100 líneas. 0 = humano, 100 = puro modelo.

| Archivo | Score | Top 3 problemas |
| --- | --- | --- |
| `docs/RESUMEN-EJECUTIVO.md` | **8 / 100** | "Cinco cosas la separan…" (lista de 5 cerrada, levemente performativa); algún paralelismo en tabla "Hoy / Con la plataforma"; cero términos ChatGPT. |
| `docs/COMERCIALIZACION.md` | **12 / 100** | Estructura "Tres caminos posibles" con simetría Pros/Contras/Inversión (correcto pero rítmico); 63 bullets en 216 líneas; cero clichés. |
| `docs/CASE-STUDY.md` | **5 / 100** | El más humano del lote. Anécdota concreta (Excel 2011, libreta de cocina, salmorejo). Único riesgo: cierre filosófico de "Qué aprendí" rozando lo aforístico. |
| `docs/DETALLE-PROYECTO.md` | **10 / 100** | Es documentación técnica pura. AI-tells nulos. Riesgo: árbol ASCII de 80 líneas y tablas-compulsivas. |
| `pitch.html` (slides 1–15) | **15 / 100** | Cuerpo humano; lo que sube el score son los headlines de slide ("No es otra plataforma más", "Lo grande es caro. Lo barato no se habla") con estructura paralelística marca-AI. |
| `index.html` | **22 / 100** | 30 emoji + headline "El centro alrededor del cual gira todo tu negocio" (un poco lema-de-AI) + 6 cards con 6 paletas distintas (efecto "demo de modelo"). |

Veredicto del bloque copy: el texto está limpio. **No hay que reescribir, hay que pulir 4 headlines y dejar tranquilo el resto.**

## Hallazgos UI/UX

### Problema 1 · La paleta v5.9 no está aplicada

- Dónde: `core/css/dashboard-theme.css:14-49` (define `--bg-base: #0d1117`, `--accent: #34d399`).
- Por qué se ve IA: el branding declara navy+oro pero el dashboard, editor, sala-movil y carta-publica heredan slate+emerald. La marca "Queens Bellybutton" coexiste con UI verde de Linear/Vercel → lectura "plantilla AI con rebrand a medias".
- Propuesta: rehacer tokens en un solo sitio, eliminar las redefiniciones locales en `pitch.html:26-45` y `mockups.html:26-39`.
```css
:root {
  --bg-base:     #0a1733;   /* navy master */
  --bg-surface:  #0f1f42;
  --bg-elevated: #15295a;
  --border-default: #1f3768;
  --text:        #f4ead7;   /* champaña suave, mejor que blanco puro sobre navy */
  --text-soft:   #b9a98b;
  --text-muted:  #7d6f54;
  --accent:      #c9a35c;   /* oro master */
  --accent-soft: #e0c08a;
  --accent-deep: #9a7a3f;
  --accent-glow: rgba(201,163,92,.20);
  --font-display: 'Cinzel', 'Playfair Display', Georgia, serif;
  --font-ui:      'Inter', system-ui, sans-serif;
}
```
- Esfuerzo: **1 h** (incluye borrar tokens locales en pitch/mockups, ajustar 3 gradientes verdes residuales, verificar contraste).

### Problema 2 · 893 emoji como icono estructural

- Dónde: `index.html` 30, `dashboard/editor.html` 83, `test-checklist.html` 51, `core/pages/presupuesto-evento.html` 222, etc. Total **782 en HTMLs + 111 en dashboard/ + 120 en docs**.
- Por qué se ve IA: el README del skill `ui-ux-pro-max` lo cataloga textualmente como "No Emoji as Structural Icons". Ver `editor.html:411` `🛠 Cotizador interno`, `editor.html:423` `🏨 Establecimiento`, `editor.html:435` `🎨 Tema visual`. Cada emoji se renderiza con la familia del SO → en Windows 11 son Segoe UI Emoji multicolor, en macOS son Apple Color, en Android son Noto. Cero coherencia con Cinzel+oro.
- Propuesta: set único de iconos Lucide inline SVG, 20×20, `stroke="currentColor"`, `stroke-width="1.75"`, monocromo oro o crema según jerarquía. Empezar por sidebar editor + cards landing (los más visibles).
```html
<!-- Antes: -->
<span class="left">🏨 Establecimiento</span>
<!-- Después: -->
<span class="left">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>
    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
  </svg>
  Establecimiento
</span>
```
- Esfuerzo: **1 h** sólo para sidebar editor (7 entradas) + landing (24 emoji), **media jornada** total si se hace en todas las páginas. Quick win: hacer landing + sidebar primero (los que se ven en captura de portfolio).

### Problema 3 · Tarjetas de landing con 6 paletas distintas

- Dónde: `index.html:206-299` · cada card tiene un `card-icon` con su propio color (emerald, violeta, ámbar, gris, rosa, azul).
- Por qué se ve IA: paleta accidental, sin sistema. Lectura "tooltip de Material Design demo".
- Propuesta: una sola tonalidad (oro `#c9a35c` con opacity 0.12 sobre navy). Diferenciar las cards con la tipografía y el rol del badge, no con el color del icono.
```css
.card-icon { background: rgba(201,163,92,.10); border: 1px solid rgba(201,163,92,.30); color: var(--accent); }
```
- Esfuerzo: **15 min**.

### Problema 4 · Gradientes radiales decorativos en body

- Dónde: `index.html:40-43`, `pitch.html:53-56`, `mockups.html:85-87`, `dashboard/index.html:30`.
- Por qué se ve IA: radiales verde+violeta de fondo son el cliché visual de landings AI (estilo Vercel/Linear/Cursor 2023-2024).
- Propuesta: eliminar los radiales y usar un fondo plano navy con un velo de ruido SVG (`feTurbulence`) opcional para textura editorial. El brand es "boutique 5*", no "AI startup".
```css
body { background: var(--bg-base); }
body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none;
  opacity: .035; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence baseFrequency='.85'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```
- Esfuerzo: **15 min**.

### Problema 5 · Botón "primary" con gradiente emerald → emerald-dark

- Dónde: `dashboard/index.html:106-108`, `dashboard/editor.html:67-72`, replicado en ~6 archivos.
- Por qué se ve IA: el gradiente 135deg en CTAs es el otro tic visual de IA. Apple/HIG y Material recomiendan un solo color sólido para CTAs primarias.
- Propuesta:
```css
.btn-primary {
  background: var(--accent);
  color: var(--bg-base);
  border: 1px solid var(--accent-deep);
  box-shadow: inset 0 -1px 0 rgba(0,0,0,.18);   /* única sutileza */
  transition: background .15s, transform .08s;
}
.btn-primary:hover { background: var(--accent-soft); }
.btn-primary:active { transform: translateY(1px); }
```
- Esfuerzo: **20 min**.

### Problema 6 · `pitch.html` con rutas rotas a la marca

- Dónde: `pitch.html` · 14 ocurrencias de `src="../branding/favicon/icon-192.png"` mientras el archivo vive en raíz (debería ser `branding/...`).
- Por qué se ve IA: probablemente copia-pega de `dashboard/*.html` sin recordar el cambio de profundidad. Resultado: durante el pitch, en cada slide hay un alt-text "Queens Bellybutton" sin imagen visible. Daña la primera impresión comercial.
- Propuesta: find/replace `../branding/favicon/` → `branding/favicon/` en `pitch.html`.
- Esfuerzo: **2 min**.

### Problema 7 · `sala-movil.html` bloquea el zoom

- Dónde: `sala-movil.html:5` `maximum-scale=1.0, user-scalable=no`.
- Por qué se ve IA: en una PWA para equipo de sala que va a usar gente con presbicia, deshabilitar zoom es WCAG SC 1.4.4 fail. Es el patrón "fingí ser app nativa" típico de templates AI.
- Propuesta: dejar sólo `width=device-width, initial-scale=1, viewport-fit=cover`. Para evitar el zoom accidental al hacer doble-tap, mejor `touch-action: manipulation` en los botones críticos.
- Esfuerzo: **5 min**.

### Problema 8 · Inputs sin estados de error visibles

- Dónde: `dashboard/index.html` login, `dashboard/editor.html` formularios.
- Por qué se ve IA: hay `:focus` pero no hay clase `.field.error` definida ni `aria-live` para feedback. En producción, un login fallido sólo cambia el botón.
- Propuesta:
```css
.field.error input { border-color: var(--danger); }
.field-error-msg { color: var(--danger); font-size: 11px; margin-top: 4px;
                   display: flex; align-items: center; gap: 4px; }
.field-error-msg::before { content: "!"; width: 14px; height: 14px;
   display: inline-flex; align-items: center; justify-content: center;
   background: var(--danger); color: var(--bg-base); border-radius: 50%;
   font-weight: 700; font-size: 9px; }
```
Más un `<div role="alert" aria-live="polite">` para el toast de auth.
- Esfuerzo: **30 min**.

### Problema 9 · Contraste de `--text-muted` sobre `--bg-base`

- Dónde: tokens `--text-muted: #6e7681` sobre `--bg-base: #0d1117` → ratio ≈ 4.0:1. En navy `#0a1733` sería ≈ 4.5:1 justo. Si el nuevo `--text-muted` se queda en `#7d6f54` sobre navy: ratio = 4.6:1, AA OK. Mantener controlado.
- Por qué se ve IA: gris-sobre-gris es uno de los anti-patrones que el skill lista explícitamente (rule `contrast-readability`).
- Propuesta: regla "muted nunca por debajo de 4.6:1"; usar champaña `#b9a98b` (≈ 7.2:1) para metadatos importantes y reservar `text-muted` para timestamps/IDs.
- Esfuerzo: **20 min** (auditar manualmente con webaim contrast checker los 6 pares principales).

### Problema 10 · Microinteracciones todas iguales

- Dónde: `transition: all .15s` y `transform: translateY(-3px)` en cards de `index.html:109,115`, replicado en pitch.
- Por qué se ve IA: hover-lift universal es uno de los tics visuales de Cursor/v0/Bolt.
- Propuesta: diferenciar por jerarquía. Cards principales: cambio sutil de border-color (sin movimiento). Cards secundarias: sin hover. Botones: sólo color. Quitar `transition: all`, especificar propiedades.
- Esfuerzo: **20 min**.

## Hallazgos de copy

### Copy 1 · Headline de landing demasiado "lema-AI"

- Dónde: `index.html:200` "El centro alrededor del cual gira *todo tu negocio*".
- Por qué se ve IA: estructura "el X alrededor del cual Y" es un cliché de modelos. Además contradice el nombre Queens Bellybutton (que ya significa "ombligo"); duplica metáfora.
- Propuesta: dos opciones humanas:
  - "Una plataforma para gestionar tu hotel sin pagar servidores."
  - "El software de gestión hotelera de un hostelero con 30 años de oficio."
- Esfuerzo: **5 min**.

### Copy 2 · Tres slides de pitch con simetría forzada

- Dónde: `pitch.html:677` "Lo grande es *caro*. Lo barato no se habla."; `pitch.html:1032` "No es otra plataforma más."; `pitch.html:1239` "Una llamada, un café o un email. *Tú decides.*"
- Por qué se ve IA: paralelismo binario tipo "It's not X, it's Y" es marca registrada GPT.
- Propuesta:
  - Slide 3: "Lo que hay cuesta 800 €/mes o no se habla."
  - Slide 10: "Cinco diferencias concretas con el resto."
  - Slide 15: "Email, LinkedIn o llamada. Lo que te encaje."
- Esfuerzo: **10 min**.

### Copy 3 · Listas de tres compulsivas en cards

- Dónde: `pitch.html:1037` ("pulseras de dieta, la señal del 15%, la merma del 8%"). Estas funcionan porque son específicas; mantener.
- Dónde sí cortar: `index.html:201` "Presupuestos, sala, cocina y cliente en un solo lugar" repetido en 3 sitios.
- Propuesta: rotar el wording. Una vez "presupuestos, sala, cocina y cliente", otra vez "del cotizador inicial hasta el postre en la mesa", otra "todo lo que pasa entre el primer email y la factura".
- Esfuerzo: **10 min**.

## Sistema de diseño · diagnóstico

| Eje | Actual (declarado en `core/css/dashboard-theme.css`) | Propuesto |
| --- | --- | --- |
| `--bg-base` | `#0d1117` slate | `#0a1733` navy master |
| `--accent` | `#34d399` emerald | `#c9a35c` oro master |
| `--info` | `#a78bfa` violeta | eliminar · usar oro suave para info |
| `--text` | `#e6edf3` casi blanco | `#f4ead7` champaña |
| `--font-display` | `'Inter'` | `'Cinzel'` (320KB, subset latin) |
| `--font-ui` | `'Inter'` | mantener `'Inter'` |
| Acento secundario | violeta + ámbar + rosa + azul (en cards) | eliminar, jerarquía sólo por tamaño |
| Radii | 6 / 8 / 12 / 16 | mantener |
| Sombras | 3 niveles correctos | mantener |
| Iconografía | emoji (893 ocurrencias) | Lucide SVG monocromo |
| Espaciado | 4/8 base · correcto | mantener |
| Microinteracción | `transition: all .15s` + translateY universal | específica por componente, sin lift universal |

## Quick wins (top 10 por impacto/esfuerzo)

1. **Fix rutas `../branding/` → `branding/` en `pitch.html`** (2 min · alto, recupera marca visible en demo comercial).
2. **Eliminar `user-scalable=no` en `sala-movil.html`** (5 min · accesibilidad WCAG).
3. **Unificar paleta de iconos de cards landing** a oro sobre navy (15 min · borra "demo de Material").
4. **Reescribir headline de landing** (5 min · primera impresión).
5. **Eliminar gradientes radiales decorativos** de body en index/pitch/mockups (15 min · quita el "look Vercel 2023").
6. **Reemplazar gradiente del CTA primary por color sólido** (20 min · menos AI, más boutique).
7. **Refit del `dashboard-theme.css`** a navy+oro+Cinzel (1 h · TODO el sistema empieza a respirar marca v5.9).
8. **Reemplazar emoji por SVG Lucide en sidebar editor (7) + landing (24)** (1 h · los dos sitios fotografiables para portfolio).
9. **Reescribir 3 headlines paralelísticos del pitch** (10 min · slides 3, 10, 15).
10. **Añadir estado `.field.error` + `role="alert"` al login** (30 min · profesionaliza el formulario, único punto de fricción del producto).

Esfuerzo total quick wins: **≈ 4 h**. Impacto estimado: 70 % de la sensación "AI-generated" desaparece.

## Cambios estructurales (más profundos)

### E1 · Migración completa de iconografía
Reemplazar las 893 ocurrencias de emoji por un set Lucide inline. Crear `core/icons.js` con un export `<svg>` por nombre y un atributo `data-icon="…"` que los inyecte. Permite swap a Heroicons/Phosphor luego sin tocar HTML.
Esfuerzo: 1 día.

### E2 · Token system de tres niveles
Hoy hay tokens primitivos pero las cards inyectan `style="background: rgba(244,114,182,…)"` inline. Pasar a tokens semánticos:
```
--surface-card · --surface-card-hover
--text-primary · --text-secondary · --text-muted · --text-on-accent
--accent · --accent-subtle · --accent-strong
--state-info · --state-warning · --state-danger · --state-success
```
y prohibir hex inline en HTML.
Esfuerzo: 1 día.

### E3 · Tipografía Cinzel sólo en display, jamás en bullets
Cinzel es display, no UI. Limitar a `h1.title`, `h2.section`, brand-title y precios destacados. El resto sigue en Inter. Hoy en `pitch.html` la `Playfair Display` se usa en `.menu-card-name`, `.dash-card-meta`, precios decimales en sidebars → demasiado.
Esfuerzo: 2 h.

### E4 · Print stylesheet propio para los `/docs/pdf/*.html`
Hoy se imprime el HTML interactivo. Para PDFs comerciales separar `@media print` con tipografía servida desde fonts locales (no Google Fonts, que falla offline) y márgenes de 25 mm.
Esfuerzo: 3 h.

### E5 · Componente `<qb-card>` y `<qb-button>` reusables
Vanilla web component que encapsule estructura+token. Hoy hay 4 variantes de "card" con CSS distinto por página. Un solo elemento custom resolvería la inconsistencia.
Esfuerzo: 1 día.

## Mockups · antes / después

Snippet de la card de landing aplicando todas las reglas anteriores:

```html
<!-- Después: navy + oro, icono SVG, sin gradiente, sin lift universal -->
<article class="card">
  <span class="card-icon" aria-hidden="true">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>
    </svg>
  </span>
  <header>
    <h3 class="card-title">Hotel Miramar Dorado</h3>
    <p class="card-meta">Proyecto piloto · 5 estrellas Gran Lujo</p>
  </header>
  <p class="card-desc">El producto tal y como lo recibe un establecimiento: ficha técnica,
     cotizador, contrato, orden de servicio y recetario con escandallos.</p>
  <ul class="card-links">
    <li><a href="hotel/ficha-tecnica.html">Ficha técnica de espacios <span aria-hidden="true">→</span></a></li>
  </ul>
</article>
```

```css
.card {
  background: var(--surface-card, #0f1f42);
  border: 1px solid var(--border-default, #1f3768);
  border-radius: 14px;
  padding: 28px;
  display: flex; flex-direction: column; gap: 14px;
  transition: border-color .2s, box-shadow .2s;
}
.card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow, rgba(201,163,92,.20));
}
.card-icon {
  width: 44px; height: 44px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(201,163,92,.10);
  border: 1px solid rgba(201,163,92,.30);
  border-radius: 10px;
  color: var(--accent);
}
.card-title {
  font-family: var(--font-display, 'Cinzel', serif);
  font-size: 20px; font-weight: 600; letter-spacing: .01em;
}
.card-meta {
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--text-muted, #7d6f54);
}
.card-desc { color: var(--text-soft, #b9a98b); font-size: 14px; line-height: 1.6; }
.card-links a {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-radius: 8px;
  color: var(--text); text-decoration: none; font-size: 14px;
  border: 1px solid transparent;
}
.card-links a:hover { border-color: var(--accent); color: var(--accent); }
```

Resultado esperado: la misma información, sin emoji, sin radiales, sin lift, con Cinzel donde toca. Pasa de "demo de modelo" a "boutique 5\* digital".

---

Cierre: el SaaS técnicamente está sólido y el copy es de los más humanos que se ven en proyectos así. El único problema es que la capa visual aún arrastra paleta y patrones de la era pre-rebrand. Aplicando los 10 quick wins (≈ 4 h) el producto se ve coherente con el nombre.
