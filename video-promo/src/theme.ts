// Design tokens · paleta corporativa Queens Bellybutton
// Coincide con la paleta de dashboard-theme.css y del producto.

export const colors = {
  // Backgrounds
  bg: "#0a1733",          // Navy primary
  bgSurface: "#0f1f42",
  bgElevated: "#15295a",

  // Texto
  text: "#f4ead7",        // Cream / champán suave
  textSoft: "#b8c4dc",
  textMuted: "#8aa5d6",

  // Acentos
  gold: "#c9a35c",        // Oro corporativo
  goldSoft: "#e8cf8a",
  goldDeep: "#8a682b",

  // Estados
  success: "#34d399",     // Verde para CTAs positivos
  successSoft: "#6ee7b7",
  danger: "#f85149",      // Rojo para dolor / errores
  warning: "#fbbf24",
  info: "#a78bfa",

  // Verde superadmin (sólo si aparece esa escena)
  greenBright: "#00E676",
  greenDeep: "#0F4D2E",

  // Pills de dietas (sistema transversal)
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
  display: '"Cormorant Garamond", Georgia, serif',
  ui: '"Inter", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// FPS común a todas las composiciones
export const FPS = 30;

// Frame -> seconds helper para timing legible en cada escena
export const sec = (n: number) => Math.round(n * FPS);

// Duración por escena en frames (s × 30)
export const SCENE_DURATIONS = {
  s01_coldOpen:       sec(15),    // 0:00–0:15
  s02_personaje:      sec(30),    // 0:15–0:45
  s03_problema:       sec(30),    // 0:45–1:15
  s04_ohCrap:         sec(30),    // 1:15–1:45
  s05_solucion:       sec(30),    // 1:45–2:15
  s06_cotizador:      sec(40),    // 2:15–2:55
  s07_recetario:      sec(35),    // 2:55–3:30
  s08_salaMovil:      sec(35),    // 3:30–4:05
  s09_metricas:       sec(25),    // 4:05–4:30
  s10_diferenciador:  sec(30),    // 4:30–5:00
  s11_cta:            sec(30),    // 5:00–5:30
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce(
  (a, b) => a + b,
  0
); // 9900 frames @ 30 fps = 330 s = 5:30 min

// Easings reutilizables · bezier "snap" recomendado por Remotion
import { Easing } from "remotion";
export const easings = {
  inOut: Easing.bezier(0.16, 1, 0.3, 1),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: Easing.linear,
} as const;
