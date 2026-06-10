import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { SpeechBubble } from "../components/SpeechBubble";
import { Onomatopeya } from "../components/Onomatopeya";
import { colors, fonts } from "../theme";
import texts from "../texts/es.json";

const t = texts.p02_problema;

/** Tira de herramienta dispersa (Excel, Word…) que hace pop tachada. */
const ChaosItem: React.FC<{ label: string; from: number; top: number; rotate: number }> = ({
  label,
  from,
  top,
  rotate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 10, stiffness: 170, mass: 0.5 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 1090,
        top,
        background: "#ffffff",
        border: `5px solid ${colors.ink}`,
        boxShadow: `7px 7px 0 rgba(22,19,13,0.5)`,
        padding: "14px 28px",
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: 40,
        color: colors.ink,
        opacity: Math.min(1, pop * 1.5),
        transform: `rotate(${rotate}deg) scale(${0.4 + 0.6 * pop})`,
      }}
    >
      <span style={{ color: colors.comicRed, marginRight: 14 }}>✗</span>
      {label}
    </div>
  );
};

/**
 * Panel 2 · EL PROBLEMA (0:10–0:22)
 * Paco agobiado entre papeles; el caos de herramientas sueltas
 * hace pop a la derecha mientras suena el teléfono.
 */
export const Scene02Problema: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox from={5} size={36} style={{ left: 60, top: 50 }}>
        {t.caption}
      </CaptionBox>

      {/* Paco desbordado (pose agobio, alta resolución) */}
      <ComicPanel
        from={15}
        rotate={-1.5}
        style={{ left: 110, top: 200, width: 430, height: 800 }}
      >
        <Img
          src={staticFile("comic/paco-pose-agobio.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <SpeechBubble
        from={55}
        size={34}
        tail="bottom-left"
        style={{ left: 565, top: 140, maxWidth: 560 }}
      >
        {t.bubble}
      </SpeechBubble>

      <Onomatopeya
        word={t.onomatopeya}
        from={85}
        size={56}
        color={colors.comicBlue}
        starColor={colors.comicYellow}
        rotate={8}
        style={{ left: 1490, top: 80 }}
      />

      {t.items.map((label, i) => (
        <ChaosItem
          key={label}
          label={label}
          from={130 + i * 32}
          top={400 + i * 140}
          rotate={i % 2 === 0 ? -2 : 2}
        />
      ))}
    </ComicPage>
  );
};
