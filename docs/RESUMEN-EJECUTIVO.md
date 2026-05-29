# Resumen ejecutivo · Plataforma F&B

> Una página, sin código.
> Para leer en 3 minutos antes de tomar cualquier decisión sobre el proyecto.

## Qué es

Una plataforma online para que **hoteles y restaurantes gestionen su negocio de eventos y banquetes** sin Excel ni servidores caros. Cada cliente tiene su propio espacio dentro de la misma aplicación, con su identidad visual, sus menús, sus recetas y sus presupuestos.

## Para quién

- **Hoteles independientes** y pequeñas cadenas (3-15 establecimientos)
- **Restaurantes con servicio de eventos y banquetes**
- **Catering y empresas de servicios gastronómicos**
- **Consultores de hostelería** que necesitan implantar herramientas en sus clientes

## El problema que resuelve

| Hoy | Con la plataforma |
| --- | --- |
| Excel de presupuestos heredado de hace 10 años | Editor visual con datos del establecimiento |
| Cartas en Word desactualizadas | Carta digital pública con QR para las mesas |
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

**No es otra plataforma de eventos.** Es una plataforma:

1. Diseñada por alguien que **lleva 30 años dirigiendo hoteles**
2. **Sin coste de infraestructura** — los clientes no pagan hospedaje
3. **Sus datos no salen de su navegador** ni de su repositorio
4. **Versionada en git** — cualquier cambio se revierte con un click
5. **Importadores que conviven con el caos real** del cliente (Excel de 2011, PDFs, fotos sin nombrar)

## Lo que falta para llevar al mercado

- **Onboarding asistido**: hoy el cliente necesita ayuda para crear su PAT de GitHub. Sustituible por un backend mínimo de 50 €/mes que gestione tokens.
- **Cliente piloto pagado**: el primer cliente real que use Glop o TICKBASE de verdad permitirá implementar los conectores reales (hoy son stubs).
- **Plan de precios**: nada decidido. Propuesta en `docs/COMERCIALIZACION.md`.
- **Marketing**: nada hecho. Propuesta en `docs/COMERCIALIZACION.md`.

## La pregunta importante

> ¿Existe demanda real para esto?

La respuesta corta: **sí, con matices**. El sector de hostelería independiente española mueve 50 000 millones €/año. El 70 % sigue gestionando con Excel o software local de hace 10 años. El nicho hay. La pregunta es si Paco quiere convertirse en vendedor o quiere licenciarlo a alguien que lo venda. Las dos opciones se exploran en el plan de comercialización.
