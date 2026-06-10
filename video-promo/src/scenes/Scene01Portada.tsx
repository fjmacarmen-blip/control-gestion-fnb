import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { Onomatopeya } from "../components/Onomatopeya";
import { colors, fonts, easings } from "../theme";
import texts from "../texts/es.json";

const t = texts.p01_portada;

/**
 * Panel 1 · PORTADA (0:00–0:10)
 * Portada de cómic clásica: kicker editorial, logo QBB exacto a gran
 * tamaño, sello de número/fecha y burst de precio "0 €/mes".
 */
export const Scene01Portada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickerY = interpolate(frame, [8, 22], [-90, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const logoPop = spring({
    frame: frame - 20,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.8 },
  });

  const subOpacity = interpolate(frame, [70, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const issuePop = spring({
    frame: frame - 12,
    fps,
    config: { damping: 10, stiffness: 160, mass: 0.5 },
  });

  return (
    <ComicPage watermark={false}>
      {/* Kicker editorial estilo "PRESENTANDO…" */}
      <div
        style={{
          position: "absolute",
          top: 42,
          left: "50%",
          transform: `translateX(-50%) translateY(${kickerY}px)`,
          background: colors.comicRed,
          color: "#ffffff",
          border: `5px solid ${colors.ink}`,
          boxShadow: `7px 7px 0 rgba(22,19,13,0.5)`,
          padding: "12px 36px",
          fontFamily: fonts.display,
          fontSize: 38,
          letterSpacing: 2,
          whiteSpace: "nowrap",
        }}
      >
        {t.kicker}
      </div>

      {/* Sello de número y fecha */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 150,
          background: "#ffffff",
          border: `4px solid ${colors.ink}`,
          padding: "10px 18px",
          fontFamily: fonts.display,
          fontSize: 26,
          color: colors.ink,
          transform: `rotate(-4deg) scale(${0.4 + 0.6 * issuePop})`,
          opacity: Math.min(1, issuePop * 1.5),
        }}
      >
        {t.issue}
      </div>

      {/* Logo QBB exacto, protagonista de la portada */}
      <Img
        src={staticFile("comic/qbb-logo-hero.png")}
        style={{
          position: "absolute",
          left: 300,
          top: 200,
          width: 560,
          filter: "drop-shadow(12px 12px 0 rgba(22,19,13,0.45))",
          opacity: Math.min(1, logoPop * 1.4),
          transform: `scale(${0.6 + 0.4 * logoPop})`,
        }}
      />

      {/* Subtítulo de claim */}
      <div
        style={{
          position: "absolute",
          left: 920,
          top: 430,
          width: 480,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.3,
          color: colors.ink,
          opacity: subOpacity,
        }}
      >
        {t.subtitle}
      </div>

      {/* Burst de precio estilo "12¢" de los cómics clásicos */}
      <Onomatopeya
        word={t.price}
        from={110}
        size={44}
        color={colors.comicRed}
        starColor={colors.comicYellow}
        rotate={9}
        style={{ left: 950, top: 660 }}
      />

      {/* Personaje presentador a página completa, lado derecho */}
      <ComicPanel
        from={40}
        rotate={1.2}
        style={{ left: 1480, top: 70, width: 290, height: 950 }}
      >
        <Img
          src={staticFile("comic/paco-pose-senala.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>
    </ComicPage>
  );
};
