# Video promo · Queen's Bellybutton · Remotion

Proyecto **Remotion** que genera el vídeo promocional del producto programáticamente. Coste real: **0 €**.

Versión actual: **v6.0** · motion comic estilo Marvel retro · 2:18 min · 11 paneles · 3 composiciones.

---

## ¿Qué genera?

Tres composiciones registradas, todas con los mismos 11 paneles de cómic pero distinta resolución. Las tres reutilizan `VideoComic.tsx` con escalado de escenario (1920×1080 centrado y escalado sobre papel de cómic con puntos de semitono):

| Composición | Dimensiones | Duración | Uso |
|---|---|---|---|
| `VideoPromo` | 1920×1080 | 2:18 min | Web, embed, presentaciones, YouTube |
| `VideoPromoSquare` | 1080×1080 | 2:18 min | LinkedIn feed, Instagram feed |
| `VideoPromoVertical` | 1080×1920 | 2:18 min | Stories, Reels, TikTok |

Cada una sale como MP4 sin marca de agua de terceros (lleva el isotipo QBB como watermark propio), sin coste, en `out/`.

---

## Los 11 paneles

Guion **producto primero**: la trayectoria personal aparece solo como aval de credibilidad (panel 10, 8 s).

| # | Panel | Duración | Contenido |
|---|---|---|---|
| 1 | Portada | 10 s | Logo QBB héroe + título estilo cómic |
| 2 | Problema | 12 s | El caos de gestionar eventos a mano |
| 3 | Solución | 12 s | Qué es Queen's Bellybutton |
| 4 | Cotizador | 15 s | El cliente entra desde un QR y configura su evento |
| 5 | Dietas | 13 s | Sistema transversal de dietas y protocolos |
| 6 | Recetario | 14 s | Recetario con escandallos |
| 7 | Sala | 13 s | Vista de sala integrada en el panel, el día del evento |
| 8 | Métricas | 13 s | KPIs reales + calendario de disponibilidad |
| 9 | Diferenciador | 12 s | Qué lo hace distinto |
| 10 | Credibilidad | 8 s | 30 años de dirección hotelera |
| 11 | CTA | 16 s | Llamada a la acción + logo |

---

## Instalación · primera vez

Requisitos: Node.js 20+ (ya lo tienes para los tests Playwright del repo principal).

```bash
cd video-promo
npm install
```

Tarda ~2-3 min la primera vez (descarga Remotion + Chromium para renderizar).

---

## Uso diario

### Preview interactivo (Remotion Studio)

```bash
npm start
```

Abre `http://localhost:3000`. Ves las 3 composiciones, las navegas frame a frame, editas el JSON de textos y se actualiza al instante. **Ideal para iterar.**

### Render del MP4 final

```bash
# Sólo la principal landscape (recomendado para primer test)
npm run build

# Cuadrada para LinkedIn/Instagram
npm run build:square

# Vertical Stories/Reels
npm run build:vertical

# Las 3 de golpe
npm run build:all
```

Con `Config.setConcurrency(4)` (ya configurado), cada render tarda ~10-15 min en un i7 de 4 núcleos. Los MP4 salen en `out/`.

---

## Estructura del proyecto

```
video-promo/
├── package.json              · deps Remotion 4.0.474 + React 19
├── tsconfig.json
├── remotion.config.ts        · jpeg + concurrency 4 + angle
├── scripts/
│   ├── crop-poses.py         · recorta poses desde la hoja de Gemini
│   └── remove-bg.js          · quita fondo blanco de las poses (pngjs)
├── public/
│   ├── assets/               · 8 capturas reales del producto
│   └── comic/                · poses Marvel del personaje + logos QBB
│       ├── paco-personaje-marvel.png   · referencia maestra del personaje
│       ├── paco-pose-*.png             · 10 poses recortadas
│       ├── qbb-logo-hero.png           · logo completo (portada + CTA)
│       └── qbb-isotipo-*.png/svg       · isotipo (watermark)
└── src/
    ├── index.ts              · registerRoot
    ├── Root.tsx              · registra las 3 composiciones
    ├── theme.ts              · design tokens (paleta cómic, fonts, fps, SCENE_DURATIONS)
    ├── texts/
    │   └── es.json           · todos los textos del cómic en español
    ├── components/
    │   ├── ComicPage.tsx     · papel + semitono + escalado de escenario
    │   ├── ComicPanel.tsx    · viñeta con borde de tinta
    │   ├── SpeechBubble.tsx  · bocadillo de diálogo
    │   ├── CaptionBox.tsx    · cartela narrativa amarilla
    │   ├── Onomatopeya.tsx   · ¡ZAS! ¡BOOM! con spring
    │   ├── Watermark.tsx     · isotipo QBB fijo en esquina
    │   ├── DietPill.tsx      · pill coloreada por dieta
    │   └── KenBurnsImage.tsx · imagen con zoom+pan lento
    ├── scenes/
    │   └── Scene01Portada.tsx … Scene11CTA.tsx
    └── compositions/
        └── VideoComic.tsx    · única composición, parametrizada por tamaño
```

Tipografías vía `@remotion/google-fonts`: **Bangers** (display cómic) + **Comic Neue** (cuerpo).

---

## Cómo iterar el guion

Toda la copia está en `src/texts/es.json`. Cambias una frase → re-renderizas con `npm run build` → MP4 nuevo. No tocas código.

## Calibrar timing panel a panel

Las duraciones están en `src/theme.ts` en `SCENE_DURATIONS`, en segundos. Remotion recalcula automáticamente cuándo empieza cada panel siguiente.

## Regenerar poses del personaje

1. Genera la hoja de poses en Gemini usando `public/comic/paco-personaje-marvel.png` como referencia del personaje (pelo castaño oscuro, traje azul marino).
2. Recorta con `python scripts/crop-poses.py`.
3. Limpia el fondo con `node scripts/remove-bg.js`.
4. Las poses quedan en `public/comic/paco-pose-*.png`.

---

## Si algo no se ve bien

1. **Bordes recortados en cuadrada/vertical:** las tres composiciones escalan el escenario 1920×1080 completo (letterbox sobre papel de cómic), así que no se recorta contenido; si un texto se ve pequeño en vertical, sube su tamaño en la escena.
2. **Las capturas del producto se ven borrosas:** están capturadas a 1920×1080 desde Chrome DevTools. Para más resolución, recaptura con `--device-scale-factor=2`.
3. **Render muy lento:** ajusta `Config.setConcurrency()` en `remotion.config.ts` al número de cores de tu CPU.

---

## Comando rápido para empezar

```bash
cd video-promo
npm install        # 2-3 min
npm start          # abre studio en localhost:3000
# Cuando te guste el preview:
npm run build      # genera MP4 landscape en out/
```

¡A renderizar!
