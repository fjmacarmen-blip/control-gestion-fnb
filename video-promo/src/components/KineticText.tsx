import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts, easings } from "../theme";

interface Props {
  children: React.ReactNode;
  /** Frame relativo donde empieza la animación (default 0) */
  from?: number;
  /** Duración del fade-in (frames) */
  fadeIn?: number;
  /** Frame relativo donde sale (default no sale) */
  fadeOutAt?: number;
  /** Tamaño del texto en px */
  size?: number;
  /** Color del texto */
  color?: string;
  /** Familia de fuente */
  family?: "display" | "ui" | "mono";
  /** Peso */
  weight?: number;
  /** Letter spacing */
  letterSpacing?: number;
  /** Alineación */
  align?: "left" | "center" | "right";
  /** Use spring scale-in en lugar de slide */
  spring?: boolean;
  /** Style override */
  style?: React.CSSProperties;
}

/**
 * Texto kinetic · fade-in + slide-up con bezier suave.
 * Se llama dentro de un <Sequence from={N}> que controla cuándo aparece.
 */
export const KineticText: React.FC<Props> = ({
  children,
  from = 0,
  fadeIn = 18,        // 0.6 seg a 30fps
  fadeOutAt,
  size = 64,
  color = colors.text,
  family = "ui",
  weight = 600,
  letterSpacing = -0.5,
  align = "center",
  spring: useSpring = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - from;

  // Fade-in
  let opacity = interpolate(localFrame, [0, fadeIn], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: easings.inOut,
  });

  // Fade-out opcional
  if (fadeOutAt !== undefined) {
    const fadeOutOpacity = interpolate(
      localFrame,
      [fadeOutAt, fadeOutAt + 15],
      [1, 0],
      {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
        easing: easings.inOut,
      }
    );
    opacity = Math.min(opacity, fadeOutOpacity);
  }

  // Slide-up clásico
  const translateY = interpolate(localFrame, [0, fadeIn], [22, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
    easing: easings.inOut,
  });

  // Spring scale-in (alternativa)
  const scale = useSpring
    ? spring({
        frame: localFrame,
        fps,
        config: { damping: 12, stiffness: 100, mass: 0.6 },
      })
    : 1;

  const fontFamily =
    family === "display" ? fonts.display : family === "mono" ? fonts.mono : fonts.ui;

  return (
    <div
      style={{
        opacity,
        transform: useSpring
          ? `scale(${scale})`
          : `translateY(${translateY}px)`,
        fontSize: size,
        color,
        fontFamily,
        fontWeight: weight,
        letterSpacing,
        textAlign: align,
        lineHeight: 1.15,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
