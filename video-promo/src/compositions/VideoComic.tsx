import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { colors, SCENE_DURATIONS } from "../theme";
import { Scene01Portada } from "../scenes/Scene01Portada";
import { Scene02Problema } from "../scenes/Scene02Problema";
import { Scene03Solucion } from "../scenes/Scene03Solucion";
import { Scene04Cotizador } from "../scenes/Scene04Cotizador";
import { Scene05Dietas } from "../scenes/Scene05Dietas";
import { Scene06Recetario } from "../scenes/Scene06Recetario";
import { Scene07Sala } from "../scenes/Scene07Sala";
import { Scene08Metricas } from "../scenes/Scene08Metricas";
import { Scene09Diferenciador } from "../scenes/Scene09Diferenciador";
import { Scene10Credibilidad } from "../scenes/Scene10Credibilidad";
import { Scene11CTA } from "../scenes/Scene11CTA";

// Las escenas se diseñan sobre un lienzo fijo 16:9; en los formatos
// cuadrado y vertical el lienzo se escala y centra sobre papel cómic.
const STAGE_W = 1920;
const STAGE_H = 1080;

const SCENES: {
  key: keyof typeof SCENE_DURATIONS;
  Scene: React.FC;
}[] = [
  { key: "p01_portada", Scene: Scene01Portada },
  { key: "p02_problema", Scene: Scene02Problema },
  { key: "p03_solucion", Scene: Scene03Solucion },
  { key: "p04_cotizador", Scene: Scene04Cotizador },
  { key: "p05_dietas", Scene: Scene05Dietas },
  { key: "p06_recetario", Scene: Scene06Recetario },
  { key: "p07_sala", Scene: Scene07Sala },
  { key: "p08_metricas", Scene: Scene08Metricas },
  { key: "p09_diferenciador", Scene: Scene09Diferenciador },
  { key: "p10_credibilidad", Scene: Scene10Credibilidad },
  { key: "p11_cta", Scene: Scene11CTA },
];

/**
 * Motion comic Queen's Bellybutton · 11 paneles, cortes duros entre
 * viñetas (lenguaje de cómic). Una sola composición sirve a los tres
 * formatos vía escalado del lienzo.
 */
export const VideoComic: React.FC = () => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / STAGE_W, height / STAGE_H);

  let from = 0;
  const sequences = SCENES.map(({ key, Scene }) => {
    const duration = SCENE_DURATIONS[key];
    const seq = (
      <Sequence key={key} from={from} durationInFrames={duration} name={key}>
        <Scene />
      </Sequence>
    );
    from += duration;
    return seq;
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 140% 110% at 50% 40%, ${colors.paper} 60%, ${colors.paperDark} 100%)`,
      }}
    >
      {/* Tramado de semitonos también en las bandas fuera del lienzo */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(22,19,13,0.07) 1.6px, transparent 1.6px)`,
          backgroundSize: "14px 14px",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: STAGE_W,
          height: STAGE_H,
          left: (width - STAGE_W * scale) / 2,
          top: (height - STAGE_H * scale) / 2,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {sequences}
      </div>
    </AbsoluteFill>
  );
};
