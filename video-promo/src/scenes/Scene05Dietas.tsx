import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { DietPill } from "../components/DietPill";
import { colors, fonts, SCENE_DURATIONS } from "../theme";
import texts from "../texts/es.json";

const t = texts.p05_dietas;
const DUR = SCENE_DURATIONS.p05_dietas;

/** Pill de dieta con pop de spring en posición absoluta. */
const PoppingPill: React.FC<{
  emoji: string;
  label: string;
  colorKey: keyof typeof colors.diet;
  from: number;
  left: number;
  top: number;
}> = ({ emoji, label, colorKey, from, left, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.45 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        opacity: Math.min(1, pop * 1.5),
        transform: `scale(${0.4 + 0.6 * pop})`,
      }}
    >
      <DietPill emoji={emoji} label={label} color={colorKey} size={26} />
    </div>
  );
};

/**
 * Panel 5 · MENÚS ESPECIALES (0:49–1:02)
 * Captura del paso 2.5 de dietas + las 8 pills del sistema
 * transversal haciendo pop una a una.
 */
export const Scene05Dietas: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox
        from={5}
        size={48}
        bg={colors.comicRed}
        color="#ffffff"
        style={{ left: 60, top: 45, fontFamily: fonts.display, letterSpacing: 2 }}
      >
        {t.caption}
      </CaptionBox>

      {/* Captura: paso 2.5 de menús especiales del cotizador */}
      <ComicPanel
        from={15}
        rotate={-1}
        style={{ left: 80, top: 220, width: 1020, height: 477 }}
      >
        <KenBurnsImage
          src="assets/cotizador-step-2-5-dietas.png"
          duration={DUR}
          zoom={[1, 1.08]}
          pan="down"
        />
      </ComicPanel>

      <CaptionBox from={60} size={32} bg="#ffffff" style={{ left: 120, top: 760 }}>
        {t.text}
      </CaptionBox>

      {/* Las 8 dietas, en dos columnas */}
      {t.diets.map((d, i) => (
        <PoppingPill
          key={d.key}
          emoji={d.emoji}
          label={d.label}
          colorKey={d.key as keyof typeof colors.diet}
          from={80 + i * 18}
          left={i % 2 === 0 ? 1170 : 1540}
          top={230 + Math.floor(i / 2) * 105}
        />
      ))}

      <CaptionBox
        from={280}
        size={28}
        bg={colors.comicBlue}
        color="#ffffff"
        style={{ left: 1160, top: 700, width: 640, maxWidth: 640 }}
      >
        {t.closing}
      </CaptionBox>
    </ComicPage>
  );
};
