# Branding · Plataforma F&B

Esta carpeta contiene propuestas de logo y assets de marca.

## Estado actual (v5.7)

El logo activo en el producto es **texto «F&B» en degradado** (slate→emerald). Funciona pero no tiene empaque para usar como marca comercial seria. v5.7 introduce **3 propuestas alternativas** entre las que elegir.

## Cómo verlas

Abre `branding/index.html` (o el link en la landing del proyecto cuando se añada) para ver las 3 opciones renderizadas en SVG sobre fondos oscuro y claro, con la versión horizontal completa.

## Las tres propuestas

### Opción A · Monograma serif F&B
- **Carácter:** tradicional, editorial, cercano al hotel clásico
- **Fuerza:** legible inmediatamente como F&B, sensación de oficio
- **Riesgo:** quizás demasiado tradicional para posicionar como producto digital moderno
- **Mejor para:** establecimientos con identidad clásica · hoteles 4-5 estrellas tradicionales

### Opción B · Geometría del menú servido
- **Carácter:** moderno, abstracto, técnico
- **Fuerza:** se diferencia de competidores hosteleros · evoca «producto digital»
- **Riesgo:** requiere explicación la primera vez (las tres barras = entrante/principal/postre)
- **Mejor para:** posicionar como SaaS moderno · audiencia técnica · diferenciación

### Opción C · Cucharón estilizado
- **Carácter:** reconocible al instante como hostelería, personal, único
- **Fuerza:** funciona muy bien en tamaños pequeños (favicon, app icon) · evita clichés
- **Riesgo:** estéticamente más cercano a restaurante que a software · puede limitar percepción de «producto tecnológico»
- **Mejor para:** identidad cálida · acercarse al hostelero como uno de los suyos

## Decisión pendiente

Cuando Paco elija una opción, se generan las variantes completas:

- Isotipo cuadrado (favicon, app icon en 16/32/48/192/512 px)
- Logotipo solo (para líneas estrechas)
- Versión monocromo (impresión BN, fax, fotocopia)
- Versión light (sobre fondo claro)
- Versión dark (sobre fondo oscuro)
- Sustitución del «F&B» actual en:
  - Landing (`index.html`)
  - Dashboards (4 HTMLs)
  - Sala móvil, carta pública, cotizador
  - PWA manifest + icons SVG
  - Pitch deck, mockups, PDFs

Total estimado de aplicación: 30-45 minutos.

## Decisiones de diseño (compartidas)

- **Paleta:** mantener slate (#0d1117) + emerald (#34d399 → #059669) del proyecto
- **Tipografía:** Inter (UI) + Playfair Display (display)
- **Forma base del isotipo:** cuadrado con border-radius 22% (estilo moderno iOS)
- **Sin clichés:** evitar tenedor+cuchara cruzados, chef hat, copa de vino
- **SVG vectorial:** todos los archivos escalables sin pérdida · 0 dependencias raster

## Archivos

```
branding/
├── index.html                          ← Showcase de las 3 opciones
├── README.md                           ← Este archivo
├── opcion-a-monograma/
│   ├── mark-emerald.svg                Isotipo cuadrado 512×512
│   └── horizontal-dark.svg             Horizontal con logotipo
├── opcion-b-geometrico/
│   ├── mark-emerald.svg
│   └── horizontal-dark.svg
└── opcion-c-cuchara-abstracta/
    ├── mark-emerald.svg
    └── horizontal-dark.svg
```

## Generación

Los archivos están escritos en SVG vanilla a mano (sin Gemini AI). Razón: el resultado es 100% editable, sin marcas de agua, sin coste, y produce ficheros mucho más limpios que cualquier generador automático cuando se trata de logos minimalistas.

Si tras la elección quieres explorar variantes generadas por IA (más orgánicas, más complejas), se puede invocar la skill `design` con Gemini AI configurada (requiere API key).
