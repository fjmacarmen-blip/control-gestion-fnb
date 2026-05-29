# ADR 013 · Conectores TPV para sala

**Fecha:** 2026-05-29 · **Estado:** Aceptado (parcial) · **Fase:** 5.0

## Contexto

La operación de un hotel o restaurante no termina cuando se cierra el presupuesto del evento. Cuando llega el día del banquete, la coordinación entre sala, cocina y caja se hace **en el TPV**. Para que la plataforma sea útil al equipo de sala — no solo a quien firma el contrato — necesita conectarse al TPV del establecimiento y leer en tiempo real qué mesas están abiertas, qué comandas se han enviado, qué ticket se ha cerrado.

El problema: **no hay un TPV estándar en hostelería española**. Los más extendidos en independientes son:

| TPV | Cuota mercado | API pública | Export CSV programable |
| --- | --- | --- | --- |
| **Glop** | ~30 % en pymes | Sí (REST con OAuth) | Sí |
| **TICKBASE** | ~15 % | No (solo export manual) | Sí |
| **Pingüino** | ~10 % | Limitada | Sí |
| **Otros** (Reviso, Mr Click, …) | Resto largo cola | Variable | Habitualmente sí |

Y la plataforma vive en **GitHub Pages estático** — no podemos abrir un webhook receptor sin backend.

## Decisión

Diseñamos `core/js/tpv-connector.js` como abstracción tipada con **4 niveles de integración**:

| Nivel | `type`        | Cuándo se usa                                      | Latencia |
| ----- | ------------- | -------------------------------------------------- | -------- |
| 0     | `simulator`   | Demos · E2E · onboarding                           | inmediata |
| 1     | `csv-poll`    | TPV exporta CSV a Dropbox/Drive cada N segundos    | minutos  |
| 2     | `glop` (etc.) | TPV con API pública · stub nombrado                | segundos |
| 3     | `webhook`     | TPV postea a backend nuestro                       | tiempo real |

Cada connector emite **eventos normalizados** independientes del origen:
- `ticket_abierto`     { mesa, camarero, total_estimado }
- `comanda_enviada`    { mesa, items[] }
- `ticket_cerrado`     { mesa, total, items, propina }
- `mesa_liberada`      { mesa }

El consumidor (la vista de sala-móvil, el editor, métricas) suscribe los eventos que le interesan vía `connector.on(evt, callback)`. No le importa si vienen de un CSV polling, de la API de Glop o del simulador.

## Decisiones puntuales

### D1 · Por qué empezamos por simulator + csv-poll

Son los dos niveles que funcionan **sin backend**. El `simulator` permite hacer demo del flujo sala-tiempo-real ante un cliente potencial sin tocar nada externo. El `csv-poll` es el patrón real más extendido en pymes hosteleras: la jefa de sala programa que el TPV vuelque un CSV a una carpeta compartida cada 5 min, y la app lo lee.

### D2 · Glop / TICKBASE / Pingüino son stubs nombrados

No es deuda. Es intención. La API pública o el formato de export es propietario de cada TPV — cuando enganchemos al primer cliente real que use uno de ellos, implementamos los detalles dentro del stub, **sin cambiar la firma**. Los consumidores no se enteran.

### D3 · Webhook requiere backend explícito

GitHub Pages no recibe POSTs. Cuando exista la primera necesidad real de webhook en tiempo real, se desplegará un Cloudflare Worker o función serverless mínima como adaptador. No se hace ahora porque añade dependencia operativa (un nuevo punto a mantener) sin demanda confirmada.

### D4 · Eventos normalizados como vocabulario común

El vocabulario es lo más cercano al modelo mental del jefe de sala:
- "mesa 8 abierta" → `ticket_abierto`
- "mandar comanda" → `comanda_enviada`
- "cobrar y cerrar" → `ticket_cerrado`
- "liberar mesa" → `mesa_liberada`

Esta convención sale de la observación directa de cómo hablan en sala. Si el TPV usa otros nombres (`order_open`, `bill_settled`), la traducción es responsabilidad del connector.

## Consecuencias

**Positivas:**
- Cualquier vista de la app puede consumir eventos TPV sin saber qué TPV hay debajo.
- Añadir un cliente con TPV exótico = implementar un nuevo connector (no cambiar la app).
- El simulador permite demos creíbles para venta sin necesidad de cliente real.
- El csv-poll cubre el ~70 % de pymes sin desarrollo adicional.

**Negativas / tradeoffs:**
- Latencia mínima de minutos para csv-poll. Para sala-tiempo-real no es ideal, pero realista.
- Los stubs `glop`/`tickbase`/`pinguino` parecen funcionales hoy pero son simuladores camuflados hasta que toque el primer cliente real.
- Sin backend, no podemos garantizar entrega exactly-once. Idempotencia básica vía `lastSeenRow` en csv-poll.

## Estado de implementación

- ✅ `simulator` con 2 escenarios (comida_normal · evento_grande)
- ✅ `csv-poll` operativo con columnMapping configurable
- 🟡 Stubs nombrados glop/tickbase/pinguino (envuelven simulator)
- ⏳ Implementación real de Glop API · espera primer cliente Glop
- ⏳ `webhook` · espera backend

## Plan de evolución

| Fase | Cuando | Acción |
| --- | --- | --- |
| 5.0 (hoy) | — | Estructura + simulator + csv-poll + stubs nombrados |
| 5.1 | Primer cliente con Glop | Implementar OAuth Glop dentro del stub |
| 6.0 | Primera vez con tiempo-real real | Backend mínimo (Worker) para webhook |

## Referencias

- ADR 012 · Conectores de productos (mismo patrón de niveles)
- `core/js/tpv-connector.js` · implementación
- `sala-movil.html` · primer consumidor (futuro · v5.1)
