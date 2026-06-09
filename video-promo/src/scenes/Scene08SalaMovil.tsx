import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { PacoAvatar } from "../components/PacoAvatar";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 8 · Sala móvil + Frame Aha (3:30–4:05) · 1050 frames */
export const Scene08SalaMovil: React.FC = () => {
  const t = texts.s08;
  return (
    <AbsoluteFill>
      <Background variant="navyGradient" />

      {/* Mockup iPhone con sala-movil */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingLeft: 200 }}>
        <Sequence from={0} durationInFrames={1050}>
          <div style={{
            width: 360, height: 720,
            borderRadius: 50,
            border: `12px solid ${colors.bgElevated}`,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            background: colors.bg,
          }}>
            <KenBurnsImage src="assets/sala-movil-hoy.png" duration={1050} pan="up" zoom={[1.0, 1.05]} />
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Avatar Paco aha en esquina */}
      <div style={{ position: "absolute", left: 60, top: 60 }}>
        <Sequence from={0}>
          <PacoAvatar pose="happy" size={220} />
        </Sequence>
      </div>

      {/* Texto a la derecha */}
      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "center", paddingRight: 120, paddingLeft: 800 }}>
        <Sequence from={0} durationInFrames={300}>
          <KineticText size={42} family="ui" weight={500} color={colors.textSoft} align="left" style={{ width: 700 }}>
            {t.intro}
          </KineticText>
        </Sequence>

        <div style={{ marginTop: 100, display: "flex", flexDirection: "column", gap: 18 }}>
          {t.items.map((item, i) => (
            <Sequence key={item} from={150 + i * 60} durationInFrames={900}>
              <KineticText size={52} family="display" weight={600} color={colors.gold} align="left">
                · {item}
              </KineticText>
            </Sequence>
          ))}
        </div>

        <Sequence from={600} durationInFrames={450}>
          <div style={{ marginTop: 200, padding: "30px 40px", borderLeft: `4px solid ${colors.gold}`, background: `${colors.bgSurface}` }}>
            <KineticText size={36} family="ui" weight={400} color={colors.text} align="left" style={{ fontStyle: "italic" }}>
              {t.quote1}
              <br />
              {t.quote2}
              <br />
              <span style={{ fontWeight: 600 }}>{t.quote3}</span>
            </KineticText>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
