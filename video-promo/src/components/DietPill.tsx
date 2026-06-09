import React from "react";
import { fonts, colors } from "../theme";

interface Props {
  emoji: string;
  label: string;
  color: keyof typeof colors.diet;
  size?: number;
}

export const DietPill: React.FC<Props> = ({ emoji, label, color, size = 32 }) => {
  const c = colors.diet[color];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: `${size * 0.3}px ${size * 0.7}px`,
        borderRadius: 999,
        background: `${c}22`,
        border: `2px solid ${c}66`,
        color: c,
        fontFamily: fonts.ui,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: 0.5,
      }}
    >
      <span style={{ fontSize: size * 1.1 }}>{emoji}</span>
      <span>{label}</span>
    </div>
  );
};
