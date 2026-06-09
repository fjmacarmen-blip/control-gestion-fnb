import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 1 · Cold open (0:00–0:15) · 450 frames @30fps */
export const Scene01ColdOpen: React.FC = () => {
  const t = texts.s01;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      {/* Avatar Paco a la izquierda */}
      <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "center", paddingLeft: 120 }}>
        <PacoAvatar pose="thinking" size={360} />
      </AbsoluteFill>

      {/* Texto kinetic a la derecha */}
      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "center", paddingRight: 140, gap: 24 }}>
        <Sequence from={0} durationInFrames={90}>
          <KineticText size={88} family="display" weight={500} align="right" style={{ width: 900 }}>
            {t.line1}
          </KineticText>
        </Sequence>

        <Sequence from={60} durationInFrames={150}>
          <KineticText size={88} family="display" weight={500} align="right" color={colors.gold} style={{ width: 900, marginTop: 110 }}>
            {t.line2}
          </KineticText>
        </Sequence>

        <Sequence from={270} durationInFrames={180}>
          <KineticText size={56} family="ui" weight={400} align="right" color={colors.textSoft} style={{ width: 1100, marginTop: 250 }}>
            {t.line3}
            <br />
            {t.line4_part1}
            <br />
            <span style={{ color: colors.gold, fontWeight: 600 }}>{t.line4_part2}</span>
          </KineticText>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
