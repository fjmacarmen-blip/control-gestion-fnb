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
- App móvil instalable (PWA) que funciona sin conexión
- Eventos del día con dietas críticas marcadas
- Ocupación de espacios próximos 30 días
- Simulador de eventos TPV para entrenamiento

### Para el cliente final
- Carta digital pública sin login, con alérgenos visibles
- Acceso vía QR en mesa o flyer

### Para Paco (administrador)
- Wizard de alta de proyecto en 4 pasos
- Marketplace de plantillas: cafetería · marisquería · hotel rural
- Importadores Excel/CSV, PDF y bulk imágenes con IA
- Conectores de productos (4 niveles) y TPV (4 niveles)
- Modo claro/oscuro · 5 temas visuales por proyecto

## Estado técnico

| Cosa | Estado |
| --- | --- |
| Versión actual | **v5.1** |
| Proyectos demo en producción | 3 (Miramar, Casa Lola, Demo) |
| Plantillas marketplace | 3 (cafetería, marisquería, hotel rural) |
| ADRs (decisiones arquitectónicas documentadas) | 3 |
| Tests automatizados | 59 (Node nativo · 0 dependencias) |
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
