import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors, fonts } from "../theme";
import texts from "../texts/es.json";

const ListLine: React.FC<{ children: React.ReactNode; from: number }> = ({ children, from }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;
  const opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const x = interpolate(localFrame, [0, 12], [-20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, fontSize: 42, color: colors.text, fontFamily: fonts.ui, fontWeight: 500 }}>
      <span style={{ color: colors.danger, marginRight: 16, fontSize: 28 }}>✕</span>
      {children}
    </div>
  );
};

/** Escena 3 · Problema emerge (0:45–1:15) · 900 frames */
export const Scene03Problema: React.FC = () => {
  const t = texts.s03;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "center", paddingLeft: 100 }}>
        <PacoAvatar pose="thinking" size={280} animated={true} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-start", padding: 100, paddingRight: 130, paddingTop: 140 }}>
        {/* Headline grande */}
        <Sequence from={0} durationInFrames={210}>
          <KineticText size={72} family="display" weight={600} align="right" color={colors.gold} style={{ width: 1100 }}>
            {t.headline_part1}
          </KineticText>
        </Sequence>
        <Sequence from={90} durationInFrames={210}>
          <KineticText size={56} family="display" weight={500} align="right" color={colors.text} style={{ width: 1100, marginTop: 100 }}>
            {t.headline_part2}
          </KineticText>
        </Sequence>

        {/* Lista de horrores */}
        <div style={{ marginTop: 220, display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-end" }}>
          {t.list.map((item, i) => (
            <Sequence key={item} from={240 + i * 30} durationInFrames={900 - 240 - i * 30}>
              <ListLine from={240 + i * 30}>{item}</ListLine>
            </Sequence>
          ))}
        </div>

        {/* Chiste sushi */}
        <Sequence from={600} durationInFrames={300}>
          <KineticText size={40} family="ui" weight={500} align="right" color={colors.textSoft} style={{ marginTop: 480, width: 1100, fontStyle: "italic" }}>
            {t.joke1}
            <br />
            <span style={{ color: colors.gold, fontWeight: 700 }}>"{t.joke2}"</span>
          </KineticText>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
