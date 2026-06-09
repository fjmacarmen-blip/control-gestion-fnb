import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 4 · Oh crap moment (1:15–1:45) · 900 frames */
export const Scene04OhCrap: React.FC = () => {
  const t = texts.s04;
  return (
    <AbsoluteFill>
      <Background variant="split" />

      {/* Lado izquierdo */}
      <AbsoluteFill style={{ width: "50%", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <Sequence from={0} durationInFrames={400}>
          <KineticText size={54} family="display" weight={600} color={colors.text} align="center">
            {t.left1}
          </KineticText>
        </Sequence>
        <Sequence from={240} durationInFrames={400}>
          <div style={{ marginTop: 350 }}>
            <KineticText size={54} family="display" weight={600} color={colors.text} align="center">
              {t.left2}
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Lado derecho · números rojos grandes */}
      <AbsoluteFill style={{ left: "50%", width: "50%", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <Sequence from={150} durationInFrames={400}>
          <KineticText size={82} family="display" weight={700} color={colors.danger} align="center" spring>
            {t.right1}
          </KineticText>
        </Sequence>
        <Sequence from={390} durationInFrames={400}>
          <div style={{ marginTop: 350 }}>
            <KineticText size={82} family="display" weight={700} color={colors.danger} align="center" spring>
              {t.right2}
            </KineticText>
          </div>
        </Sequence>

        {/* Avatar preocupado en esquina */}
        <div style={{ position: "absolute", bottom: 60, right: 80 }}>
          <Sequence from={60}>
            <PacoAvatar pose="worried" size={220} />
          </Sequence>
        </div>
      </AbsoluteFill>

      {/* Cierre · centrado a pantalla completa */}
      <Sequence from={510} durationInFrames={390}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `${colors.bg}f0` }}>
          <KineticText size={64} family="display" weight={500} color={colors.text} align="center" style={{ maxWidth: 1500, lineHeight: 1.3 }}>
            {t.closing1}
            <br />
            {t.closing2}
          </KineticText>
          <div style={{ marginTop: 60 }}>
            <KineticText size={56} family="display" weight={600} color={colors.gold} align="center" from={30}>
              {t.closing3}
            </KineticText>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
