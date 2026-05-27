# Plataforma F&B · Arquitectura multi-tenant

> Documento de diseño · v1.0 · 27-mayo-2026
> Cambio de visión del producto: de **app a medida** a **plataforma de creación de apps F&B**.
> Hotel Miramar Dorado pasa de ser el producto único a ser el **proyecto piloto** y **template de referencia**.

---

## 1 · Visión del producto

Una plataforma web que permite a Paco (y eventualmente otros consultores hosteleros) **crear y mantener aplicaciones de gestión F&B personalizadas** para establecimientos de hostelería — hoteles, restaurantes, salones de banquetes, catering — introduciendo únicamente los datos del establecimiento concreto.

El **Hotel Miramar Dorado** es la materialización completa del producto final: ficha técnica, presupuesto interactivo de eventos, contrato auto-rellenable, orden de servicio operativa, recetario con escandallos, sistema de dietas especiales, fotos generadas por IA. Sirve a dos propósitos:

- **Demo comercial** — se le muestra a un cliente potencial: «esto es lo que vas a tener».
- **Template de configuración** — cuando llega un cliente nuevo, se duplica el proyecto y se reemplazan los datos.

El producto comercial es el **dashboard del director**: la herramienta que permite ese flujo de creación, edición y mantenimiento.

---

## 2 · Glosario

| Término | Significado |
|---|---|
| **Plataforma** | El sitio completo desplegado en GitHub Pages. Contiene el motor, todos los proyectos y el dashboard. |
| **Motor (`/core/`)** | Código reutilizable: HTMLs genéricos, JS de lógica de negocio, CSS de diseño. No contiene datos de ningún establecimiento. |
| **Proyecto** | Un establecimiento concreto. Carpeta `/projects/<id>/` con sus JSON de configuración y assets. |
| **Piloto** | El proyecto Miramar Dorado. Es el proyecto-canónico y se usa como template al crear uno nuevo. |
| **Dashboard** | La interfaz del director (`/dashboard/`) para listar, crear, editar y monitorizar proyectos. |
| **Producto final** | Lo que ve un cliente del establecimiento: la app pública (ficha técnica + presupuesto + contrato + orden + recetario interno). |

---

## 3 · Principios de diseño (decisiones tomadas)

| # | Decisión | Justificación |
|---|---|---|
| D1 | **Multi-tenant, un solo deploy** en GitHub Pages | Una sola fuente de verdad, hosting gratis, cero infraestructura. Cada proyecto se accede vía `?proyecto=<id>`. |
| D2 | **Editor visual** (formularios, cero JSON expuesto al usuario) | El público objetivo son hosteleros, no técnicos. La fricción de JSON mata la adopción. |
| D3 | **Tú admin + 1 login por establecimiento** | Mantienes el control sobre todos los proyectos, pero los clientes pueden mantener su contenido (fotos, menús del día, fechas). |
| D4 | **Vanilla static + JSON en repo** | Coherente con el stack actual. Cero coste mensual, cero servidor que mantener, deploy automático en cada commit. |
| D5 | **Escritura vía GitHub API con Personal Access Token** | El dashboard hace commits automáticos. El PAT vive solo en tu navegador (localStorage cifrado o env var). |
| D6 | **Refactor del piloto a multi-tenant primero, dashboard después** | Asegura cimientos sólidos. Antes de construir el dashboard hay que demostrar que el piloto funciona consumiendo datos externos. |

### Decisión derivada (D7): Modelo de seguridad

Stack vanilla + multi-user es una **tensión real** que se resuelve así:

- **Auth = soft auth (cliente-side)**. Passwords hasheadas con `bcryptjs` en navegador, guardadas en `auth.json` por proyecto. Suficiente para evitar acceso casual; **NO es seguridad de producción**.
- **El PAT de GitHub vive solo en TU navegador**. Cuando un cliente edita su proyecto, el commit se firma con tu PAT (autor del commit: «Edición vía dashboard – Hotel X»). El cliente nunca tiene credenciales de Git.
- **Trade-off aceptado**: si un cliente malicioso inspecciona el código, puede en teoría extraer el hash y hacer brute-force offline. Para portfolio/demo y clientes confiables esto es aceptable. **Si llega a hacer falta seguridad real → backend o BaaS (Supabase) en fase futura**.

---

## 4 · Modelo de datos

### 4.1 · Qué se externaliza a JSON por proyecto

Todo lo que cambia entre establecimientos. Estructura propuesta por proyecto:

```
projects/<id>/
├── config.json           # Metadatos del proyecto (nombre, slug, tema, locale)
├── establecimiento.json  # Ficha del establecimiento (datos legales, contacto, espacios, equipo)
├── eventos.json          # Catálogo de tipos de evento (boda, comunión, gala, MICE...)
├── menus.json            # 27 paquetes: sentado, cóctel, desayunos, coffee, brunch, barra libre, custom
├── recetas.json          # El recetario completo: entremeses, entrantes, primeros, segundos, postres, cócteles
├── productos.json        # Catálogo de materias primas + precios €/kg
├── dietas.json           # Las 7 dietas especiales y sus instrucciones por departamento
├── bebidas.json          # Carta de bebidas (vinos, refrescos, barra libre)
├── extras.json           # Mesas, flores, música, fotografía, dulces, etc.
├── auth.json             # Hashes de passwords (super-admin + 1 user del proyecto)
├── budgets/              # Histórico de presupuestos guardados (para métricas)
│   └── PRES-2026-1234.json
└── assets/               # Fotos del establecimiento, platos, eventos
    ├── hotel/
    ├── platos/
    └── eventos/
```

### 4.2 · Qué queda en el motor (`/core/`)

Sólo cosas que NO dependen del establecimiento:

- **HTMLs genéricos**: `ficha-tecnica.html`, `presupuesto-evento.html`, `contrato-servicios.html`, `orden-servicio.html`, `recetario.html`. Son shells que cargan datos vía fetch al arrancar.
- **Lógica de negocio**: cálculos de pax facturable, food cost, escandallo, generación de planos SVG, sistema de dietas.
- **Diseño**: la paleta Navy Boutique, fuentes Cormorant + DM Sans, componentes (`.comp-section`, `.svc-row-detail`, etc.). Aplicable a todos los proyectos por defecto. **Personalización del tema es fase 2** (D9).
- **Catálogo UE de alérgenos**: los 14 alérgenos del Reglamento 1169/2011. Es legislación, no varía por establecimiento.

### 4.3 · Esquema JSON · ejemplo `establecimiento.json`

```json
{
  "razon_social": "Hoteles Miramar Dorado S.L.",
  "nombre_comercial": "Gran Hotel Miramar Dorado",
  "categoria": "5 estrellas Gran Lujo",
  "nif": "B-12345678",
  "direccion": {
    "calle": "Paseo Marítimo s/n",
    "cp": "29602",
    "ciudad": "Marbella",
    "provincia": "Málaga",
    "pais": "España"
  },
  "registro_turismo": "H/MA/01234",
  "contacto": {
    "telefono": "+34 952 12 34 56",
    "email": "eventos@miramardorado.com",
    "web": "www.miramardorado.com"
  },
  "espacios": [
    { "id": "salon", "nombre": "Salón Cristal", "capacidad_sentado": 220, "capacidad_coctel": 350 },
    { "id": "jardin", "nombre": "Jardines Andalusíes", "capacidad_sentado": 180, "capacidad_coctel": 280 },
    { "id": "skybar", "nombre": "Sky Bar", "capacidad_sentado": 80, "capacidad_coctel": 150 }
  ],
  "equipo_clave": [
    { "rol": "Director F&B", "nombre": "—" },
    { "rol": "Jefe de Cocina", "nombre": "—" }
  ]
}
```

> Diseño: todos los JSON tienen `$schema` apuntando a un esquema JSON Schema en `/core/schemas/` para validación + autocompletado en el editor.

---

## 5 · Arquitectura de carpetas (estado objetivo)

```
control-gestion-fnb/
├── index.html                  # Landing → si query ?proyecto=X carga el frontend público; si admin logueado redirige a /dashboard/
├── core/
│   ├── pages/                  # HTMLs genéricos
│   │   ├── ficha-tecnica.html
│   │   ├── presupuesto-evento.html
│   │   ├── contrato-servicios.html
│   │   ├── orden-servicio.html
│   │   └── recetario.html
│   ├── js/
│   │   ├── loader.js           # Lee ?proyecto=, carga todos los JSON necesarios
│   │   ├── presupuesto.js      # Lógica del cotizador (calcTotal, paxFacturable...)
│   │   ├── recetario.js        # Lógica del recetario (escandallo, alérgenos)
│   │   ├── exportador.js       # exportPresupuestoData → sessionStorage
│   │   ├── github-api.js       # Wrapper del GitHub REST API (commits, PRs)
│   │   ├── auth.js             # Hash/verify passwords con bcryptjs
│   │   └── editor/             # Componentes del editor visual del dashboard
│   ├── css/
│   │   ├── tokens.css          # Paleta Navy, espaciados, sombras (variables CSS)
│   │   ├── components.css      # .card, .svc-row, .modal, etc.
│   │   └── temas/              # Temas alternativos (fase 2)
│   └── schemas/                # JSON Schemas para validación
│       ├── establecimiento.schema.json
│       ├── menus.schema.json
│       └── recetas.schema.json
├── projects/
│   ├── miramar/                # El piloto canónico (lo migramos primero)
│   │   ├── config.json
│   │   ├── establecimiento.json
│   │   ├── menus.json
│   │   ├── recetas.json
│   │   ├── ... (resto)
│   │   ├── budgets/
│   │   └── assets/
│   ├── _template/              # Copiable al crear un proyecto nuevo
│   │   └── (JSON vacíos con ejemplos)
│   └── (futuros: hotel-x, restaurante-y)
├── dashboard/
│   ├── index.html              # Lista de proyectos + login
│   ├── editor.html             # Editor de un proyecto
│   ├── metricas.html           # KPIs del proyecto (solo Miramar al inicio)
│   └── wizard.html             # Crear proyecto nuevo desde template
├── docs/
│   ├── arquitectura-plataforma.md   ← este documento
│   ├── adr/                    # Decision records individuales
│   └── api-github.md           # Cómo configurar el PAT
├── scripts/                    # Generación de fotos, migración de datos
├── mockups/                    # Mockups históricos (se mantienen)
└── .test/                      # Capturas de Playwright/DevTools
```

### Convención de URLs

| Ruta | Significado |
|---|---|
| `/` | Landing: si hay `?proyecto=<id>` carga frontend público; si no, redirige a `/dashboard/`. |
| `/?proyecto=miramar` | Frontend público del hotel — la ficha de bienvenida. |
| `/?proyecto=miramar&page=presupuesto` | Cotizador del Miramar. |
| `/?proyecto=miramar&page=contrato` | Vista contrato. |
| `/?proyecto=miramar&page=orden` | Vista orden de servicio (interna). |
| `/?proyecto=miramar&page=recetario` | Recetario del Miramar. |
| `/dashboard/` | Login → lista de proyectos. |
| `/dashboard/editor.html?proyecto=miramar&seccion=menus` | Editor de menús del Miramar. |
| `/dashboard/metricas.html?proyecto=miramar` | KPIs del Miramar. |

---

## 6 · Stack técnico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | HTML5 + JS vanilla (ES2022) + CSS3 | Sin frameworks. Coherente con el estado actual. |
| Hosting | GitHub Pages (rama `main`) | Gratis, deploy automático en push. |
| Persistencia de datos | JSON commiteados al repo | Auditabilidad total (cada cambio queda en el historial git). |
| Persistencia de imágenes | El repo + Git LFS si supera 1 GB | Por ahora caben directas. |
| Editor de datos | Formularios HTML nativos + componentes JS propios | Sin frameworks. Validación con JSON Schema (lib Ajv via CDN). |
| Hash de passwords | `bcryptjs` (UMD via CDN) | 10 rounds por defecto. |
| Escritura al repo | GitHub REST API v3 (Octokit Browser) | El PAT vive en `localStorage` cifrado con la password del super-admin. |
| Métricas / charts | Chart.js (via CDN) | Standard de la industria, ligero, sin build step. |
| Tests | Playwright (ya instalado) + scripts manuales con Chrome DevTools MCP | Continuamos lo que ya hacemos. |
| Generación de imágenes IA | FLUX vía Pollinations.ai (ya integrado) | Sin API key, gratis. |

### Lo que NO se usa (y por qué)

- ❌ **React/Vue/Svelte**: añaden build step y complejidad. Vanilla es suficiente para este alcance y se ve más en bruto en el código (útil para portfolio porque demuestra fundamentos).
- ❌ **Node.js backend**: ya decidido (D4). Si en fase 3 hace falta auth real, se evalúa Supabase como BaaS antes que servidor propio.
- ❌ **Tailwind**: el sistema de tokens propio (Navy Boutique) es la identidad visual de la plataforma; no queremos diluirla.

---

## 7 · Dashboard del director · funcionalidad

### 7.1 · Pantalla LOGIN

- Campo email/usuario + password.
- Hash bcrypt verificado contra `auth.json` del proyecto seleccionado (o el super-admin global en `/dashboard/auth.json`).
- Tras login exitoso, almacena en `sessionStorage` un token JWT-like firmado client-side (caduca a las 8 h).

### 7.2 · Pantalla LISTA DE PROYECTOS (super-admin)

- Cards de cada proyecto: nombre, ciudad, fecha creación, último presupuesto, número de eventos próximos.
- Botón «➕ Nuevo proyecto» → wizard.
- Acciones por proyecto: «Editar» · «Ver métricas» · «Ver frontend público» · «Eliminar» (con confirmación).

### 7.3 · WIZARD «Nuevo proyecto»

Asistente paso-a-paso, 5 pasos:

1. **Información básica** — nombre, slug (id), ciudad, categoría (hotel/restaurante/catering).
2. **Copiar desde plantilla** — opciones: «Vacío» · «Hotel 5★ (basado en Miramar)» · «Restaurante» · «Catering».
3. **Ficha del establecimiento** — formularios para `establecimiento.json`.
4. **Cuenta del responsable del proyecto** — email + password (se hashea y se guarda en `auth.json`).
5. **Resumen y confirmación** → al confirmar, el dashboard:
   - Crea la carpeta `/projects/<slug>/` con los JSON inicializados.
   - Hace un commit «feat: crea proyecto <Nombre>».
   - Espera 30-60 s a que GitHub Pages redespliegue.
   - Redirige al editor del nuevo proyecto.

### 7.4 · EDITOR (proyecto)

Sidebar izquierda con secciones del proyecto:

- 🏨 Establecimiento — formulario tipo «ficha»
- 🎉 Tipos de evento — lista + drag&drop de orden
- 🍽️ Menús — el componente más complejo (paquetes, composición, precios, fotos)
- 📖 Recetario — CRUD de recetas, escandallo, alérgenos, ingredientes
- 📦 Productos — catálogo de materias primas y precios €/kg
- 🌿 Dietas especiales — instrucciones por departamento
- 🍷 Bebidas — paquetes y carta detallada
- ✨ Extras — mesas, flores, música, fotografía, dulces
- 🎨 Tema visual (fase 2) — paleta de colores personalizada
- 🔐 Usuarios y permisos — gestión del/los usuarios del proyecto

Cada sección con:
- **Vista lista** (cards/tabla)
- **Edición inline** o modal por ítem
- **Validación** con JSON Schema al guardar (errores visibles)
- **Botón guardar** explícito (no auto-save) → genera commit individual con mensaje claro
- **Preview en vivo** — botón «Ver frontend público» abre `?proyecto=<id>&page=...` en pestaña nueva

### 7.5 · MÉTRICAS (de momento solo Miramar)

5 widgets-pestañas (basados en tus respuestas):

#### 7.5.1 · Producción y operaciones
- Eventos celebrados últimos 30/90/365 días.
- Ratio personal/asistentes medio.
- Tiempos medios de servicio (cocina, sala) — input manual o vía orden de servicio confirmada.
- Consumos reales vs escandallo previsto.

#### 7.5.2 · Presupuestos generados
- Contador total, total facturable €, ticket medio.
- Top 5 tipos de evento.
- Tasa de conversión (presupuestos → contratos firmados).
- Gráfico de tendencia mensual (Chart.js line).

#### 7.5.3 · Agenda de próximos eventos
- Calendario tipo `react-big-calendar` pero vanilla — 1 mes / 1 trimestre.
- Ocupación por espacio (Salón Cristal, Jardines, Sky Bar) con barra de %.
- Click en evento → abre la orden de servicio correspondiente.

#### 7.5.4 · Análisis de menús y platos
- Top 10 menús más elegidos.
- Top 10 platos en menús custom.
- Frecuencia de dietas especiales (vegano, celíaco, halal…).
- Heatmap de combinaciones evento × menú.

#### 7.5.5 · Costes y márgenes
- Food cost real medio (calculado al guardar cada presupuesto con el escandallo del momento).
- Margen por tipo de evento.
- Top 5 productos más caros del escandallo.
- Alertas de productos con margen < 25 %.

### 7.6 · Requisito derivado: persistir presupuestos

Para que las métricas funcionen, cada presupuesto generado en el frontend público debe guardarse en `projects/<id>/budgets/`. Esto se hace **al pulsar «Generar contrato»** o «Generar orden de servicio» en el cotizador: se hace un commit con el JSON del presupuesto + referencia + timestamp.

**Decisión asociada**: el cliente del establecimiento (familia que quiere casarse en el hotel) NO comitea — solo el director cuando recibe el presupuesto. El frontend público envía el presupuesto vía un endpoint dummy (form action a una URL del dashboard) o lo guarda en localStorage y el director lo importa al dashboard. → **Pendiente: decidir flujo exacto** (sección 13).

---

## 8 · Plan de migración (fases)

### FASE 0 · Preparación · 1 sesión

- Crear documento de arquitectura (este).
- Crear esqueleto `docs/adr/` con un ADR por decisión (D1–D7).
- Tag git del estado actual: `v3.8-pre-platform` (para volver atrás si hace falta).

### FASE 1 · Externalizar datos del Miramar a JSON · 2-3 sesiones

**Objetivo:** mismos archivos HTML, mismas funcionalidades, pero los datos viven en JSON y los HTML los cargan vía fetch.

Pasos:
1. Crear `/projects/miramar/` con todos los JSON vacíos.
2. Migrar `menuPkgs` (de `cliente/presupuesto-evento.html`) → `projects/miramar/menus.json`.
3. Migrar `eventTypes` → `projects/miramar/eventos.json`.
4. Migrar `R` (recetario) → `projects/miramar/recetas.json`.
5. Migrar `DATOS_HOTEL` + datos de la ficha → `projects/miramar/establecimiento.json`.
6. Migrar `DIETA_INSTRUCCIONES` → `projects/miramar/dietas.json`.
7. Crear `core/js/loader.js` con función `async function loadProject(id)` que devuelve `{ project, menus, eventos, ... }`.
8. Refactor HTMLs: reemplazar literales JS por consumo del loader.
9. **Verificación E2E completa con Chrome DevTools MCP** (igual que la del Bloque C).
10. Commit + PR + merge.

**Riesgo principal:** romper algo del piloto que ya funcionaba. **Mitigación:** hacerlo por secciones (un JSON a la vez) y testear con Chrome DevTools MCP después de cada paso.

### FASE 2 · Multi-tenant routing · 1 sesión

**Objetivo:** la URL `?proyecto=<id>` selecciona qué cargar.

Pasos:
1. Mover los HTMLs de `cliente/` y `recetario/` a `core/pages/`.
2. Modificar `loader.js` para leer `?proyecto=` del URL.
3. Página `/index.html` (raíz) con landing tipo «¿Qué quieres hacer? · Ver demo Miramar · Acceder al dashboard».
4. Verificar que `?proyecto=miramar` reproduce el comportamiento actual exactamente.
5. Verificar que un segundo proyecto-vacío de prueba `?proyecto=demo` muestra los HTMLs con placeholders pero sin romperse.

### FASE 3 · Dashboard MVP · 3-4 sesiones

**Objetivo:** dashboard funcional con login, lista, editor de menús (la sección más compleja primero) y métricas básicas.

Pasos:
1. Crear `dashboard/index.html` con login + lista de proyectos.
2. Crear `dashboard/editor.html` con sidebar y al menos 3 secciones: establecimiento, menús, recetario.
3. Integrar `core/js/github-api.js` con Octokit Browser para commits automáticos.
4. Integrar `auth.js` con bcryptjs.
5. Wizard de creación de proyecto.
6. Métricas Miramar 1 (presupuestos) y 3 (agenda) — las otras llegan después.
7. Tests E2E con Chrome DevTools MCP.

### FASE 4 · Métricas completas + tema visual · 2-3 sesiones

- Las 5 pestañas de métricas.
- Sistema de temas (palette overridable por proyecto).
- Editor visual de tema en el dashboard.

### FASE 5 · Polish y portfolio · 1-2 sesiones

- README rico con capturas, GIFs, badges.
- Caso de estudio en el portfolio personal de Paco.
- Vídeo demo (Loom o similar) de 2-3 min.
- Posible deploy de un proyecto-demo «restaurante» como segundo ejemplo.

**Total estimado: 10-13 sesiones.** Cada sesión nueva debe arrancar leyendo este documento y tocar UNA fase como mucho.

---

## 9 · Roadmap completo

| Versión | Contenido | Estado |
|---|---|---|
| v3.7 | Bloque C · 3-de-3 interactivo | ✅ Mergeado |
| v3.8 | Test E2E + fix onchange | ✅ Mergeado |
| **v4.0** | **ADR plataforma (este documento)** | 🟡 En curso |
| v4.1 | Fase 1 · Externalizar JSON Miramar | 🔜 |
| v4.2 | Fase 2 · Multi-tenant routing | 🔜 |
| v4.3 | Fase 3 · Dashboard MVP (login + lista + editor menús) | 🔜 |
| v4.4 | Fase 3 · Wizard crear proyecto | 🔜 |
| v4.5 | Fase 3 · Editor de las demás secciones | 🔜 |
| v4.6 | Fase 4 · Métricas Miramar (5 pestañas) | 🔜 |
| v4.7 | Fase 4 · Sistema de temas personalizables | 🔜 |
| v4.8 | Fase 5 · Polish + segundo proyecto demo | 🔜 |
| v5.0 | (Opcional) Migración a backend real / Supabase | Por evaluar |

---

## 10 · Decisiones pendientes / preguntas abiertas

1. **Flujo de guardado de presupuestos para métricas** — ¿cliente del hotel hace «submit» que llega al dashboard via email/Resend/EmailJS? ¿O el director copia/pega el JSON del cliente al dashboard manualmente?
2. **PAT seguro en localStorage** — investigar si conviene cifrarlo con la password del admin o si es suficiente con `sessionStorage` (que se borra al cerrar pestaña).
3. **Editor visual de recetas** — ¿incluye AI-fotos automático al crear receta (vía Pollinations) o queda manual?
4. **Internacionalización (i18n)** — ¿soportamos proyectos en otros idiomas (inglés, francés) desde el inicio? Decisión: **no, fase 5+**.
5. **Versioning de JSON Schemas** — cuando evolucione el schema de menús, ¿migración automática de proyectos antiguos? Decisión: **mantener semver en cada schema + migrations.js que detecte versión y migre**.
6. **Política de fotos** — ¿quién paga el storage si pasamos de Git LFS? Por ahora todas las fotos caben directas en el repo.

---

## 11 · Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Refactor Fase 1 rompe alguna funcionalidad del piloto | Alta | Alto | Tag `v3.8-pre-platform`. Tests E2E con Chrome DevTools MCP tras cada paso. PR por sección, no big-bang. |
| Cliente malicioso extrae hash + brute-force | Baja | Medio | Aceptado. Si pasa, se evalúa backend. Documentado en D7. |
| Rate limit del GitHub API (5 000 req/h por user) | Baja | Bajo | El dashboard cachea respuestas. Un editor activo hace ~50 commits/sesión. |
| Tamaño del repo crece sin control con fotos | Media | Medio | Hooks pre-commit que avisen si una foto supera 1 MB. Migración a Git LFS si llegamos a 1 GB. |
| Cambio de visión a mitad → re-refactor | Media | Alto | Cada fase se cierra con merge a main + tag. Volver atrás siempre posible. |

---

## 12 · Métricas de éxito del proyecto

- **Técnicas**: el motor `/core/` no tiene ningún string que sea datos del Miramar concreto. Test de regresión: `?proyecto=demo` (proyecto vacío) renderiza placeholders, no datos del Miramar.
- **De producto**: crear un proyecto nuevo desde cero (wizard) → tener una app pública funcional en < 30 min de trabajo del director, sin tocar código.
- **De portfolio**: 1 vídeo demo + 1 caso de estudio en el portfolio personal + 2 proyectos públicos diferenciados visibles online.

---

## 13 · Anexos · ADRs individuales

Cada decisión grande tiene su propio archivo en `docs/adr/`:

- `001-multi-tenant-deploy.md`
- `002-editor-visual.md`
- `003-auth-multi-user-static.md`
- `004-stack-vanilla.md`
- `005-github-api-commits.md`
- `006-refactor-antes-de-dashboard.md`
- `007-soft-auth-trade-off.md`

(Se crean en la Fase 0 con plantilla MADR — Markdown ADR).

---

## 14 · Próximo paso al abrir sesión nueva

Cuando arranques sesión nueva para implementar:

> **Prompt sugerido:**
> «Hola. Lee `docs/arquitectura-plataforma.md` completo y luego empieza la **Fase 1** del plan de migración: externalizar los datos del Miramar a JSON. No toques nada más. Cuando termines la Fase 1, abre un PR y para — no continúes con la Fase 2 sin mi luz verde.»

Esto le da a la sesión nueva un anclaje fuerte (este documento) y un alcance acotado (una sola fase), evitando que se desvíe.
