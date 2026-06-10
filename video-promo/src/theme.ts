// Design tokens · Queen's Bellybutton motion comic (v5.19)
// Paleta cómic retro años 60 + acentos corporativos QBB.

import { Easing } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadComicNeue } from "@remotion/google-fonts/ComicNeue";

const bangers = loadBangers();
const comicNeue = loadComicNeue();

export const colors = {
  // Cómic retro
  paper: "#f2e8d2",       // crema papel envejecido (fondo de las viñetas Gemini)
  paperDark: "#e6d8b8",
  ink: "#16130d",         // tinta negra
  comicRed: "#d62828",
  comicYellow: "#f9c80e",
  comicBlue: "#1d6fb8",
  comicOrange: "#f3722c",

  // Marca QBB
  bg: "#0a1733",          // navy corporativo
  text: "#f4ead7",
  gold: "#c9a35c",
  goldSoft: "#e8cf8a",
  goldDeep: "#8a682b",

  // Estados
  success: "#34d399",
  danger: "#f85149",

  // Pills de dietas (sistema transversal del producto)
  diet: {
    vegano: "#22c55e",
    vegetariano: "#84cc16",
    celiaco: "#ef4444",
    sinLactosa: "#3b82f6",
    sinFrutos: "#f97316",
    halal: "#8b5cf6",
    kosher: "#facc15",
    infantil: "#ec4899",
  },
} as const;

export const fonts = {
  display: `"${bangers.fontFamily}", Impact, sans-serif`,   // titulares cómic
  body: `"${comicNeue.fontFamily}", "Comic Sans MS", cursive`, // captions y bocadillos
  ui: '"Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// FPS común a todas las composiciones
export const FPS = 30;

// Frame -> seconds helper para timing legible en cada escena
export const sec = (n: number) => Math.round(n * FPS);

// Duración por panel en frames (s × 30) · total 138 s = 2:18
export const SCENE_DURATIONS = {
  p01_portada:       sec(10),   // 0:00–0:10
  p02_problema:      sec(12),   // 0:10–0:22
  p03_solucion:      sec(12),   // 0:22–0:34
  p04_cotizador:     sec(15),   // 0:34–0:49
  p05_dietas:        sec(13),   // 0:49–1:02
  p06_recetario:     sec(14),   // 1:02–1:16
  p07_sala:          sec(13),   // 1:16–1:29
  p08_metricas:      sec(13),   // 1:29–1:42
  p09_diferenciador: sec(12),   // 1:42–1:54
  p10_credibilidad:  sec(8),    // 1:54–2:02
  p11_cta:           sec(16),   // 2:02–2:18
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce(
  (a, b) => a + b,
  0
); // 4140 frames @ 30 fps = 138 s

// Easings reutilizables
export const easings = {
  inOut: Easing.bezier(0.16, 1, 0.3, 1),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: Easing.linear,
} as const;
