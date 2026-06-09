import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 11 · CTA cierre (5:00–5:30) · 900 frames */
export const Scene11CTA: React.FC = () => {
  const t = texts.s11;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      {/* Promesa grande arriba */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 120 }}>
        <Sequence from={0} durationInFrames={900}>
          <KineticText size={72} family="display" weight={600} color={colors.gold} align="center" spring style={{ maxWidth: 1500 }}>
            {t.promise}
          </KineticText>
        </Sequence>
      </AbsoluteFill>

      {/* Avatar saludando en el centro */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Sequence from={100} durationInFrames={800}>
          <PacoAvatar pose="waving" size={340} />
        </Sequence>
      </AbsoluteFill>

      {/* URL + contacto + footer · abajo */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 80, gap: 16 }}>
        <Sequence from={200} durationInFrames={700}>
          <KineticText size={38} family="mono" weight={500} color={colors.text} align="center" letterSpacing={1}>
            {t.url}
          </KineticText>
        </Sequence>
        <Sequence from={300} durationInFrames={600}>
          <div style={{ marginTop: 60 }}>
            <KineticText size={32} family="ui" weight={500} color={colors.textSoft} align="center">
              {t.contact}
            </KineticText>
          </div>
        </Sequence>
        <Sequence from={600} durationInFrames={300}>
          <div style={{ marginTop: 140 }}>
            <KineticText size={22} family="mono" weight={400} color={colors.textMuted} align="center" letterSpacing={2}>
              {t.footer}
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
