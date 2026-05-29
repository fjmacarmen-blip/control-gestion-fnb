# Case Study · Plataforma multi-tenant de gestión F&B

> Cómo un director hotelero con 30 años de oficio y cero formación en programación construyó una plataforma SaaS multi-tenant en 14 iteraciones, usando solo lo que sabía sobre el problema y un asistente de IA como copiloto.

---

## Contexto

Llevo treinta años dirigiendo hoteles. En el último, en Algeciras, gestionaba bodas, eventos corporativos, banquetes de comunión, comidas de empresa, presentaciones de producto. Cada presupuesto se hacía sobre la base de un Excel que un compañero había construido en 2011 y que se había ido parcheando año a año. Las cartas estaban en Word. Las recetas estaban en una libreta del jefe de cocina. Los precios de economato había que pedirlos por WhatsApp al proveedor.

Cuando dejé el hotel y me planteé qué hacer en la siguiente etapa, tenía claro una cosa: el problema de gestión que vi durante tres décadas en hoteles de todos los tamaños no estaba resuelto en el software comercial que existía. Los grandes ERPs (Opera, SAP) son caros, lentos y están hechos para cadenas. Los SaaS de eventos son módulos sueltos que no hablan con economato ni con cocina. Y los hoteles independientes siguen tirando de Excel.

Decidí construir la herramienta que me habría gustado tener.

---

## Restricciones del proyecto

Antes de escribir una línea, me marqué cuatro límites duros:

1. **Cero coste de infraestructura.** Si esto va a vivir como portfolio público, no puedo permitirme un servidor mensual. Tiene que correr en hosting gratis y escalar a cero cuando no hay tráfico.
2. **Sin frameworks pesados.** No quería atarme a React/Vue/Angular sin saber por qué los necesitaba. Vanilla JS hasta que demuestre lo contrario.
3. **Todo client-side.** Los datos del cliente no salen del navegador del cliente. Punto.
4. **Versionado completo y restaurable.** Si alguien rompe algo, tiene que poder recuperarse desde git con un `git revert`. Nada de bases de datos opacas.

---

## Decisiones clave

### Multi-tenancy via routing

Cada hotel/restaurante es una carpeta en `projects/<id>/` con sus 10 archivos JSON (establecimiento, menús, recetas, eventos, dietas, productos, bebidas, extras, auth, config). El loader del dashboard recibe `?proyecto=<id>` y carga esa carpeta. Una whitelist regex (`^[a-z0-9_-]+$`) bloquea cualquier intento de path traversal.

Ventaja: para añadir un cliente, basta con crear una carpeta y un commit. No hay base de datos que migrar, no hay tablas multi-tenant, no hay aislamiento que mantener a nivel de aplicación. El propio sistema de archivos es el aislamiento.

### Persistencia en JSON + escritura vía GitHub API

El editor escribe en `localStorage` mientras trabajas (con detección de cuota a 4 MB de aviso y 5 MB de límite). Cuando le das a publicar, se construye un commit en la GitHub API: blob → tree → commit → patch ref, atómico para todos los archivos cambiados.

Para que esto funcione, el usuario aporta un Personal Access Token con scope `repo`. Se guarda solo en `sessionStorage`, nunca se loguea, nunca se commitea. Si cierras la pestaña, desaparece.

Esta decisión está documentada en [ADR 011](adr/011-pat-sessionstorage.md), incluyendo el modelo de amenaza completo (qué pasa si el navegador está comprometido, qué pasa si alguien hace pull del repo desde otro equipo, etc.).

### Re-verify en acciones destructivas

Una sesión "fresca" dura 5 minutos. Pasado ese tiempo, cualquier acción destructiva (borrar proyecto, sobrescribir sección, eliminar receta) vuelve a pedir contraseña con un modal `promptPasswordAndExecute`. Esto cubre el caso de "dejé el portátil abierto en una cafetería".

### Importadores que conviven con la realidad

Los hoteles independientes no tienen sus datos limpios. Tienen un Excel con la oferta de bodas del 2011 (literal, ese fichero está en este repo), un PDF con la carta vigente y un montón de fotos en una carpeta de Drive sin nombres consistentes.

Los importadores tienen que aceptar ese caos:

- **Excel/CSV** · SheetJS + PapaParse. Función `autoMapColumns` con normalización Unicode y diccionario de sinónimos en español (`Plato | Nombre | Producto | Receta` → mismo campo).
- **PDF** · pdf.js bundle legacy lazy-loaded. Agrupación de texto por posición Y para reconstruir filas. Regex heurístico para detectar `Nombre … 12,50 €`.
- **Imágenes** · `browser-image-compression` con conversión a WebP. La función `autoMatchByFilename` tokeniza preservando separadores, descarta stopwords del español (`de`, `la`, `el`, `con`, `y`...) y asigna scores a tres niveles (exact match, contains, token overlap). Para los platos que se queda sin foto, fallback a Pollinations.ai (generación gratis, sin API key).

Esta última función tuvo un bug interesante: la versión original normalizaba el filename antes de tokenizar, lo que destruía los separadores y rompía el matching. Detectado con un test en Node, fixed preservando dashes/underscores hasta el split. Ahora pasa 8/8 casos.

### Conectores tipados por origen

El problema más importante que no había visto venir: en producción, el catálogo de productos no es un JSON estático. Es un Google Sheet que actualiza la jefa de compras, o un export diario del economato, o un endpoint REST del distribuidor (Makro tiene API, Mercabarna no, los proveedores locales viven en WhatsApp).

Solución: el archivo `productos.json` ahora tiene una sección `source` que describe **de dónde viene** el catálogo:

| Nivel | `source.type` | Caso de uso |
| --- | --- | --- |
| 0 | `static` | Demo / prototipo. Items embebidos en el JSON. |
| 1 | `csv-url` | URL pública de un Google Sheet exportado como CSV. |
| 2 | `json-url` | Endpoint que devuelve JSON con array de items. |
| 3 | `api` | REST con auth (token, basic, OAuth client_credentials). |

El `items` siempre existe como cache local (lectura instantánea), y `syncProductos()` refresca según `refreshHours`. Documentado en [ADR 012](adr/012-productos-conectores.md).

### Temas por proyecto

Cinco paletas (`moderno`, `cercano`, `tipico`, `mediterraneo`, `clasico`), implementadas con variables CSS y selectores `[data-theme="<id>"]`. La prioridad de aplicación es: query `?tema=` > preview en `sessionStorage` > `config.json` del proyecto > default.

El wizard de alta permite elegir tema y previsualizar antes de confirmar. Cada cliente queda diferenciado visualmente desde el primer día.

---

## Estado actual

| Métrica | Valor |
| --- | --- |
| Versiones liberadas | 14 (v4.1 → v4.14) |
| Pull requests | 15 |
| ADRs | 2 (PAT en sessionStorage, conectores de productos) |
| Proyectos demo | 3 (Miramar piloto, Casa Lola, Demo regresión) |
| Líneas de JS en `core/` | ~4 800 |
| Líneas de JS en `dashboard/` | ~3 100 |
| Dependencias npm | 0 en runtime · todo CDN |
| Coste mensual de operación | 0 € |

### Capacidades cubiertas

- Login con bcrypt + sesión 8h
- Listado de proyectos con badges y métricas resumidas
- Editor de 6 secciones (establecimiento, menús, recetas, productos, tema, eventos)
- Wizard de creación en 4 pasos
- Publicación atómica vía GitHub API
- Re-verify en destructivas
- Importadores Excel/PDF/imágenes con auto-match
- Conectores externos de productos (4 niveles)
- Métricas con Chart.js (2 vistas: presupuestos + agenda)
- Multi-tema (5 paletas)
- Drafts en localStorage con detección de cuota

---

## Qué aprendí

**Que el conocimiento del dominio es la mitad del trabajo.** La diferencia entre un software de eventos genérico y uno útil está en detalles que solo conoces si has llevado el oficio: que las dietas especiales se gestionan con pulseras de colores en sala, que el escandallo de un plato no es solo coste de materia prima sino también de mermas, que el cliente firma el presupuesto con una señal del 15% normalmente. Eso lo lleva uno encima, no lo aprende un equipo de producto en seis meses de descubrimiento.

**Que la IA como copiloto cambia las reglas para los no-developers.** Hace cinco años, esta plataforma habría requerido un equipo. Hoy la he construido yo con Claude Code asistiendo. Yo decido qué hay que hacer y por qué (las decisiones que hay en cada ADR son mías, no del modelo); el modelo me ayuda a expresar esas decisiones en código que funciona. La parte difícil del software ya no es escribir las líneas: es saber qué problema merece la pena resolver.

**Que las restricciones duras simplifican.** "Cero coste de infraestructura" eliminó del mapa la mitad de las arquitecturas posibles antes de empezar. "Todo client-side" eliminó otra cuarta parte. Quedó un espacio muy estrecho de soluciones viables y, dentro de ese espacio, las decisiones se vuelven casi obvias.

**Que el versionado completo es un superpoder.** Cada cambio en cada proyecto vive en un commit. Si un cliente borra una receta sin querer, `git revert` lo recupera. Si quiero ver cómo se publicaba la carta de Navidad de 2026, está ahí. Esto no es un feature; es la consecuencia natural de haber elegido git como base de datos.

---

## Qué viene

- **v5.0** · app móvil offline-first para el equipo de sala (consultar dieta especial de la mesa 8 sin tener que abrir el editor)
- **v5.1** · integración con TPVs hosteleros (Glop, TICKBASE, Pingüino)
- **v5.2** · marketplace de plantillas por categoría de establecimiento (cafetería, asador, marisquería, hotel rural...)

---

## Contacto

Francisco Javier Martínez Alba · Algeciras
fjmacarmen@gmail.com · [LinkedIn](https://www.linkedin.com/in/franciscojaviermartinezalba)

Si llevas un grupo hotelero o estás construyendo producto en el sector y este case study te ha resultado útil, escríbeme.
