# Vídeo promocional · Queen's Bellybutton · Guion v6.0

> **Formato:** Remotion (vídeo programático en React) · motion comic estilo Marvel retro
> **Resolución:** 1920×1080 · 30 fps · MP4 (+ versiones cuadrada 1080×1080 y vertical 1080×1920)
> **Duración:** 2:18 min (138 s · 11 paneles de cómic)
> **Audio:** Sin voz — cartelas y bocadillos en pantalla + música de fondo opcional (royalty-free)
> **Narrativa:** Producto primero — 9 paneles de producto, 1 de credibilidad, 1 de CTA
> **Tono:** Cómic de superhéroes vintage · enérgico · "el caos del catering tiene quien lo resuelva"
> **Idioma:** Español (toda la copia vive en `src/texts/es.json`; una v2 inglesa sería un `en.json`)

> **Nota de versión:** Este guion sustituye al borrador kinetic-typography de 5:30 min. El vídeo
> real es un **motion comic** mucho más corto y visual. La copia de referencia es la de
> `video-promo/src/texts/es.json`; si editas frases, hazlo allí, no aquí.

---

## El arco narrativo

A diferencia del primer borrador (centrado en la historia personal de Paco), este vídeo pone el
**producto primero**. La trayectoria de 30 años aparece solo al final, como aval de credibilidad
(panel 10, 8 s). El recorrido es: caos → solución → recorrido por las herramientas → diferenciador
→ quién hay detrás → llamada a la acción.

| Bloque | Paneles | Qué hace |
|---|---|---|
| **Gancho** | 1 · Portada | Portada de cómic con el logo héroe e issue "Nº 1" |
| **Dolor** | 2 · Problema | El caos de gestionar eventos a mano (Excel, Word, emails) |
| **Promesa** | 3 · Solución | Qué es Queen's Bellybutton en tres líneas |
| **Demo** | 4–8 · Cotizador, Dietas, Recetario, Sala, Métricas | Una herramienta por panel, con captura real |
| **Diferenciador** | 9 | Sin cuotas · datos en tu repo · una URL por cliente |
| **Aval** | 10 · Credibilidad | 30 años de dirección hotelera detrás |
| **Cierre** | 11 · CTA | "¿Lo vemos con tu carta?" + logo + contacto |

---

## Decisiones de diseño

### Estilo visual: cómic de superhéroes retro
- **Página de cómic**: papel con textura y patrón de semitono (puntos Ben-Day), viñetas con borde
  de tinta grueso y sombra dura desplazada.
- **Personaje Paco** dibujado estilo Marvel vintage (pelo castaño oscuro, traje azul marino). Se
  genera como hoja de poses y se recorta a PNGs individuales (`paco-pose-*.png`).
- **Bocadillos de diálogo** (`SpeechBubble`) y **cartelas narrativas** amarillas (`CaptionBox`).
- **Onomatopeyas** (`¡RIIING!`, `¡ZAS!`, `¡PLOP!`) que entran con un *spring* exagerado.
- **Ken Burns** suave (zoom + pan lento) sobre las capturas reales del producto.
- **Watermark** propio: el isotipo QBB fijo en una esquina (no es marca de agua de terceros).

### Paleta cómic
```
Tinta (bordes/texto)   #16130d · casi negro cálido
Papel                  crema con semitono
Rojo cómic             cartelas de acción y acentos
Azul cómic             bordes de pop-ups y cierres
Oro / champán          logo y precio "0 €"
Verde success          checks de la vista de sala
```

### Tipografía (vía `@remotion/google-fonts`)
- **Display (titulares, onomatopeyas, cartelas):** Bangers
- **Cuerpo (texto de apoyo, listas):** Comic Neue

---

## Estructura · 11 paneles

> Duraciones en `src/theme.ts` (`SCENE_DURATIONS`). Cada escena es un `SceneNN*.tsx` en
> `src/scenes/`. Los textos citados abajo son los de `es.json`.

### Panel 1 · Portada (10 s)
**Visual:** Portada de cómic. Logo QBB héroe en grande, título estilo cómic, faja de "issue".
**Copia:**
- Kicker: "PRESENTANDO LA PLATAFORMA DE GESTIÓN F&B"
- Título: "QUEEN'S BELLYBUTTON"
- Subtítulo: "Tus eventos, de la petición al servicio, en una sola herramienta"
- Issue: "Nº 1 · JUNIO 2026" · Precio: "0 € / mes"

### Panel 2 · El problema (12 s)
**Visual:** Viñeta del caos; Paco agobiado, papeles volando. Onomatopeya de teléfono.
**Copia:**
- Cartela: "Hoy, en cientos de hoteles y salones de eventos…"
- Bocadillo: "¡¿Dónde está el presupuesto de la boda?! ¿Y la lista de alérgenos?"
- Items que caen: Excel · Word · emails infinitos · notas sueltas
- Onomatopeya: "¡RIIING!"

### Panel 3 · La solución (12 s)
**Visual:** Giro de tono; Paco resuelto presenta la plataforma.
**Copia:**
- Cartela: "Hasta que todo cambia."
- Bocadillo: "Se acabó el caos. Esto es Queen's Bellybutton."
- Taglines: "Todo tu catering." / "Una sola plataforma." / "Cero cuota mensual."

### Panel 4 · El cotizador (15 s)
**Visual:** Captura real de `presupuesto-evento.html?proyecto=miramar` con Ken Burns; comparación antes/ahora.
**Copia:**
- Cartela: "EL COTIZADOR"
- "El cliente entra desde un QR y configura su evento…"
- "…elige menús con precios siempre al día."
- ANTES: "una mañana entera" → AHORA: "minutos"
- Onomatopeya: "¡ZAS!"

### Panel 5 · Menús especiales / dietas (13 s)
**Visual:** Rejilla de pills coloreadas (`DietPill`), una por dieta.
**Copia:**
- Cartela: "MENÚS ESPECIALES"
- "8 dietas con menús reales. No simples casillas."
- Pills: 🌱 Vegano · 🥗 Vegetariano · 🌾 Sin gluten · 🥛 Sin lactosa · 🌰 Sin frutos secos · 🕌 Halal · 🕎 Kosher · 👶 Infantil
- Cierre: "Cada dieta con su menú completo y su protocolo de sala."

### Panel 6 · Recetario + escandallos (14 s)
**Visual:** Captura del recetario con ficha de plato y escandallo.
**Copia:**
- Cartela: "RECETARIO + ESCANDALLOS"
- "Cada plato con su ficha, su foto y su escandallo."
- "Precios de mayorista reales. El margen, bajo control."
- Bocadillo: "Sabes lo que cuesta cada plato antes de venderlo."

### Panel 7 · Vista de sala (13 s)
**Visual:** Dos viñetas-teléfono mostrando la vista de sala (capturas `sala-movil-hoy.png` y
`sala-movil-empty.png`) y un checklist con checks verdes que hacen *pop*.
**Copia:**
- Cartela: "VISTA DE SALA"
- "El equipo lo consulta todo desde el mismo panel, en cualquier pantalla:"
- Checklist: ✓ dietas críticas por mesa · ✓ protocolo de servicio · ✓ alergias señalizadas
- Cierre: "Sin paseos a cocina. Sin sorpresas en el servicio."

> **Nota v6.0:** la vista de sala ya NO es una app móvil instalable (PWA). Es una vista más del
> panel (`dashboard/sala.html`), responsive, que se abre en cualquier navegador. Las capturas se
> muestran sobre viñetas con forma de teléfono solo para evocar el uso en movilidad.

### Panel 8 · Métricas y calendario (13 s)
**Visual:** Panel de KPIs + calendario de disponibilidad. Onomatopeya al cuadrar una reserva.
**Copia:**
- Cartela: "MÉTRICAS Y CALENDARIO"
- "Presupuestos, ocupación y disponibilidad en un panel."
- "El calendario bloquea las dobles reservas solo."
- Onomatopeya: "¡PLOP!"

### Panel 9 · El diferenciador (12 s)
**Visual:** Paco mirando a cámara; tres líneas de remate.
**Copia:**
- Cartela: "¿Y EL TRUCO? NO HAY TRUCO."
- "Sin cuotas mensuales."
- "Tus datos viven en tu propio repositorio."
- "Cada cliente, su propia URL."

### Panel 10 · Credibilidad (8 s)
**Visual:** Retrato de Paco en pose firme; firma.
**Copia:**
- Cartela: "Detrás no hay una startup."
- "Hay 30 años dirigiendo hoteles y eventos."
- Firma: "Francisco J. Martínez Alba · Director hotelero"

### Panel 11 · CTA cierre (16 s)
**Visual:** Logo QBB héroe, Paco saludando, datos de contacto, faja de versión.
**Copia:**
- Bocadillo: "¿Lo vemos con tu carta?"
- Promesa: "Demo con tus menús en minutos."
- URL: "fjmacarmen-blip.github.io/control-gestion-fnb"
- Contacto: "LinkedIn · GitHub · email"
- Footer: "v6.0 · junio 2026 · 0 € coste de operación"

---

## Timeline resumen

| Panel | Tema | Duración |
|---|---|---|
| 1 | Portada | 10 s |
| 2 | Problema | 12 s |
| 3 | Solución | 12 s |
| 4 | Cotizador | 15 s |
| 5 | Dietas | 13 s |
| 6 | Recetario | 14 s |
| 7 | Vista de sala | 13 s |
| 8 | Métricas | 13 s |
| 9 | Diferenciador | 12 s |
| 10 | Credibilidad | 8 s |
| 11 | CTA | 16 s |
| **TOTAL** | | **138 s · 2:18** |

---

## Capturas reales necesarias

Viven en `video-promo/public/assets/` (8 capturas a 1920×1080 desde Chrome). Para más nitidez,
recapturar con `--device-scale-factor=2`.

| Panel | Origen sugerido |
|---|---|
| 4 · Cotizador | `presupuesto-evento.html?proyecto=miramar` |
| 6 · Recetario | `recetario.html?proyecto=miramar` (ficha de plato + escandallo) |
| 7 · Sala | `dashboard/sala.html?proyecto=miramar` (servicio de hoy y vista vacía) |
| 8 · Métricas | `dashboard/metricas.html` + calendario |

Las poses del personaje (`public/comic/paco-pose-*.png`) se regeneran con la hoja de Gemini y los
scripts `scripts/crop-poses.py` + `scripts/remove-bg.js`.

---

## Música de fondo (opcional)

Recomendación: **YouTube Audio Library** (royalty-free, 0 €). Para un motion comic enérgico encaja
mejor un tema "Upbeat / Funk / Retro" a 100–120 BPM que algo cinemático lento. Volumen al 15–20 %
para no competir con las cartelas.

---

## Cómo renderizar

```bash
cd video-promo
npm install        # primera vez (~2-3 min)
npm start          # Remotion Studio en localhost:3000 para iterar
npm run build      # MP4 landscape 1920×1080 en out/
npm run build:square    # 1080×1080 (LinkedIn/Instagram feed)
npm run build:vertical  # 1080×1920 (Stories/Reels/TikTok)
npm run build:all       # las tres de golpe
```

Detalle completo del proyecto en [`video-promo/README.md`](../video-promo/README.md).
