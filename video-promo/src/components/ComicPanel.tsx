import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors } from "../theme";

interface Props {
  children?: React.ReactNode;
  /** Frame local en el que la viñeta hace pop-in */
  from?: number;
  /** Rotación en grados (toque hecho-a-mano) */
  rotate?: number;
  /** Color de fondo interior */
  bg?: string;
  /** Posición y tamaño (left/top/width/height en % o px) */
  style?: React.CSSProperties;
  /** Padding interior (default 0, las imágenes llenan el marco) */
  padding?: number;
}

/**
 * Viñeta de cómic · marco de tinta grueso, sombra dura desplazada
 * y pop-in con spring. Posicionar con style (position absolute).
 */
export const ComicPanel: React.FC<Props> = ({
  children,
  from = 0,
  rotate = 0,
  bg = colors.paper,
  style = {},
  padding = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });

  return (
    <div
      style={{
        position: "absolute",
        border: `6px solid ${colors.ink}`,
        boxShadow: `10px 10px 0 rgba(22,19,13,0.55)`,
        background: bg,
        overflow: "hidden",
        padding,
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${0.7 + 0.3 * pop})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
