import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 9 · Métricas + superadmin (4:05–4:30) · 750 frames */
export const Scene09Metricas: React.FC = () => {
  const t = texts.s09;
  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Mockup del panel superadmin (verde) · captura real */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
        <Sequence from={0} durationInFrames={750}>
          <div style={{ width: 1500, height: 800, borderRadius: 18, overflow: "hidden", boxShadow: `0 30px 80px ${colors.greenBright}33`, border: `2px solid ${colors.greenBright}55` }}>
            <KenBurnsImage src="assets/superadmin-authgate.png" duration={750} pan="right" zoom={[1.02, 1.1]} />
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Texto overlay arriba */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 50, gap: 14 }}>
        <Sequence from={0} durationInFrames={180}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "12px 32px", borderRadius: 10 }}>
            {t.line1}
          </KineticText>
        </Sequence>
        <Sequence from={150} durationInFrames={180}>
          <div style={{ marginTop: 80 }}>
            <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "12px 32px", borderRadius: 10 }}>
              {t.line2}
            </KineticText>
          </div>
        </Sequence>
        <Sequence from={300} durationInFrames={250}>
          <div style={{ marginTop: 160 }}>
            <KineticText size={48} family="display" weight={500} color={colors.greenBright} align="center" style={{ background: `${colors.bg}cc`, padding: "12px 32px", borderRadius: 10 }}>
              {t.line3}
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Cierre abajo */}
      <Sequence from={500} durationInFrames={250}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 80 }}>
          <KineticText size={56} family="display" weight={600} color={colors.gold} align="center" style={{ background: `${colors.bg}ee`, padding: "20px 60px", borderRadius: 12 }}>
            {t.closing}
          </KineticText>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
