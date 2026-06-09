import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 10 · Diferenciador + Aha (4:30–5:00) · 900 frames */
export const Scene10Diferenciador: React.FC = () => {
  const t = texts.s10;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      {/* Avatar happy en el centro */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PacoAvatar pose="happy" size={300} />
      </AbsoluteFill>

      {/* Bullets que aparecen alrededor (orbitan) */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 80, gap: 20 }}>
        <Sequence from={0} durationInFrames={200}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center">
            {t.line1}
          </KineticText>
        </Sequence>
        <Sequence from={120} durationInFrames={250}>
          <div style={{ marginTop: 70 }}>
            <KineticText size={64} family="display" weight={700} color={colors.gold} align="center">
              {t.line2}
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Bullets abajo */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 80, gap: 14 }}>
        <Sequence from={300} durationInFrames={200}>
          <KineticText size={36} family="ui" weight={500} color={colors.text} align="center">
            🔐 {t.line3}
          </KineticText>
        </Sequence>
        <Sequence from={400} durationInFrames={200}>
          <div style={{ marginTop: 60 }}>
            <KineticText size={36} family="ui" weight={500} color={colors.text} align="center">
              💾 {t.line4}
            </KineticText>
          </div>
        </Sequence>
        <Sequence from={500} durationInFrames={200}>
          <div style={{ marginTop: 120 }}>
            <KineticText size={36} family="ui" weight={500} color={colors.text} align="center">
              🌐 {t.line5}
            </KineticText>
          </div>
        </Sequence>
        <Sequence from={600} durationInFrames={300}>
          <div style={{ marginTop: 180 }}>
            <KineticText size={40} family="display" weight={600} color={colors.gold} align="center">
              {t.line6}
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
