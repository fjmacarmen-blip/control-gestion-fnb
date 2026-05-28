# ADR 012 · Conectores externos para catálogos de productos

- **Estado:** aceptado
- **Fecha:** 2026-05-28
- **Fase:** 3.5.A.5 · conectores de productos
- **Contexto previo:** [arquitectura-plataforma.md](../arquitectura-plataforma.md) §4.1 (productos.json), §7.6.4 (starters)

## Contexto

El recetario calcula escandallos a partir de precios €/kg de los productos. Hasta ahora `productos.json` contenía items estáticos commiteados al repo. Funciona para el piloto Miramar como placeholder (precios Makro), pero un hotel real tiene:

- **Catálogo dinámico**: cada semana cambian precios y disponibilidad.
- **Su propio economato**: o ERP gastronómico (Logic Class, Hosteltáctil, Pikotea, SAP en cadenas), o un Excel/Google Sheet mantenido por el jefe de cocina.
- **Múltiples proveedores**: Makro, Mercabarna, distribuidor local de pescado, etc.

Si el catálogo se queda estático en el repo, el director tiene que editarlo a mano cada vez que cambien precios → fricción enorme → producto no comercialmente viable a medio plazo.

## Decisión

Añadir un nivel de indirección en `productos.json`: un campo **`source`** que define dónde vive el catálogo «vivo» y cómo refrescarlo, manteniendo siempre una copia local (`items`) como cache offline.

```json
{
  "source": {
    "type": "csv-url",
    "label": "Economato Miramar · Sheet semanal",
    "url": "https://docs.google.com/.../export?format=csv",
    "lastSync": "2026-05-28T18:42:00Z",
    "refreshHours": 24,
    "columnMapping": {
      "nombre": "Producto",
      "unidad": "Ud.",
      "precio_kg": "PVP/kg",
      "proveedor": "Proveedor"
    }
  },
  "items": [/* cache local del último sync */]
}
```

`items` siempre legible (incluso sin conectividad). `source` describe cómo refrescarlo.

## Niveles de conector (4 tipos)

### 1 · `static` (defecto · D-1)
- Items embebidos en el JSON del repo. Sin URL.
- Se edita manualmente desde el dashboard o por commit directo.
- **Cuándo usarlo**: starters predefinidos, establecimientos sin economato digital, MVP demo.

### 2 · `csv-url` (recomendado para empezar)
- URL pública que devuelve CSV (incluyendo Google Sheets «publicado a web» → CSV).
- `columnMapping` traduce los nombres de columna del CSV a los campos del schema interno.
- Cache TTL en localStorage del navegador del admin (default 24h).
- **Cuándo usarlo**: hostelero con Google Sheet o Excel exportado del economato; sin código.

### 3 · `json-url`
- Endpoint REST sin auth que devuelve JSON con los items.
- Útil para ERPs con export REST configurable.
- **Cuándo usarlo**: sistemas con desarrollo propio que exponen el catálogo.

### 4 · `api` (futuro · slot tipado)
- Endpoint REST con auth (token, OAuth).
- Requiere backend que negocie credenciales con el ERP del economato.
- **Cuándo usarlo**: integraciones con SAP, Logic Class, Pikotea u otros sistemas profesionales.

## Razones

1. **Compatibilidad con el stack estático actual** (D-1, D-4): los 3 primeros tipos NO requieren backend, funcionan sobre GitHub Pages + fetch del navegador.
2. **Migración progresiva**: un proyecto puede empezar `static` (cargado por wizard) → migrar a `csv-url` cuando el jefe de cocina exponga su Sheet → migrar a `api` cuando exista BaaS o backend propio.
3. **Cache local como red de seguridad**: incluso si la URL falla, `items` sigue legible. El editor muestra `lastSync` y avisa si está obsoleto.
4. **Pluggability futura**: el slot `api` está tipado pero no implementado. Cuando exista backend (Fase 5+ del ADR), añadir un nuevo handler sin tocar el contrato de UI.

## Consecuencias

### Positivas
- El recetario puede usar precios reales del economato sin que el director toque código.
- Refresh manual («Sincronizar ahora») + automático (TTL).
- Validación previa (probar URL, detectar columnas) antes de aceptar la fuente.
- Mismo modelo se reaprovecha en el futuro para `bebidas` (carta de vinos del distribuidor) y `proveedores` (lista de mayoristas).

### Negativas / asumidas
- **CORS**: muchos sistemas no envían headers CORS, fetch desde navegador falla. Mitigación a corto: el director publica el Google Sheet como CSV público (Google sí envía CORS OK). A medio: BaaS con proxy.
- **CSV mal formateado**: el `columnMapping` no resuelve archivos malos. Validación + mensaje claro en el editor.
- **`csv-url` no es seguro para datos sensibles** (la URL es pública por definición). El catálogo de productos no suele ser sensible, pero hay que documentar la limitación.
- **Sin auth** en niveles 2-3, cualquiera con la URL ve los datos. Aceptable para precios de mercado genéricos.

## Implementación (v4.11 · este PR)

`core/js/productos-connector.js` expone `window.fnbProductos`:

```js
loadProductos(projectId)
  // devuelve { source, items, isCached }
  // si static → items del JSON
  // si csv/json-url → cache local si fresh, fetch si no

syncProductos(projectId, opts?)
  // fuerza refresh (ignora cache TTL)
  // valida source + parsea + actualiza cache + retorna nuevo items

validateSource(source)
  // pre-check antes de aceptar config nueva en el editor
  // retorna { ok, error?, columnsDetected? }
```

UI en el editor `dashboard/editor.html` sección «📦 Productos» con dos sub-tabs:
- **Fuente**: tipo, URL, mapping de columnas, lastSync, botón Sincronizar.
- **Catálogo**: lista de items actual (read-only en source != static · editable en static).

## Revisión futura

Re-evaluar tras Fase 3.5 completa si:
- Aparecen sistemas concretos que requieran handler específico (Pikotea API, etc.).
- Los precios cambian tan rápido que necesitamos webhooks en lugar de polling.
- Se necesita auth para fuentes privadas (requiere backend).

Antes de implementar el tipo `api`, evaluar si la decisión §13 (Supabase como BaaS) está activa.
