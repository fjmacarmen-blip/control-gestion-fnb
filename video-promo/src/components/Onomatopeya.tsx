import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  /** Palabra de impacto, p.ej. "¡ZAS!" */
  word: string;
  /** Frame local de entrada */
  from?: number;
  /** Tamaño de fuente (default 72) */
  size?: number;
  color?: string;
  starColor?: string;
  rotate?: number;
  style?: React.CSSProperties;
}

/** Estrella de impacto de 12 puntas generada en SVG. */
const Star: React.FC<{ fill: string }> = ({ fill }) => {
  const points: string[] = [];
  const spikes = 12;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 100 : 56;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    points.push(`${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`);
  }
  return (
    <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0 }}>
      <polygon
        points={points.join(" ")}
        fill={fill}
        stroke={colors.ink}
        strokeWidth={5}
      />
    </svg>
  );
};

/**
 * Onomatopeya cómic · estrella de impacto + palabra en Bangers,
 * pop de spring con rotación.
 */
export const Onomatopeya: React.FC<Props> = ({
  word,
  from = 0,
  size = 72,
  color = colors.comicRed,
  starColor = colors.comicYellow,
  rotate = -8,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 9, stiffness: 190, mass: 0.5 },
  });

  const box = size * 3.4;

  return (
    <div
      style={{
        position: "absolute",
        width: box,
        height: box,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(1, pop * 1.6),
        transform: `rotate(${rotate}deg) scale(${0.3 + 0.7 * pop})`,
        ...style,
      }}
    >
      <Star fill={starColor} />
      <span
        style={{
          position: "relative",
          fontFamily: fonts.display,
          fontSize: size,
          color,
          WebkitTextStroke: `2.5px ${colors.ink}`,
          textShadow: `4px 4px 0 ${colors.ink}`,
          letterSpacing: 2,
        }}
      >
        {word}
      </span>
    </div>
  );
};
