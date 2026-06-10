import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { colors, fonts, easings } from "../theme";
import texts from "../texts/es.json";

const t = texts.p10_credibilidad;

/**
 * Panel 10 · CREDIBILIDAD (1:54–2:02) · breve a propósito.
 * Paco ante el skyline: 30 años de oficio detrás del producto,
 * sin convertir el vídeo en un currículum.
 */
export const Scene10Credibilidad: React.FC = () => {
  const frame = useCurrentFrame();

  const firmaOpacity = interpolate(frame, [120, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  return (
    <ComicPage>
      {/* Paco ante la ciudad */}
      <ComicPanel
        from={8}
        rotate={-1}
        style={{ left: 200, top: 220, width: 440, height: 622 }}
      >
        <Img
          src={staticFile("comic/paco-pose-ciudad.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <CaptionBox from={35} size={42} style={{ left: 760, top: 290 }}>
        {t.caption}
      </CaptionBox>

      <CaptionBox from={75} size={38} bg="#ffffff" style={{ left: 810, top: 440 }}>
        {t.text}
      </CaptionBox>

      {/* Firma */}
      <div
        style={{
          position: "absolute",
          left: 830,
          top: 600,
          fontFamily: fonts.body,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 30,
          color: colors.ink,
          opacity: firmaOpacity,
        }}
      >
        — {t.firma}
      </div>
    </ComicPage>
  );
};
