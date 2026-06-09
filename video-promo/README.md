# Video promo · Queens Bellybutton · Remotion

Proyecto **Remotion** que genera el vídeo promocional del producto programáticamente. Coste real: **0 €**.

Versión actual: **v5.18** · 5:30 min · 4 composiciones · paleta corporativa coherente con el producto.

---

## ¿Qué genera?

Cuatro composiciones registradas, todas con los mismos 11 frames narrativos pero distinta resolución:

| Composición | Dimensiones | Duración | Uso |
|---|---|---|---|
| `VideoPromo` | 1920×1080 | 5:30 min | Web, embed, presentaciones, YouTube |
| `VideoPromoSquare` | 1080×1080 | 5:30 min | LinkedIn feed, Instagram feed |
| `VideoPromoVertical` | 1080×1920 | 5:30 min | Stories, Reels, TikTok |
| `VideoPromoTeaser` | 1920×1080 | 1:30 min | WhatsApp, preview rápido |

Cada una sale como MP4 sin marca de agua, sin coste, en `out/`.

---

## Instalación · primera vez

Requisitos: Node.js 20+ (ya lo tienes para los tests Playwright del repo principal).

```bash
cd video-promo
npm install
```

Tarda ~2-3 min la primera vez (descarga Remotion + Chromium para renderizar). Sin tu intervención.

---

## Uso diario

### Preview interactivo (Remotion Studio)

```bash
npm start
```

Abre `http://localhost:3000`. Ves las 4 composiciones, las navegas frame a frame, editas el JSON de textos y se actualiza al instante. **Ideal para iterar.**

### Render del MP4 final

```bash
# Sólo la principal landscape (recomendado para primer test)
npm run build

# Cuadrada para LinkedIn/Instagram
npm run build:square

# Vertical Stories/Reels
npm run build:vertical

# Teaser 90 seg WhatsApp
npm run build:teaser

# Las 4 de golpe
npm run build:all
```

Cada render tarda ~3-8 min según tu CPU. Los MP4 salen en `out/`.

---

## Estructura del proyecto

```
video-promo/
├── package.json              · deps Remotion 4.x + React 19
├── tsconfig.json
├── remotion.config.ts
├── public/
│   ├── assets/               · 8 capturas reales del producto (ya están)
│   ├── audio/
│   │   └── faith.mp3         · ⚠️ descargar manualmente (ver abajo)
│   └── fonts/                · (opcional: locales · si no, usa Google Fonts)
└── src/
    ├── index.ts              · registerRoot
    ├── Root.tsx              · registra las 4 composiciones
    ├── theme.ts              · design tokens (paleta, fonts, fps, duraciones)
    ├── texts/
    │   └── es.json           · todos los textos kinetic en español
    ├── components/
    │   ├── PacoAvatar.tsx    · avatar SVG · 4 poses (thinking/worried/happy/waving)
    │   ├── KineticText.tsx   · texto animado con fade+slide o spring
    │   ├── Background.tsx    · fondo navy/gradient/split
    │   ├── DietPill.tsx      · pill coloreada por dieta
    │   └── KenBurnsImage.tsx · imagen con zoom+pan lento
    ├── scenes/
    │   ├── Scene01ColdOpen.tsx
    │   ├── Scene02Personaje.tsx
    │   ├── Scene03Problema.tsx
    │   ├── Scene04OhCrap.tsx
    │   ├── Scene05Solucion.tsx
    │   ├── Scene06Cotizador.tsx
    │   ├── Scene07Recetario.tsx
    │   ├── Scene08SalaMovil.tsx
    │   ├── Scene09Metricas.tsx
    │   ├── Scene10Diferenciador.tsx
    │   └── Scene11CTA.tsx
    └── compositions/
        ├── VideoPromo.tsx           · principal 5:30 min
        └── VideoPromoTeaser.tsx     · teaser 1:30 min
```

---

## Música de fondo · Faith

⚠️ **Falta este archivo · te toca a ti:**

1. Ve a https://studio.youtube.com/channel/UC/music
2. Busca "Faith" de **Ron Gelinas** (o cualquier otro track royalty-free Cinematic/Hopeful)
3. Descarga el MP3
4. Guárdalo en `video-promo/public/audio/faith.mp3`
5. En `src/compositions/VideoPromo.tsx` descomenta esta línea:
   ```tsx
   {/* <Audio src={staticFile("audio/faith.mp3")} volume={0.18} /> */}
   ```
6. Vuelve a renderizar

**Si decides no añadir música:** el vídeo funciona perfecto en silencio (los textos kinetic son legibles solos, es lo bueno de no usar voz).

---

## Cómo iterar el guion

Toda la copia está en `src/texts/es.json`. Cambias una frase → re-renderizas con `npm run build` → MP4 nuevo. No tocas código.

Para añadir una versión inglesa:
1. Copia `es.json` a `en.json`
2. Traduce los valores
3. En cada escena cambia `import texts from "../texts/es.json"` por `en.json`
4. Renderiza con otra composición o sobrescribe

---

## Calibrar timing escena por escena

Las duraciones están en `src/theme.ts` en `SCENE_DURATIONS`. Cada una en segundos × 30 fps.

Si una escena se siente larga o corta, edita el número ahí. Remotion recalcula automáticamente cuándo empieza cada escena siguiente.

---

## Si algo no se ve bien

1. **Texto fuera de pantalla en versión cuadrada/vertical:** los layouts están pensados para 1920×1080. La square y vertical reutilizan el mismo código, pueden recortar bordes. Si pasa, ajusta `maxWidth` en la escena afectada o crea `VideoPromoSquare.tsx` con layout específico.
2. **Avatar Paco no se parece a ti:** el SVG está en `PacoAvatar.tsx`. Es código puro, puedes ajustar colores del pelo, traje, gafas a tu gusto. Cada `<path>` está comentado.
3. **Las capturas del producto se ven borrosas:** las capturé a 1920×1080 desde Chrome DevTools MCP. Si quieres más resolución, vuelve a capturarlas con `--device-scale-factor=2`.
4. **Render muy lento:** baja `Config.setConcurrency(1)` a 4 u 8 en `remotion.config.ts` si tu CPU tiene más cores.

---

## Estado actual

- ✅ Estructura completa del proyecto
- ✅ 11 escenas implementadas con animaciones
- ✅ Avatar Paco SVG con 4 poses
- ✅ Capturas reales del producto incluidas
- ✅ 4 composiciones registradas
- ⚠️ Faltan: `npm install` (lo haces tú la primera vez) + `faith.mp3` (descarga manual)

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
