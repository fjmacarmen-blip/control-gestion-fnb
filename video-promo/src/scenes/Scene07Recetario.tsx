import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { DietPill } from "../components/DietPill";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 7 · Recetario + dietas (2:55–3:30) · 1050 frames */
export const Scene07Recetario: React.FC = () => {
  const t = texts.s07;
  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Imagen del recetario izquierda · texto kinetic derecha */}
      <AbsoluteFill style={{ padding: 80, display: "flex", flexDirection: "row", alignItems: "center", gap: 60 }}>
        <Sequence from={0} durationInFrames={1050}>
          <div style={{ width: 900, height: 880, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <KenBurnsImage src="assets/recetario-sidebar.png" duration={1050} pan="up" zoom={[1.05, 1.15]} />
          </div>
        </Sequence>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Sequence from={0} durationInFrames={200}>
            <KineticText size={68} family="display" weight={600} color={colors.gold} align="left">
              {t.line1}
            </KineticText>
          </Sequence>
          <Sequence from={120} durationInFrames={250}>
            <div style={{ marginTop: 100 }}>
              <KineticText size={48} family="ui" weight={500} color={colors.text} align="left">
                {t.line2}
              </KineticText>
            </div>
          </Sequence>
          <Sequence from={240} durationInFrames={200}>
            <div style={{ marginTop: 170 }}>
              <KineticText size={40} family="ui" weight={400} color={colors.textSoft} align="left">
                {t.line3}
              </KineticText>
            </div>
          </Sequence>

          {/* Pills de dietas cayendo en cascada */}
          <div style={{ marginTop: 250, display: "flex", flexDirection: "column", gap: 14 }}>
            {t.diets.map((d, i) => (
              <Sequence key={d.key} from={450 + i * 35} durationInFrames={1050 - 450 - i * 35}>
                <DietPill emoji={d.emoji} label={d.label} color={d.key as keyof typeof colors.diet} size={24} />
              </Sequence>
            ))}
          </div>

          <Sequence from={900} durationInFrames={150}>
            <div style={{ marginTop: 30 }}>
              <KineticText size={38} family="display" weight={600} color={colors.gold} align="left" style={{ fontStyle: "italic" }}>
                {t.closing}
              </KineticText>
            </div>
          </Sequence>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
