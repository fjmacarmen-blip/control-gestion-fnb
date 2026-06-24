# Queens Bellybutton · Arquitectura multi-tenant

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
| D8 | **Bulk import obligatorio (Excel/CSV + fotos drag&drop + PDF)** | Un hostelero entrega su carta en Excel/PDF con 100-200 platos. Sin importers el producto es inviable comercialmente. Manual formulario por formulario solo para datos básicos. |
| D9 | **Storage de imágenes: repo + compresión agresiva client-side** | Antes de subir, el navegador reduce cada foto a ≤1600px / ≤200KB WebP. 100 fotos ≈ 20MB. Aguanta varios proyectos sin tocar Git LFS. Cero dependencia externa. |
| D10 | **Librería "nuclear" de starters pre-cargados** | El wizard ofrece catálogos completos importables: cocina andaluza, mediterránea, clásicos de boda, brunch internacional. Cada starter = 15-30 platos con escandallo y fotos. Reduce el onboarding de "días de trabajo" a "horas". |

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
│   ├── schemas/                # JSON Schemas para validación
│   │   ├── establecimiento.schema.json
│   │   ├── menus.schema.json
│   │   └── recetas.schema.json
│   ├── importers/              # Parsers de datos externos
│   │   ├── excel-importer.js   # Lee XLSX vía SheetJS
│   │   ├── csv-importer.js     # Lee CSV vía PapaParse
│   │   ├── pdf-importer.js     # Lee PDF vía PDF.js (extracción texto + tablas)
│   │   ├── image-bulk.js       # Drag&drop + compresión + auto-matching
│   │   └── mapper.js           # UI para mapear columnas-a-campos
│   └── starters/               # Catálogos pre-cargados ("librería nuclear")
│       ├── platos-andaluces.json
│       ├── platos-mediterraneos.json
│       ├── menus-boda-clasica.json
│       ├── brunch-internacional.json
│       ├── productos-mercado-base.json
│       └── bebidas-distribuidor-makro.json
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
| **Importer Excel/CSV** | `SheetJS / xlsx` + `PapaParse` (CDN) | Lee XLSX/XLS/ODS y CSV. Detección automática de delimitador. |
| **Importer PDF** | `PDF.js` (Mozilla, CDN) | Extracción de texto + posiciones. OCR (`Tesseract.js`) opcional fase 2. |
| **Compresión imagen** | `browser-image-compression` (CDN) | Wrapper canvas API. Redimensiona + convierte a WebP client-side. |
| **Validación de import** | `Ajv` (CDN) | Valida cada fila contra JSON Schema. Errores precisos por campo. |
| Tests | Playwright (ya instalado) + scripts manuales con Chrome DevTools MCP | Continuamos lo que ya hacemos. |
| Generación de imágenes IA | FLUX vía Pollinations.ai (ya integrado) | Sin API key, gratis. Se invoca desde el bulk-image-upload cuando faltan fotos. |

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

### 7.6 · Onboarding y bulk upload de datos

> **Bloque crítico.** Un cliente real entrega su carta en Excel/PDF con 100-200 platos. Sin importers, el producto es inviable. Esta sección define cómo se cargan datos masivamente.

#### 7.6.1 · Importer de Excel/CSV

**Casos de uso típicos:**
- Carta de platos (nombre, descripción, alérgenos, precio venta)
- Recetas con escandallo (plato + lista ingredientes + cantidades)
- Catálogo de productos (materia prima + €/kg + proveedor)
- Carta de bebidas/vinos (distribuidor entrega lista en Excel)

**Flujo del editor:**
1. Botón «📥 Importar Excel/CSV» en cada sección del editor (Menús, Recetario, Productos…).
2. Drag&drop del fichero → preview de la primera hoja con primeras 10 filas.
3. **Pantalla de mapeo columnas-a-campos** (clave): el sistema sugiere mapeos automáticos por nombre de header (`"Nombre" → name`, `"Precio" → price`, `"Alérgenos" → allergens`); el usuario confirma o corrige cada uno.
4. **Validación**: se valida cada fila contra el JSON Schema correspondiente. Las filas con errores se marcan en rojo con motivo.
5. Pantalla de resumen: «142 platos válidos · 8 con errores · 3 duplicados». Botones «Importar válidos» / «Editar errores» / «Cancelar».
6. Al importar → commit único con mensaje descriptivo («Importa 142 platos desde menu_2026.xlsx»).

**Librerías:**
- `SheetJS / xlsx` (CDN) — lee XLSX, XLS, ODS.
- `PapaParse` (CDN) — lee CSV con detección de delimitador.
- `Ajv` (CDN) — valida cada fila contra JSON Schema.

#### 7.6.2 · Importer de PDF

**Casos de uso:** carta del establecimiento en PDF (no editable), tarifa de proveedor.

**Estrategia 2-niveles:**
- **Nivel A (MVP)**: PDF.js extrae texto y tablas. Renderiza el contenido en una vista 2-columnas: izquierda el texto crudo, derecha el editor de platos. El usuario hace **copy-paste asistido** desde el PDF a los formularios.
- **Nivel B (fase posterior)**: OCR para PDFs escaneados (Tesseract.js). Detección automática de columnas de tabla con `pdfplumber`-equivalente en JS. Se evalúa cuando sea necesario.

#### 7.6.3 · Bulk upload de imágenes con compresión client-side

**Flujo:**
1. Botón «🖼 Subir fotos» en Recetario / Espacios / Eventos.
2. Drag&drop de **carpeta entera** o multi-selección.
3. Para cada imagen, en el navegador (canvas API):
   - Redimensiona a max 1600px en lado largo.
   - Convierte a WebP con calidad 80.
   - Genera thumbnail 400px para previews.
   - Si la original era >5MB, además genera una versión 800px para fallback.
4. **Auto-matching por nombre de archivo**: si el archivo se llama `gazpacho-andaluz.jpg` y existe un plato «Gazpacho Andaluz», se sugiere el match. El usuario confirma o arrastra manualmente.
5. **Generación IA fallback**: para platos sin foto tras el match, botón «Generar con IA» que dispara Pollinations.ai con prompt construido del nombre + alérgenos (sistema ya integrado en `scripts/generar_fotos_platos.py`, lo portamos a JS browser).
6. Commit único con todas las imágenes («Sube 47 fotos al recetario»).

**Librería:** `browser-image-compression` (CDN) — wrapper sobre canvas API con buenos defaults.

**Límites duros:**
- Foto comprimida final: ≤250KB. Si el usuario sube una de 8MB, el compresor la baja a ~200KB sin pedir permiso.
- Nº de fotos por commit: ≤100 (si suben más, se trocea en commits de 100).

#### 7.6.4 · Librería de starters

**Concepto:** catálogos completos que el director puede importar de golpe al crear un proyecto. Reducen el onboarding de días a horas.

**Starters previstos (commit inicial de la Fase 3):**

| Starter | Contenido | Origen |
|---|---|---|
| 🌅 Cocina andaluza tradicional | 25 platos (gazpacho, salmorejo, pescaíto frito, rabo de toro, churros, torrijas…) con escandallo y fotos | Adaptado del recetario actual del Miramar |
| 🌊 Mediterránea costera | 20 platos (arroces, pescados a la sal, fritura, mariscos) | Generado nuevo |
| 💒 Clásicos de boda 5★ | 4 menús completos (Esencial / Selecta / Gourmet / Premium) sentados | Adaptado del Miramar |
| ☕ Brunch internacional | 18 platos (eggs benedict, pancakes, açaí bowl, croissants, pastrami…) | Generado nuevo |
| 🛒 Productos de mercado base | 80 materias primas con precios €/kg actualizados Costa del Sol 2026 | Adaptado del Miramar |
| 🍷 Carta vinos D.O. España | 40 referencias por D.O. y rango de precio | Generado |
| 🥗 Vegano/Vegetariano | 15 platos premium veganos completos | Generado nuevo |

**Mecanismo:**
- Cada starter es un JSON en `/core/starters/<nombre>.json` con la misma estructura que el JSON del proyecto destino.
- En el editor, botón «📚 Importar desde librería» → modal con cards de starters disponibles → preview con primeros 5 ítems → botón «Importar todos» o «Seleccionar cuáles».
- Al importar, los IDs se reasignan para no colisionar con datos existentes del proyecto.
- Las fotos del starter viven en `/core/starters/assets/<nombre>/` (referenciadas por URL relativa). **Se copian al proyecto destino** al importar, para que el cliente pueda editarlas independientemente.

#### 7.6.5 · Wizard "Nuevo proyecto" ampliado (revisa 7.3)

La sección 7.3 listaba 5 pasos. **Se amplían a 7**:

1. Información básica (nombre, slug, ciudad, categoría).
2. **Importar template o starters**: «Copiar Miramar» / «Partir de starters» (multi-select de la librería 7.6.4) / «Vacío».
3. Ficha del establecimiento.
4. **🆕 Bulk import opcional**: «¿Tienes ya tu carta en Excel/PDF?» → upload + mapeo (sección 7.6.1/7.6.2). Saltable.
5. **🆕 Upload masivo de fotos opcional**: drag&drop carpeta (sección 7.6.3). Saltable.
6. Cuenta del responsable del proyecto.
7. Resumen y confirmación → commit inicial.

Después del wizard, el editor abre con un mensaje «✨ Proyecto creado con X platos, Y fotos, Z menús. Empieza a editar.»

#### 7.6.6 · Validación y reporte de errores

Todo import grande termina con un report descargable como `informe-import-<fecha>.csv` con:
- Fila origen del fichero
- Resultado (importado / error / duplicado)
- Motivo del error si aplica

Esto es esencial para que el director pueda corregir el fichero del cliente y reintentar sin perder trazabilidad.

### 7.7 · Requisito derivado: persistir presupuestos

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

**Objetivo:** dashboard funcional con login, lista, editor de menús (la sección más compleja primero) y métricas básicas. **Sin importers todavía** — solo edición a partir de proyecto piloto duplicado.

Pasos:
1. Crear `dashboard/index.html` con login + lista de proyectos.
2. Crear `dashboard/editor.html` con sidebar y al menos 3 secciones: establecimiento, menús, recetario.
3. Integrar `core/js/github-api.js` con Octokit Browser para commits automáticos.
4. Integrar `auth.js` con bcryptjs.
5. Wizard de creación de proyecto (versión simple, sin importers — solo «Copiar Miramar» o «Vacío»).
6. Métricas Miramar 1 (presupuestos) y 3 (agenda) — las otras llegan después.
7. Tests E2E con Chrome DevTools MCP.

### FASE 3.5 · Bulk import y librería de starters · 3 sesiones

**Objetivo:** hacer el producto comercialmente viable para clientes reales con cartas grandes.

Pasos:
1. **Sesión A** · Importer Excel/CSV — `SheetJS` + `PapaParse` + mapper UI columnas-a-campos + validación `Ajv`.
2. **Sesión B** · Importer PDF (nivel A: extracción texto, copy-paste asistido) — `PDF.js`.
3. **Sesión C** · Bulk upload imágenes con compresión client-side + auto-matching por nombre — `browser-image-compression`.
4. Crear los 7 starters iniciales en `/core/starters/` con assets.
5. Ampliar wizard de proyecto nuevo a 7 pasos (sección 7.6.5).
6. Tests E2E: crear un proyecto «restaurante demo» importando un Excel de prueba + 30 fotos de muestra.

### FASE 4 · Métricas completas + tema visual · 2-3 sesiones

- Las 5 pestañas de métricas.
- Sistema de temas (palette overridable por proyecto).
- Editor visual de tema en el dashboard.

### FASE 5 · Polish y portfolio · 1-2 sesiones

- README rico con capturas, GIFs, badges.
- Caso de estudio en el portfolio personal de Paco.
- Vídeo demo (Loom o similar) de 2-3 min.
- Posible deploy de un proyecto-demo «restaurante» como segundo ejemplo.

**Total estimado: 13-16 sesiones** (con la Fase 3.5 incluida). Cada sesión nueva debe arrancar leyendo este documento y tocar UNA fase como mucho.

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
| v4.4 | Fase 3 · Wizard crear proyecto (versión simple) | 🔜 |
| v4.5 | Fase 3 · Editor de las demás secciones | 🔜 |
| **v4.5.5** | **Fase 3.5 · Importer Excel/CSV + mapper** | 🔜 |
| **v4.5.6** | **Fase 3.5 · Importer PDF (nivel A)** | 🔜 |
| **v4.5.7** | **Fase 3.5 · Bulk upload imágenes + compresión + starters** | 🔜 |
| v4.6 | Fase 4 · Métricas Miramar (5 pestañas) | 🔜 |
| v4.7 | Fase 4 · Sistema de temas personalizables | 🔜 |
| v4.8 | Fase 5 · Polish + segundo proyecto demo «restaurante» (con import real) | 🔜 |
| v5.0 | (Opcional) Migración a backend real / Supabase | Por evaluar |

---

## 10 · Decisiones pendientes / preguntas abiertas

1. **Flujo de guardado de presupuestos para métricas** — ¿cliente del hotel hace «submit» que llega al dashboard vía email/Resend/EmailJS? ¿O el director copia/pega el JSON del cliente al dashboard manualmente? **Decidir en Fase 4** cuando se construyan las métricas.
2. **PAT seguro en localStorage** — investigar si conviene cifrarlo con la password del admin o si es suficiente con `sessionStorage` (que se borra al cerrar pestaña). **Decidir en Fase 3** cuando se construya el login.
3. **Editor visual de recetas** — ¿la opción «Generar con IA» de fotos faltantes (sección 7.6.3) se ofrece también dentro del editor de receta individual? Probable: sí, con botón inline. **Decidir en Fase 3.5**.
4. **OCR para PDFs escaneados** — Tesseract.js es pesado (~3MB). Solo se carga bajo demanda. **Decidir en Fase 5** según volumen real de clientes con cartas escaneadas.
5. **Internacionalización (i18n)** — ¿soportamos proyectos en otros idiomas (inglés, francés) desde el inicio? **Decisión: no, fase 5+**.
6. **Versioning de JSON Schemas** — cuando evolucione el schema de menús, ¿migración automática de proyectos antiguos? **Decisión: mantener semver en cada schema + migrations.js que detecte versión y migre**.
7. **Política de fotos a escala** — con compresión client-side (D9) las fotos caben directas en el repo. Si llegan a 1GB se evalúa Git LFS. **Umbral de alerta: 800MB**.
8. **Starters de proveedores reales** — la lista de bebidas-distribuidor-makro.json implica scraping/copia de listas comerciales públicas. **¿Hay implicaciones legales?** Decidir antes de publicar los starters.

---

## 11 · Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Refactor Fase 1 rompe alguna funcionalidad del piloto | Alta | Alto | Tag `v3.8-pre-platform`. Tests E2E con Chrome DevTools MCP tras cada paso. PR por sección, no big-bang. |
| Cliente malicioso extrae hash + brute-force | Baja | Medio | Aceptado. Si pasa, se evalúa backend. Documentado en D7. |
| Rate limit del GitHub API (5 000 req/h por user) | Baja | Bajo | El dashboard cachea respuestas. Un editor activo hace ~50 commits/sesión. |
| Tamaño del repo crece sin control con fotos | Media | Medio | Hooks pre-commit que avisen si una foto supera 1 MB. Migración a Git LFS si llegamos a 1 GB. |
| Cambio de visión a mitad → re-refactor | Media | Alto | Cada fase se cierra con merge a main + tag. Volver atrás siempre posible. |
| Import de Excel cliente con estructura caótica | Alta | Medio | Mapper UI con sugerencias + edición manual. Reporte de errores descargable. Cliente puede iterar el fichero y reimportar. |
| Compresión client-side falla con browsers viejos | Baja | Bajo | `browser-image-compression` soporta Chrome/Firefox/Safari/Edge modernos. Browsers <2020 reciben mensaje «navegador no soportado». |
| Bulk commit de 100 fotos satura GitHub API | Baja | Medio | Trocear en commits de 100. Mostrar barra de progreso. Reintentar con backoff exponencial si rate limit. |

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
- `008-bulk-import-obligatorio.md`
- `009-compresion-cliente-storage-imagenes.md`
- `010-starters-libreria-nuclear.md`

(Se crean en la Fase 0 con plantilla MADR — Markdown ADR).

---

## 14 · Próximo paso al abrir sesión nueva

Cuando arranques sesión nueva para implementar:

> **Prompt sugerido:**
> «Hola. Lee `docs/arquitectura-plataforma.md` completo y luego empieza la **Fase 1** del plan de migración: externalizar los datos del Miramar a JSON. No toques nada más. Cuando termines la Fase 1, abre un PR y para — no continúes con la Fase 2 sin mi luz verde.»

Esto le da a la sesión nueva un anclaje fuerte (este documento) y un alcance acotado (una sola fase), evitando que se desvíe.

**Cuidado especial con la Fase 3.5** (importers): es donde más fácil se «escapa» el alcance. Cada importer (Excel, PDF, imágenes) es UNA sesión separada. No mezclar.

---

## 15 · Addendum v4.14 → v5.1 (estado real tras múltiples sesiones)

Este apartado actualiza el documento original con todo lo ejecutado entre v4.1 y v5.1. La sección 13 hablaba de fases planificadas; ésta cuenta qué quedó construido.

### 15.1 · Capas funcionales construidas

```
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ Landing      │ Dashboard    │ Frontend     │ Vista pública │
│ /index.html  │ /dashboard/  │ público      │ /carta-pub    │
│              │  · index     │  · presup    │ /evento-pub   │
│              │  · editor    │  · recetario │ /disponib-pub │
│              │  · wizard    │  · contrato  │               │
│              │  · sala(v6.0)│  · orden     │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE MOTORES (core/js/)                     │
├─────────────────────────────────────────────────────────────┤
│  loader · auth · github-api · editor-core · theme           │
│  metrics · importer-excel · importer-pdf · importer-images  │
│  productos-connector · tpv-connector · escandallos · qr-gen │
│  appearance                                                  │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE DATOS (estática)                       │
├──────────────────┬─────────────────────┬───────────────────┤
│ projects/<id>/   │ templates/<id>/     │ dashboard/        │
│  · 10 JSON       │  · template.json    │  · auth.json      │
│  · budgets/      │ (cafetería,         │                   │
│                  │  marisquería,       │                   │
│                  │  hotel-rural)       │                   │
└──────────────────┴─────────────────────┴───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE INTEGRACIÓN EXTERNA                    │
├─────────────────────────────────────────────────────────────┤
│ GitHub REST API  · publicación atómica                      │
│ Productos        · static/csv-url/json-url/api (ADR 012)    │
│ TPV              · simulator/csv-poll/glop/tickbase (ADR 013)│
│ Pollinations.ai  · generación de fotos de plato             │
│ Service worker   · offline-first PWA                        │
└─────────────────────────────────────────────────────────────┘
```

### 15.2 · ADRs aceptados

| ADR | Tema | Estado |
| --- | --- | --- |
| 011 | PAT en sessionStorage + modelo de amenaza | Aceptado v4.5.1 |
| 012 | Conectores de productos · 4 niveles | Aceptado v4.11 |
| 013 | Conectores TPV de sala · simulator/csv-poll/api | Aceptado parcial v5.0 |

### 15.3 · Recorrido cronológico real

| Versión | Hito |
| --- | --- |
| v4.1 | Externalización a JSON · multi-tenant routing |
| v4.2 | Reorganización a `/core/pages/` · landing en raíz |
| v4.3 | Dashboard MVP · auth.json · soft auth |
| v4.4 | Editor visual · 3 secciones · wizard básico |
| v4.5 | 5 temas visuales · repaleta dashboard slate+emerald |
| v4.5.1 | Hardening seguridad · rotación credenciales · ADR 011 |
| v4.5.2 | Cache compartida config · quota check · validación tema |
| v4.6 | GitHub API wrapper · publicación atómica |
| v4.7 | Wizard commits multi-archivo |
| v4.8 | Re-verify password en destructivas · fresh-auth |
| v4.9 | Métricas · 2 vistas · 18 presupuestos seed |
| v4.10 | Importer Excel/CSV |
| v4.11 | Conectores externos productos · ADR 012 |
| v4.12 | Importer PDF · pdf.js lazy |
| v4.13 | Importer imágenes · Pollinations · fix autoMatch |
| v4.14 | Portfolio · Casa Lola demo · README · case study |
| v4.15 | Cierre auditoría · SRI · CSP · CI · 59 tests |
| v5.0 | Suite móvil · PWA · TPV · escandallos · QR · plantillas · light mode |
| v5.1 | Integración UI · marketplace plantillas en wizard · TPV en sala · escandallos modal · QR descargable · toggle visible |

### 15.4 · Lo que cambió respecto al plan original

**Decisiones del documento que se mantuvieron tal cual:**
- D1 multi-tenant un solo deploy ✓
- D2 editor visual sin JSON expuesto ✓
- D4 vanilla + JSON en repo ✓
- D5 escritura vía GitHub API con PAT ✓
- D7 modelo de seguridad client-side ✓
- D8 importers obligatorios ✓

**Decisiones que evolucionaron:**
- **D10 starters nucleares** → se materializó como `templates/` marketplace en v5.1, no como simple lista de catálogos cargables.
- **Imágenes** (D9) → añadido fallback Pollinations.ai cuando el usuario no aporta foto, no estaba en el plan original.
- **TPV** → no estaba en el plan original. Aparece en v5.0 a petición explícita y queda con ADR 013.
- **Escandallos** → estaban implícitos pero se construyeron como módulo aparte testable, no integrado solo en recetario.

**Decisiones nuevas que no estaban:**
- **PWA + service worker offline-first** (v5.0). El plan original no contemplaba app móvil instalable.
- **Carta pública con QR descargable** (v5.0). No estaba; surge como subproducto de "carta digital móvil".
- **Light mode global** (v5.0). No estaba; viene a complementar los 5 temas del frontend.
- **CI con tests Node nativos** (v4.15). El plan no contemplaba CI; se añade tras la auditoría.

### 15.5 · Estado de la superficie auditable (v5.1)

- **2 248** LOC JS en `core/js/` (12 módulos)
- **~14 000** LOC HTML (4 dashboards · 4 frontend · 4 público móvil + landings)
- **3** proyectos demo · **3** templates marketplace · **2** ADRs
- **0** dependencias npm en runtime · **8** CDN externos con SRI sha384 (1 ESM documentado sin SRI)
- **59** tests Node nativos · 3 jobs CI verdes
- **0 €** coste mensual de operación

### 15.6 · Documentos vivos

| Documento | Propósito |
| --- | --- |
| `README.md` | Tarjeta de visita pública del repo |
| `docs/CASE-STUDY.md` | Narrativa del proyecto orientada a empleadores |
| `docs/AUDITORIA-v4.14.md` | Informe técnico de la auditoría con plan de remediación |
| `docs/DETALLE-PROYECTO.md` | Inventario funcional + arquitectónico exhaustivo (v5.1) |
| `docs/RESUMEN-EJECUTIVO.md` | Síntesis 1-página para no-técnicos (v5.1) |
| `docs/COMERCIALIZACION.md` | Propuesta go-to-market si decidimos sacar al mercado (v5.1) |
| `flujo-trabajo.html` | Visual del flujo de trabajo end-to-end (v5.1) |
| `test-checklist.html` | Checklist interactivo de QA (v5.1) |
| `docs/adr/011-pat-sessionstorage.md` | ADR 011 |
| `docs/adr/012-productos-conectores.md` | ADR 012 |
| `docs/adr/013-tpv-connectors.md` | ADR 013 |

Este documento (arquitectura-plataforma.md) **deja de actualizarse incrementalmente** a partir de v5.1. Los siguientes cambios se documentan via ADRs nuevos.

### 15.7 · Corrección de modelo de actor en v5.2

Durante el QA inicial de v5.1, Paco detectó un desajuste entre el flujo dibujado en `flujo-trabajo.html` y el código real:

- El flujo decía que el **Director** usaba el cotizador (`presupuesto-evento.html`).
- El código (copy, campos «¿cómo nos has conocido?», nota «te contactaremos en 24h») demuestra que el cotizador es **self-service del cliente final potencial**.
- Además, el botón «Solicitar Presupuesto Formal» sólo mostraba un `alert()` — el presupuesto no llegaba a nadie.

**Cambios v5.2:**

1. **`generateBudget()` reescrito**: prepara un email con el detalle completo del presupuesto, abre `mailto:` apuntando a `establecimiento.contacto.email`, copia al portapapeles como respaldo, ofrece WhatsApp si hay `establecimiento.contacto.telefono`.

2. **Modo interno (`?modo=interno`)**:
   - Banner morado superior con vuelta al dashboard.
   - Muestra la sección «Documentos derivados» (contrato + orden de servicio) que estaba oculta al cliente final.
   - El botón principal cambia a «Guardar borrador interno» (no envía email).
   - Acceso desde el dashboard (lista de proyectos + editor topbar).

3. **`flujo-trabajo.html` corregido**: ahora 6 etapas con actores correctos:
   - 1-2: Paco/Director (alta + config inicial)
   - **3: Cliente final** (self-service del cotizador) ← antes mal asignado
   - **4: Director/comercial** (recibe email + formaliza contrato y orden) ← antes incompleto
   - 5: Cliente final + equipo de sala (día del servicio)
   - 6: Director (mantenimiento)

**Lección de proceso:** el flujo visual debe construirse leyendo el código línea a línea, no inferido. La revisión rápida del usuario me ahorró un fallo de copy que se habría comunicado mal a empleadores y a clientes potenciales del producto.

---

## Addendum v5.12 → v5.14 (junio 2026)

### v5.12 · Decisión de diseño · iconos al lado del nombre
Patrón visual común a todas las cards del producto: el emoji deja de
flotar sobre la imagen y se reubica como **badge dorado pequeño al lado
del nombre**. Clases CSS reutilizables: `.sel-name-icon` (cotizador),
`.card-name-icon` (recetario lista), `.modal-title-icon` (recetario modal).
SW_VERSION → 5.12.0.

### v5.13 · Catálogo de recetas profesional
Tres cambios estructurales en `projects/miramar/recetas.json`:

1. **+36 fichas nuevas** con escandallo a nivel profesional (ingredientes
   con gramaje exacto, precios Makro mayorista 2026, 5-9 pasos de
   elaboración, alérgenos declarados).
2. **Nueva categoría `estaciones`** con 8 estaciones en vivo (sushi,
   carving DOP, wok, pasta, pizza, ostras, ceviche, brunch). Las fichas
   de estaciones incluyen además personal contratado (sushiman, cortador
   profesional, pizzaiolo) y alquiler de equipo (vitrina refrigerada,
   horno de leña móvil, jamonero pro) como parte del escandallo.
3. **Layout sidebar vertical** en `core/pages/recetario.html` con 3
   grupos (Carta · Eventos · Operativa), sticky en desktop y fallback
   horizontal scroll en móvil (<900px).

SW_VERSION → 5.13.0.

### v5.14 · Dashboard superadmin diferenciado

Nueva página `dashboard/superadmin.html`. **Ruptura deliberada de
coherencia visual** con el resto del producto (azul-marfil-oro):
paleta verde+negro inspirada en dashboards admin tipo Vercel/Linear/Spotify.

| Tokens CSS | Valor |
| --- | --- |
| `--bg` | `#060A07` (negro verdoso muy oscuro) |
| `--green-deep` | `#0F4D2E` (verde profundo brand) |
| `--green-bright` | `#00E676` (verde fluorescente accent) |
| `--green-glow` | `#00FF88` (hover state) |
| theme-color | `#0a1612` (vs `#0a1733` navy del director) |

**Auth gate**: la página verifica `window.fnbAuth.getSession()` y solo
muestra el dashboard si `scope === 'super-admin'`. En caso contrario
renderiza un card de "Acceso restringido" con link al login.

**Componentes:**
- 4 KPI cards con sparklines SVG inline
- Chart de volumen mensual SVG con gradient fill (toggles 6M/12M/YTD)
- Tabla de proyectos con health pills + mini-sparkline 7d
- Top 5 paquetes con barras de progreso
- Distribución por tipo de evento
- Activity feed con timestamps relativos

**Agregación de datos:** `aggregateMetrics()` carga `projects/index.json`
y para cada proyecto descarga `budgets/index.json` + N detalles
individuales. Calcula sparklines por mes y agrega top paquetes / tipos
de evento globales.

**Acceso:** botón "🛡️ Panel Superadmin" en `dashboard/index.html` que
aparece solo si la sesión es super-admin, con gradiente verde para
señalizar visualmente que entra en un modo distinto.

SW_VERSION → 5.14.0.

---

## Addendum v6.0 · Modelo de 3 roles (junio 2026)

### v6.0 · Disolución de app móvil y formalización de roles

#### Cambio estructural: sin app móvil separada

La PWA `sala-movil.html` + `sw.js` + `manifest.json` se eliminan. Toda su funcionalidad (vista de sala, dietas críticas, ocupación de espacios) queda integrada en `dashboard/sala.html` con diseño responsive. Motivo: reducir superficie de mantenimiento y eliminar la dualidad conceptual «móvil vs. desktop».

El favicon/branding PWA (`branding/favicon/site.webmanifest`) se mantiene intacto.

#### Modelo de roles formal · v6.0

A partir de esta versión el sistema reconoce tres actores con acceso y capacidades distintos:

| Rol | Scope en sesión | Acceso | Capacidades |
| --- | --- | --- | --- |
| **Super-admin** | `super-admin` | `dashboard/index.html` → login | Gestión de TODOS los proyectos: crear, editar, métricas globales, wizard, panel superadmin (`superadmin.html`) |
| **Administrador** | `admin` + campo `proyecto` | `dashboard/index.html` → login | Solo SU proyecto (`scopedProject(session)`): editar, métricas, sala, cotizador interno |
| **Cliente final** | — (sin login) | URL pública `?proyecto=<id>` | Cotizador self-service (`presupuesto-evento.html`), carta pública, diseñador de sala en modo solo-lectura |

**Implementación:**

- `core/js/auth.js` exporta: `ROLES`, `isSuperAdmin(session)`, `isAdmin(session)`, `scopedProject(session)`, `roleLabel(session)`, `login` (alias de `loginSuperAdmin`).
- `setSession(user, scope, proyecto)` almacena el scope y el proyecto acotado en `sessionStorage`.
- `dashboard/index.html · loadProjectsList(session)` filtra el manifiesto al `scopedProject` cuando la sesión es admin; lista todos cuando es super-admin.
- `dashboard/superadmin.html` rechaza cualquier sesión con `scope !== 'super-admin'` (sin cambios desde v5.14).
- Alta de administradores: el super-admin crea un usuario en `auth.json` con `scope:"admin"` y `proyecto:"<id>"` usando `scripts/change-password.html`.

**Compartir documentación:** toda la documentación generada (plano, menús especiales, contrato, factura, presupuesto, orden de servicio) expone el componente `window.fnbShare` (share.js · v6.0) con opciones imprimir PDF, email, WhatsApp y copiar URL — tanto para uso interno como para el cliente final.

**Decisión de diseño:** el modelo sigue siendo soft-auth client-side (sin backend). El scope es informativo/UX, no un control de acceso criptográfico. Para clientes con requisito de seguridad real → evaluación de Supabase en fase futura.
