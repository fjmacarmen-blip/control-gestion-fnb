import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 5 · Solución aparece (1:45–2:15) · 900 frames */
export const Scene05Solucion: React.FC = () => {
  const t = texts.s05;
  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Logo placeholder (text-based porque no podemos garantizar el SVG cargado) */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Sequence from={20} durationInFrames={400}>
          <div style={{
            width: 220, height: 220,
            borderRadius: 50,
            background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldDeep} 100%)`,
            display: "grid", placeItems: "center",
            fontSize: 120,
            boxShadow: `0 0 80px ${colors.gold}44`,
          }}>
            👑
          </div>
        </Sequence>

        <div style={{ marginTop: 320 }}>
          <Sequence from={120} durationInFrames={780}>
            <KineticText size={84} family="display" weight={600} color={colors.text} align="center" spring>
              {t.brand}
            </KineticText>
          </Sequence>
        </div>

        <div style={{ marginTop: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Sequence from={240} durationInFrames={660}>
            <KineticText size={44} family="ui" weight={400} color={colors.textSoft} align="center">
              {t.tagline1}
            </KineticText>
          </Sequence>
          <Sequence from={300} durationInFrames={600}>
            <div style={{ marginTop: 70 }}>
              <KineticText size={44} family="ui" weight={400} color={colors.textSoft} align="center">
                {t.tagline2}
              </KineticText>
            </div>
          </Sequence>
          <Sequence from={360} durationInFrames={540}>
            <div style={{ marginTop: 140 }}>
              <KineticText size={48} family="ui" weight={600} color={colors.gold} align="center">
                {t.tagline3}
              </KineticText>
            </div>
          </Sequence>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
