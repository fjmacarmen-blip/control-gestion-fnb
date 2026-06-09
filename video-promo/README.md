# Video promo · Queens Bellybutton

Carpeta del proyecto **Remotion** que genera el vídeo promocional del producto. v5.18 en construcción.

> ⚠️ **WIP** — el scaffold del proyecto Remotion está pendiente (siguiente sesión).
> El guion está aprobado, los assets están capturados, faltan los componentes React.

## Qué hay aquí ahora

```
video-promo/
├── README.md           ← este archivo
└── public/
    └── assets/         ← 8 capturas reales del producto en producción
        ├── cotizador-step-1.png         · paso 1 cotizador (tipo evento + asistentes)
        ├── cotizador-step-2-menu.png    · paso 2 (paquetes de menú)
        ├── cotizador-step-2-5-dietas.png · paso 2.5 (3 dietas con tarjetas)
        ├── recetario-sidebar.png        · recetario con sidebar y pills de dieta
        ├── superadmin-authgate.png      · auth gate del panel verde
        ├── dashboard-login.png          · login del director
        ├── sala-movil-hoy.png           · sala móvil PWA viewport iPhone
        └── sala-movil-empty.png         · variante empty state
```

Capturas hechas el 5-9 jun 2026 desde la URL pública de GitHub Pages contra Miramar.

## Qué falta (próxima sesión)

### 1. Scaffold del proyecto Remotion

```bash
cd video-promo
npx create-video@latest --yes --blank --no-tailwind .
# → genera package.json, src/Root.tsx, src/Composition.tsx, etc.
```

### 2. Estructura objetivo

```
video-promo/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── public/
│   ├── assets/         ← capturas (ya están)
│   ├── audio/
│   │   └── faith.mp3   ← música Faith de Ron Gelinas (descargar de YouTube Audio Library)
│   └── fonts/          ← Cormorant Garamond + Inter + JetBrains Mono
└── src/
    ├── Root.tsx                ← define 4 composiciones (landscape, square, vertical, teaser-90s)
    ├── compositions/
    │   ├── VideoPromo.tsx      ← composición principal 1920×1080 5:30 min
    │   ├── VideoPromoSquare.tsx ← 1080×1080 LinkedIn/Instagram
    │   ├── VideoPromoVertical.tsx ← 1080×1920 Stories/Reels
    │   └── VideoPromoTeaser.tsx ← 90 seg recortado WhatsApp
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
    ├── components/
    │   ├── PacoAvatar.tsx      ← SVG con 4 poses (thinking, worried, happy, waving)
    │   ├── KineticText.tsx     ← texto con animación fade+slide
    │   ├── DietPill.tsx        ← pill de dieta con color
    │   └── BadgeNumber.tsx     ← cifras grandes con énfasis
    ├── theme.ts                ← design tokens (paleta corporativa)
    └── texts/
        ├── es.json             ← textos kinetic en español
        └── en.json             ← versión inglesa (más tarde)
```

### 3. Comando de render

```bash
cd video-promo
npx remotion studio              # Preview interactivo
npx remotion render VideoPromo   # Renderiza MP4 landscape (~5 min)
npx remotion render VideoPromoSquare
npx remotion render VideoPromoVertical
npx remotion render VideoPromoTeaser
```

### 4. Música de fondo

Descargar **Faith** de Ron Gelinas desde YouTube Audio Library:
- https://www.youtube.com/audiolibrary
- Buscar: "Faith Ron Gelinas"
- Descargar MP3 → guardar en `video-promo/public/audio/faith.mp3`
- Trim a 5:30 min y bajar volumen al 15%

## Guion completo

Ver [`docs/VIDEO-PROMO-GUION-v1.md`](../docs/VIDEO-PROMO-GUION-v1.md).

## Decisiones de Paco (aprobadas)

| Decisión | Valor |
|---|---|
| Tono | Cercano e informal · humor sutil incluido |
| Cifras objetivas | NO usar · descripciones cualitativas |
| Compromiso final | "Si lo necesitas, lo construyo contigo" |
| Música | Faith de Ron Gelinas |
| Avatar Paco | Aparece 4 veces en momentos clave |
| Mockups | Capturados con Chrome DevTools MCP (real producto en producción) |

## Próximos pasos en orden

1. Próxima sesión: `npx create-video` + setup
2. Implementar `theme.ts` y `PacoAvatar.tsx` (los más reusables)
3. Implementar escena por escena (empezando por escena 5 que es la más visual)
4. Iterar con Remotion Studio (preview en tiempo real)
5. Renderizar las 4 composiciones
6. Subir a GitHub Releases o Drive para compartir
