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
import { CaptionBox } from "../components/CaptionBox";
import { SpeechBubble } from "../components/SpeechBubble";
import { colors, fonts, easings } from "../theme";
import texts from "../texts/es.json";

const t = texts.p11_cta;

/**
 * Panel 11 · CTA (2:02–2:18)
 * Cierre: logo QBB exacto, invitación a la demo, URL y contacto.
 */
export const Scene11CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoPop = spring({
    frame: frame - 25,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.8 },
  });

  const fadeAt = (from: number) =>
    interpolate(frame, [from, from + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });

  return (
    <ComicPage watermark={false}>
      {/* Logo QBB exacto */}
      <Img
        src={staticFile("comic/qbb-logo-hero.png")}
        style={{
          position: "absolute",
          left: 140,
          top: 90,
          width: 380,
          filter: "drop-shadow(10px 10px 0 rgba(22,19,13,0.45))",
          opacity: Math.min(1, logoPop * 1.4),
          transform: `scale(${0.6 + 0.4 * logoPop})`,
        }}
      />

      {/* Paco señalando, a página completa */}
      <ComicPanel
        from={15}
        rotate={1}
        style={{ left: 1540, top: 100, width: 280, height: 916 }}
      >
        <Img
          src={staticFile("comic/paco-pose-senala.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <SpeechBubble
        from={50}
        size={40}
        tail="bottom-right"
        style={{ left: 1010, top: 140, maxWidth: 480 }}
      >
        {t.bubble}
      </SpeechBubble>

      <CaptionBox from={130} size={36} style={{ left: 620, top: 430 }}>
        {t.promise}
      </CaptionBox>

      {/* URL del producto */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 660,
          background: "#ffffff",
          border: `5px solid ${colors.ink}`,
          boxShadow: `8px 8px 0 rgba(22,19,13,0.5)`,
          padding: "18px 30px",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 30,
          color: colors.comicBlue,
          opacity: fadeAt(200),
        }}
      >
        {t.url}
      </div>

      <div
        style={{
          position: "absolute",
          left: 145,
          top: 790,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 30,
          color: colors.ink,
          opacity: fadeAt(280),
        }}
      >
        {t.contact}
      </div>

      {/* Footer editorial */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1005,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 22,
          color: "rgba(22,19,13,0.65)",
          opacity: fadeAt(350),
        }}
      >
        {t.footer}
      </div>
    </ComicPage>
  );
};
