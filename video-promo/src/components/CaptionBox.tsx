import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors, fonts, easings } from "../theme";

interface Props {
  children: React.ReactNode;
  /** Frame local de entrada */
  from?: number;
  /** Tamaño de fuente (default 38) */
  size?: number;
  /** Fondo (default amarillo narrador clásico) */
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Cajetín de narrador · rectángulo amarillo con borde de tinta
 * y ligera inclinación, entra deslizándose.
 */
export const CaptionBox: React.FC<Props> = ({
  children,
  from = 0,
  size = 38,
  bg = colors.comicYellow,
  color = colors.ink,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const local = frame - from;

  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  const tx = interpolate(local, [0, 12], [-40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  return (
    <div
      style={{
        position: "absolute",
        background: bg,
        color,
        border: `5px solid ${colors.ink}`,
        boxShadow: `7px 7px 0 rgba(22,19,13,0.5)`,
        padding: `${size * 0.4}px ${size * 0.8}px`,
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.25,
        transform: `translateX(${tx}px) rotate(-1.2deg)`,
        opacity,
        maxWidth: "44%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
