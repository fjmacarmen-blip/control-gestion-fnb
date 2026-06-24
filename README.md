# Queens Bellybutton · Plataforma multi-tenant

[![GitHub Pages](https://img.shields.io/badge/demo-online-success?logo=github)](https://fjmacarmen-blip.github.io/control-gestion-fnb/)
[![Stack](https://img.shields.io/badge/stack-vanilla%20JS-yellow?logo=javascript)](#stack)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Status](https://img.shields.io/badge/status-v6.0-gold)](#roadmap)
[![Tests](https://github.com/fjmacarmen-blip/control-gestion-fnb/actions/workflows/tests.yml/badge.svg)](https://github.com/fjmacarmen-blip/control-gestion-fnb/actions/workflows/tests.yml)

> Plataforma SaaS de gestión de eventos y banquetes para hoteles y restaurantes, construida sin frameworks, desplegada en GitHub Pages.
> Arquitectura multi-tenant, importadores Excel/PDF/imágenes, conectores a economatos externos y métricas en tiempo real.

**[→ Ver demo en vivo](https://fjmacarmen-blip.github.io/control-gestion-fnb/)** &nbsp;·&nbsp; **[→ Case study completo](docs/CASE-STUDY.md)**

---

## El problema

En la mayoría de hoteles independientes y grupos pequeños, la gestión de eventos vive repartida en varias herramientas que no se hablan entre sí: plantillas heredadas, documentos con menús desactualizados y carpetas de PDFs que nadie sincroniza. Cada presupuesto se construye copiando otro anterior, los precios de economato se traen a mano y el escandallo real de cada plato es casi siempre una estimación.

Tras 30 años dirigiendo hoteles, decidí construir la herramienta que siempre eché de menos: una plataforma capaz de gestionar **múltiples establecimientos** con datos reales, importar lo que ya tienen los hoteles (Excel, PDF, fotos de carta) y conectarse al economato del cliente cuando ese economato exista.

## Qué es

Una aplicación web estática que gestiona:

- **Múltiples proyectos (multi-tenant)** · cada establecimiento es una carpeta independiente con su tema visual, menús, recetas, espacios y presupuestos.
- **Editor visual** · CRUD completo de menús, recetas y configuración con autoguardado en `localStorage` y publicación atómica vía GitHub API.
- **Wizard de alta** · 4 pasos para crear un proyecto nuevo desde cero, con marketplace de **plantillas** (cafetería, marisquería, hotel rural) que generan estructura inicial coherente.
- **Importadores** · Excel/CSV (SheetJS), PDF (pdf.js), imágenes con compresión + fallback de IA (Pollinations).
- **Conectores de productos** · 4 niveles: catálogo estático, CSV remoto, JSON remoto, REST API. Pensado para conectarse al economato real del cliente.
- **Conectores TPV** · ADR 013 · simulator + csv-poll listos, stubs nombrados para Glop/TICKBASE/Pingüino. Emite eventos normalizados (`ticket_abierto`, `comanda_enviada`, `ticket_cerrado`, `mesa_liberada`).
- **Calculadora de escandallos** · cruza recetas con catálogo de productos, calcula coste materia prima por ración, % escandallo real y PVP recomendado por categoría.
- **Métricas** · facturación mensual, ocupación de espacios, top eventos, próximos eventos (Chart.js).
- **Multi-tema** · 5 paletas seleccionables por proyecto (moderno, cercano, típico, mediterráneo, clásico) + toggle global claro/oscuro.
- **Vista de sala responsive** · panel integrado en el dashboard para el equipo de sala: eventos del día, dietas críticas con pulseras, ocupación de espacios. Acceso desde cualquier navegador, sin instalación.
- **Carta digital pública + QR** · cada proyecto genera su URL pública sin login y su QR descargable en SVG.
- **QR dos usos** (v6.0) · hoja imprimible con dos modos: QR de carta digital y QR de evento con hash SHA-256. Generado también desde el cotizador.
- **Diseñador de sala interactivo** (v6.0) · plano SVG drag-drop con 6 planos predefinidos, 5 tipos de elemento, estados de asiento (libre/dieta/infantil/bebé), panel de plazas y compartir.
- **Factura de servicios** (v6.0) · factura A4 generada desde el cotizador interno, con IVA 10%, vencimiento a 30 días y compartir por email.
- **Modelo de 3 roles formal** (v6.0) · super-admin / administrador (proyecto acotado) / cliente final (sin login). Panel de director con vista responsiva de sala integrada.

## Demos online

| Demo | URL | Descripción |
| --- | --- | --- |
| **Dashboard · Miramar** | [/dashboard/](https://fjmacarmen-blip.github.io/control-gestion-fnb/dashboard/) | Login + listado · piloto Miramar Algeciras |
| **Dashboard · Casa Lola** | [/dashboard/?proyecto=restaurante-casa-lola](https://fjmacarmen-blip.github.io/control-gestion-fnb/dashboard/?proyecto=restaurante-casa-lola) | Tema mediterráneo · 12 presupuestos seed |
| **Vista de sala · Miramar** | [/dashboard/sala.html?proyecto=miramar](https://fjmacarmen-blip.github.io/control-gestion-fnb/dashboard/sala.html?proyecto=miramar) | Operativa del equipo · responsive · integrada en panel |
| **Diseñador de sala** | [/core/pages/disenador-sala.html?proyecto=miramar](https://fjmacarmen-blip.github.io/control-gestion-fnb/core/pages/disenador-sala.html?proyecto=miramar) | Plano SVG drag-drop · v6.0 |
| **Carta pública · Miramar** | [/carta-publica.html?proyecto=miramar](https://fjmacarmen-blip.github.io/control-gestion-fnb/carta-publica.html?proyecto=miramar) | Destino del QR · sin login |
| **Carta pública · Casa Lola** | [/carta-publica.html?proyecto=restaurante-casa-lola](https://fjmacarmen-blip.github.io/control-gestion-fnb/carta-publica.html?proyecto=restaurante-casa-lola) | Carta mediterránea |

## Stack

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| Frontend | Vanilla JS · HTML5 · CSS3 | Cero dependencias de build, despliegue en segundos, fácil de auditar |
| Hosting | GitHub Pages | Coste cero, CDN global, integración natural con el flujo de datos |
| Persistencia | JSON en repo + `localStorage` | Versionado completo, sin base de datos, restaurable desde git |
| Auth | bcryptjs (CDN UMD) + soft auth client-side | Hash en `auth.json`, sesión 8h en `sessionStorage` |
| Escritura remota | GitHub REST API (PAT en `sessionStorage`) | Sin backend, commits firmados por el usuario |
| Importadores | SheetJS · PapaParse · pdf.js · browser-image-compression | Todo client-side, ningún archivo sale del navegador |
| Gráficas | Chart.js | Dual-axis, lazy load |
| Visualización IA | Pollinations.ai | Generación de fotos de plato gratis, sin API key |
| QR + hash evento | qr-gen.js · crypto.subtle SHA-256 | QR SVG generado browser-side · hash de evento sin backend |
| Compartir docs | share.js (window.fnbShare) | Imprimir · email · WhatsApp · copiar URL en todos los documentos |

## Arquitectura

```
/
├── core/                  # Código compartido entre todos los proyectos
│   ├── js/                #   loader · auth · github-api · editor-core · theme · metrics · importers
│   │                      #   share.js · qr-gen.js · version-badge.js
│   ├── css/               #   sistema de temas (data-theme="<id>") · theme-superadmin.css
│   └── pages/             #   presupuesto-evento · recetario · factura-servicio · qr-print
│                          #   disenador-sala · contrato · orden-servicio
├── dashboard/             # Login · listado · editor · wizard · métricas · sala (v6.0)
│   ├── superadmin.html    #   panel super-admin (paleta verde+negro)
│   └── sala.html          #   vista de sala responsive integrada (sustituyó sala-movil.html)
├── projects/              # 1 carpeta por establecimiento
│   ├── miramar/           #   10 JSON (establecimiento, menús, recetas, ...) + budgets/
│   ├── restaurante-casa-lola/
│   └── index.json         # Manifest de proyectos visibles
├── docs/
│   ├── adr/               # Architecture Decision Records
│   ├── arquitectura-plataforma.md
│   └── CASE-STUDY.md
└── index.html             # Landing público
```

El switch entre proyectos es `?proyecto=<id>` con whitelist regex `^[a-z0-9_-]+$` contra path traversal y carga paralela de las secciones JSON.

## Quick start

```bash
git clone https://github.com/fjmacarmen-blip/control-gestion-fnb.git
cd control-gestion-fnb
python -m http.server 8000        # o cualquier servidor estático
# http://localhost:8000
```

Para escribir en el repo desde el editor necesitas un Personal Access Token de GitHub con scope `repo`. Se guarda solo en `sessionStorage`; nunca toca el repo.

## Decisiones de arquitectura

Las decisiones de diseño no triviales están documentadas como ADR (Architecture Decision Record):

- [ADR 011 · PAT en sessionStorage + modelo de amenaza](docs/adr/011-pat-sessionstorage.md)
- [ADR 012 · Conectores de productos · 4 niveles de integración](docs/adr/012-productos-conectores.md)
- [ADR 013 · Conectores TPV de sala · simulator/csv-poll/api](docs/adr/013-tpv-connectors.md)

La auditoría de ingeniería v4.14 con su plan de remediación está en [docs/AUDITORIA-v4.14.md](docs/AUDITORIA-v4.14.md). La visión completa está en [docs/arquitectura-plataforma.md](docs/arquitectura-plataforma.md).

## Roadmap

- [x] **v4.1–v4.3** · Externalización a JSON · multi-tenant routing · auditoría
- [x] **v4.4–v4.5** · Editor visual · wizard · 5 temas
- [x] **v4.6–v4.8** · GitHub API · publicación atómica · re-verify en destructivas
- [x] **v4.9** · Métricas · 18 presupuestos seed
- [x] **v4.10–v4.13** · Importadores Excel/PDF/imágenes · conectores externos
- [x] **v4.14** · Segunda demo (Casa Lola) · README · case study
- [x] **v4.15** · Cierre auditoría (SRI · CSP · CI · 59 tests)
- [x] **v5.0** · PWA sala móvil · conectores TPV · escandallos · carta pública + QR · 3 plantillas · light mode
- [x] **v5.1–v5.17** · Catálogo recetas Makro (153) · menús especiales (8) · panel superadmin · versioning visible · checklist · vídeo promo
- [x] **v6.0** · Modelo 3 roles · sala integrada en dashboard · diseñador de sala · factura de servicios · QR dos usos · share universal
- [ ] **v6.1** · Integración real Glop (cliente piloto)
- [ ] **v6.2** · Backend mínimo para webhook TPV tiempo real

## Quién lo construyó

**Francisco Javier Martínez Alba** · 30 años en dirección hotelera · Algeciras.
Este proyecto es el resultado de querer entender de primera mano qué se puede construir hoy con las herramientas disponibles, traduciendo a código operaciones que llevo décadas haciendo a mano. Más detalle en el [case study](docs/CASE-STUDY.md).

[LinkedIn](https://www.linkedin.com/in/franciscojaviermartinezalba) · [Email](mailto:fjmacarmen@gmail.com)

## Licencia

MIT.
