# Plantillas comerciales

Material comercial editable para Camino A · consultoría artesanal.

## Plantillas disponibles

### 📄 PROPUESTA-ECONOMICA.docx

Documento Word editable, 4-5 páginas A4. Plantilla profesional para enviar a cada cliente potencial tras la primera llamada comercial.

**Estructura:**
1. **Portada** · resumen ejecutivo + datos del cliente
2. **Alcance** · tabla con las 12 capacidades incluidas + valor de mercado
3. **Calendario de implantación** · 4 semanas detalladas
4. **Inversión** · implantación one-shot + mantenimiento mensual opcional
5. **Incluido y no incluido** · evita malentendidos
6. **Condiciones y firma** · plazo, confidencialidad, fuero, espacios de firma

**Diseño:** Calibri, paleta esmeralda + slate del proyecto, márgenes 2.5 cm.

## Cómo personalizar (5 minutos por cliente)

Abre `PROPUESTA-ECONOMICA.docx` en Word, Google Docs o LibreOffice y usa **Buscar y reemplazar** (`Ctrl + H`) para sustituir los siguientes campos. Todos van marcados con corchetes y resaltado amarillo para que destaquen.

### Datos del cliente

| Buscar | Reemplazar por |
| --- | --- |
| `[NOMBRE_CLIENTE]` | Hotel Miramar Dorado, Restaurante Casa Lola, etc. |
| `[TIPO_ESTABLECIMIENTO]` | Hotel 5 estrellas, Restaurante mediterráneo, Catering, etc. |
| `[CIUDAD]` | Marbella, Algeciras, Madrid, etc. |
| `[DD]`, `[MES]`, `[AAAA]` | 12, junio, 2026 |
| `[REF-AAAA-XXX]` | PROP-2026-001 (numeración secuencial) |

### Precios (decidir caso por caso)

| Buscar | Reemplazar por | Rango sugerido |
| --- | --- | --- |
| `[PRECIO_IMPLANTACION]` | 1500, 2500, 3500 | 1.500 € - 3.500 € según tamaño |
| `[PRECIO_MTO]` | 29, 49, 79 | 29 € (Bistró) · 49 € (estándar) · 79 € (Hotel) |

### Datos de firma

| Buscar | Reemplazar por |
| --- | --- |
| `[NOMBRE_FIRMANTE]` | Nombre del director / apoderado del cliente |
| `[DNI_CIF]` | NIF/CIF del cliente |
| `[FECHA_FIRMA]` | Fecha en que el cliente firma |
| `[NIF_PACO]` | Tu propio NIF |
| `[FECHA_FIRMA_PACO]` | Tu fecha de firma |

## Después de personalizar

1. **Revisa** una última vez (sobre todo precios y nombres)
2. **Guarda como PDF** desde Word (`Archivo → Exportar → Crear PDF/XPS`) o desde LibreOffice (`Archivo → Exportar como PDF`)
3. **Envía por email** al cliente desde tu correo personal o el comercial
4. **Archiva** el .docx personalizado en una carpeta `propuestas-enviadas/AAAA/REF-AAAA-XXX/` por si lo necesitas

## Mantenimiento de la plantilla base

La plantilla se genera desde código (`generate-propuesta.js`). Si quieres modificarla (cambiar textos, precios sugeridos, añadir/quitar módulos):

```bash
# Editar el script con los cambios deseados
code templates-comerciales/generate-propuesta.js

# Regenerar el .docx
node templates-comerciales/generate-propuesta.js
```

La ventaja de generar la plantilla desde código: **versionable en git**, cambios trazables, y se puede regenerar al 100% si el .docx se corrompe.

## Próximas plantillas (pendientes)

- `EMAIL-OUTREACH.txt` · plantillas de email frío a hoteleros (pendiente)
- `CONTRATO-SERVICIOS.docx` · contrato real post-firma de propuesta (pendiente)
- `INFORME-90-DIAS.docx` · reporte de pilotos a los 90 días (pendiente · cuando haya cliente)
