import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  children: React.ReactNode;
  /** Frame local de entrada */
  from?: number;
  /** Tamaño de fuente (default 36) */
  size?: number;
  /** Lado del rabillo */
  tail?: "bottom-left" | "bottom-right" | "none";
  style?: React.CSSProperties;
}

/**
 * Bocadillo de diálogo · globo blanco con borde de tinta y rabillo,
 * entra con pop de spring.
 */
export const SpeechBubble: React.FC<Props> = ({
  children,
  from = 0,
  size = 36,
  tail = "bottom-left",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.5 },
  });

  const tailBase: React.CSSProperties = {
    position: "absolute",
    bottom: -24,
    width: 0,
    height: 0,
    borderLeft: "16px solid transparent",
    borderRight: "16px solid transparent",
    borderTop: `30px solid ${colors.ink}`,
  };
  const tailInner: React.CSSProperties = {
    position: "absolute",
    bottom: -14,
    width: 0,
    height: 0,
    borderLeft: "11px solid transparent",
    borderRight: "11px solid transparent",
    borderTop: "24px solid #ffffff",
  };

  return (
    <div
      style={{
        position: "absolute",
        background: "#ffffff",
        color: colors.ink,
        border: `5px solid ${colors.ink}`,
        borderRadius: 28,
        padding: `${size * 0.5}px ${size * 0.85}px`,
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.25,
        textAlign: "center",
        opacity: Math.min(1, pop * 1.5),
        transform: `scale(${0.5 + 0.5 * pop})`,
        maxWidth: "40%",
        ...style,
      }}
    >
      {children}
      {tail === "bottom-left" && (
        <>
          <div style={{ ...tailBase, left: 48 }} />
          <div style={{ ...tailInner, left: 53 }} />
        </>
      )}
      {tail === "bottom-right" && (
        <>
          <div style={{ ...tailBase, right: 48 }} />
          <div style={{ ...tailInner, right: 53 }} />
        </>
      )}
    </div>
  );
};
