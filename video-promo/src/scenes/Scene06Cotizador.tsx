import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { colors } from "../theme";
import texts from "../texts/es.json";

/** Escena 6 · Demo cotizador (2:15–2:55) · 1200 frames */
export const Scene06Cotizador: React.FC = () => {
  const t = texts.s06;
  const DURATION = 1200;
  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Mockup del cotizador navegando por pasos */}
      <AbsoluteFill style={{ padding: 80, alignItems: "center", justifyContent: "center" }}>
        <Sequence from={0} durationInFrames={300}>
          <div style={{ width: 1500, height: 850, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <KenBurnsImage src="assets/cotizador-step-1.png" duration={300} pan="right" />
          </div>
        </Sequence>
        <Sequence from={300} durationInFrames={300}>
          <div style={{ width: 1500, height: 850, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <KenBurnsImage src="assets/cotizador-step-2-menu.png" duration={300} pan="left" />
          </div>
        </Sequence>
        <Sequence from={600} durationInFrames={400}>
          <div style={{ width: 1500, height: 850, borderRadius: 18, overflow: "hidden", boxShadow: `0 30px 80px ${colors.diet.vegano}44` }}>
            <KenBurnsImage src="assets/cotizador-step-2-5-dietas.png" duration={400} pan="up" />
          </div>
        </Sequence>
      </AbsoluteFill>

      {/* Texto overlay */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 50 }}>
        <Sequence from={0} durationInFrames={120}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "16px 40px", borderRadius: 12 }}>
            {t.intro}
          </KineticText>
        </Sequence>
        <Sequence from={120} durationInFrames={120}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "16px 40px", borderRadius: 12 }}>
            {t.step1}
          </KineticText>
        </Sequence>
        <Sequence from={300} durationInFrames={150}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "16px 40px", borderRadius: 12 }}>
            {t.step2}
          </KineticText>
        </Sequence>
        <Sequence from={600} durationInFrames={150}>
          <KineticText size={48} family="display" weight={500} color={colors.text} align="center" style={{ background: `${colors.bg}cc`, padding: "16px 40px", borderRadius: 12, maxWidth: 1400 }}>
            Marca dietas especiales con menús <span style={{ color: colors.gold }}>{t.highlight}</span>.
          </KineticText>
        </Sequence>
      </AbsoluteFill>

      {/* Antes / Ahora cierre */}
      <Sequence from={1000} durationInFrames={DURATION - 1000}>
        <AbsoluteFill style={{ background: `${colors.bg}f0`, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "row", gap: 100 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <KineticText size={28} family="mono" weight={500} color={colors.textMuted} letterSpacing={3}>
              {t.before_label}
            </KineticText>
            <div style={{ marginTop: 24 }}>
              <KineticText size={56} family="display" weight={600} color={colors.danger}>
                {t.before_value}
              </KineticText>
            </div>
          </div>
          <div style={{ fontSize: 64, color: colors.gold }}>→</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <KineticText size={28} family="mono" weight={500} color={colors.textMuted} letterSpacing={3}>
              {t.after_label}
            </KineticText>
            <div style={{ marginTop: 24 }}>
              <KineticText size={56} family="display" weight={600} color={colors.success}>
                {t.after_value}
              </KineticText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
