import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 2 · Personaje (0:15–0:45) · 900 frames @30fps */
export const Scene02Personaje: React.FC = () => {
  const t = texts.s02;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      {/* Avatar grande centrado arriba */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
        <PacoAvatar pose="thinking" size={300} />
      </AbsoluteFill>

      {/* Bloque texto centrado debajo */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 140, gap: 18 }}>
        <Sequence from={0} durationInFrames={150}>
          <KineticText size={68} family="display" weight={600} align="center" color={colors.text}>
            {t.name}
          </KineticText>
        </Sequence>

        <Sequence from={120} durationInFrames={150}>
          <KineticText size={44} family="ui" weight={500} align="center" color={colors.gold} style={{ marginTop: 90 }}>
            {t.role}
          </KineticText>
        </Sequence>

        <Sequence from={240} durationInFrames={120}>
          <KineticText size={36} family="ui" weight={400} align="center" color={colors.textSoft} style={{ marginTop: 160 }}>
            {t.place}
          </KineticText>
        </Sequence>

        <Sequence from={420} durationInFrames={480}>
          <KineticText size={42} family="ui" weight={400} align="center" color={colors.text} style={{ marginTop: 260, maxWidth: 1400, lineHeight: 1.4 }}>
            {t.bridge1}
            <br />
            {t.bridge2}
            <br />
            <span style={{ color: colors.gold, fontWeight: 600, fontSize: 56 }}>{t.punchline}</span>
          </KineticText>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
