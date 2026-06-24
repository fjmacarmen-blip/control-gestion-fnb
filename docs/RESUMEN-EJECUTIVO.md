# Resumen ejecutivo · Queens Bellybutton

> Una página, sin código.
> Para leer en 3 minutos antes de tomar cualquier decisión sobre el proyecto.

## Qué es

Una plataforma online para que hoteles y restaurantes gestionen su negocio de eventos y banquetes en un único centro de mando, sin servidores caros. Cada cliente vive en su propio espacio dentro de la misma aplicación, con su identidad visual, sus menús, sus recetas y sus presupuestos.

## Para quién

Hoteles independientes y pequeñas cadenas de 3 a 15 establecimientos. Restaurantes con servicio de eventos y banquetes. Empresas de catering. Y consultores de hostelería que implantan herramientas a sus clientes y necesitan algo que se pueda llevar puesto.

## El problema que resuelve

| Hoy | Con la plataforma |
| --- | --- |
| Plantilla de presupuestos heredada y fragmentada | Editor visual unificado con datos del establecimiento |
| Cartas desactualizadas en varias versiones | Carta digital pública con QR para las mesas |
| Recetas en libreta del jefe de cocina | Recetario con escandallos y coste real |
| Precios de economato por WhatsApp | Conexión directa al proveedor (CSV/API) |
| Camareros consultando portátil para alérgenos | App móvil con pulseras de dieta en su bolsillo |
| Sin métricas | Facturación · ocupación · top eventos |
| Comprar Opera/SAP por 800 €/mes | **0 €/mes · hospedaje en GitHub** |

## Qué hace ahora mismo

### Para el director del establecimiento
- Editar establecimiento, menús, recetas, productos, tema visual
- Publicar cambios al repositorio con un click
- Ver métricas de presupuestos y agenda
- Generar carta digital pública con QR descargable
- Calcular escandallos: coste real de cada plato + PVP recomendado por categoría

### Para el equipo de sala
- Vista de sala responsive integrada en el panel del director (v6.0 · sustituyó PWA independiente)
- Eventos del día con dietas críticas marcadas por color
- Ocupación de espacios próximos 30 días
- Simulador de eventos TPV para entrenamiento

### Para el cliente final
- Carta digital pública sin login, con alérgenos visibles
- Acceso vía QR en mesa o flyer
- Cotizador de eventos self-service con cotización detallada y envío por email/WhatsApp

### Para Paco (administrador / super-admin)
- Wizard de alta de proyecto en 4 pasos
- Marketplace de plantillas: cafetería · marisquería · hotel rural
- Importadores Excel/CSV, PDF y bulk imágenes con IA
- Conectores de productos (4 niveles) y TPV (4 niveles)
- Modo claro/oscuro · 5 temas visuales por proyecto
- **Panel superadmin** con paleta propia (verde+negro) y métricas agregadas de todos los proyectos
- **Diseñador de sala interactivo (v6.0)** · plano SVG con 6 planos, drag-drop, 5 tipos de elemento
- **Factura de servicios (v6.0)** · factura A4 desde el cotizador interno, IVA 10%, vencimiento 30 días
- **QR dos usos (v6.0)** · hoja imprimible carta + evento con hash SHA-256
- **Compartir universal (v6.0)** · todos los documentos (plano, factura, presupuesto, orden, contrato) con botón imprimir/email/WhatsApp/copiar

## Estado técnico

| Cosa | Estado |
| --- | --- |
| Versión actual | **v6.0** (25 jun 2026 · badge visible en cada página) |
| Proyectos demo en producción | 3 (Miramar, Casa Lola, Demo) |
| Recetas escandalladas (Miramar) | **153** (78 base + 36 v5.13 + 39 v5.16 dietas, todas con precios Makro 2026) |
| Menús de eventos | **34 paquetes** (26 sugeridos + **8 especiales** vegano/vegetariano/sin-gluten/sin-lactosa/sin-frutos/halal/kosher/infantil) |
| Dietas soportadas con menú real | **8** (eran solo conteo antes de v5.16) |
| Categorías del recetario | 7 (entremeses, entrantes, primeros, segundos, postres, cócteles, **estaciones en vivo**) |
| Plantillas marketplace | 3 (cafetería, marisquería, hotel rural) |
| ADRs (decisiones arquitectónicas documentadas) | 3 |
| Tests automatizados | 67 unit + 19 E2E (86 totales) |
| Auditoría de seguridad | Cerrada (SRI · CSP · CI · escapeText) |
| Coste mensual de operación | **0 €** |
| Tiempo desde "cero" hasta "demo lista" para un cliente nuevo | **<30 minutos** |

## El factor diferencial

Cinco cosas la separan de cualquier SaaS de eventos al uso:

1. La diseñó alguien que lleva 30 años dirigiendo hoteles, no un product manager mirando entrevistas.
2. No hay coste de infraestructura. Los clientes no pagan hospedaje.
3. Los datos del cliente nunca salen de su navegador ni de su repositorio.
4. Está versionada en git. Cualquier cambio se revierte con un click, no hay rollback opaco.
5. Los importadores aceptan el caos real del cliente: los ficheros heredados, los PDFs antiguos, las fotos sin nombrar consistente.

## Lo que falta para llevar al mercado

El onboarding aún no es del todo autónomo. Hoy el cliente necesita ayuda para crear su PAT de GitHub; resoluble con un backend mínimo de unos 50 €/mes que gestione tokens.

No hay todavía un cliente piloto pagado. El primero que use Glop o TICKBASE de verdad permitirá implementar los conectores reales — los actuales son stubs documentados.

El plan de precios y el material de marketing no están decididos. Las opciones razonadas están en [`docs/COMERCIALIZACION.md`](COMERCIALIZACION.md).

## Sobre si esto tiene mercado

La hostelería independiente española mueve unos 50 000 millones de euros al año. Alrededor del 70 % sigue gestionando con herramientas fragmentadas (plantillas heredadas, software local de hace una década, libreta de papel). Nicho hay. La pregunta no es esa.

La pregunta real es si Paco quiere convertirse en vendedor de software o prefiere licenciarlo a alguien con red comercial. Ambas opciones están desarrolladas en el plan de comercialización.
