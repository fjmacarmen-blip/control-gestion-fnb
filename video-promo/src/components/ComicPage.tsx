import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme";
import { Watermark } from "./Watermark";

interface Props {
  children?: React.ReactNode;
  /** Marca de agua QBB en la esquina (default true) */
  watermark?: boolean;
}

/**
 * Página de cómic · papel crema envejecido con tramado de semitonos
 * y marca de agua del isotipo QBB. Envuelve cada escena/panel.
 */
export const ComicPage: React.FC<Props> = ({ children, watermark = true }) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 140% 110% at 50% 40%, ${colors.paper} 60%, ${colors.paperDark} 100%)`,
      }}
    >
      {/* Tramado de semitonos sobre el papel */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(22,19,13,0.07) 1.6px, transparent 1.6px)`,
          backgroundSize: "14px 14px",
        }}
      />
      {children}
      {watermark && <Watermark />}
    </AbsoluteFill>
  );
};
