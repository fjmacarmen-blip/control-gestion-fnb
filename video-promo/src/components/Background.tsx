import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme";

interface Props {
  variant?: "navy" | "navyGradient" | "split";
  children?: React.ReactNode;
}

/**
 * Fondo común · navy corporativo con gradiente sutil de oro en esquina.
 * Variantes: "navy" plano, "navyGradient" con radial gold, "split" mitad navy / mitad oscura.
 */
export const Background: React.FC<Props> = ({ variant = "navyGradient", children }) => {
  const styles: React.CSSProperties =
    variant === "navy"
      ? { backgroundColor: colors.bg }
      : variant === "split"
      ? {
          background: `linear-gradient(90deg, ${colors.bg} 0%, ${colors.bg} 50%, #050b1a 50%, #050b1a 100%)`,
        }
      : {
          background: `radial-gradient(ellipse 1200px 800px at 100% 0%, ${colors.gold}22, transparent 55%),
                       radial-gradient(ellipse 1000px 700px at 0% 100%, ${colors.goldDeep}25, transparent 60%),
                       ${colors.bg}`,
        };

  return <AbsoluteFill style={styles}>{children}</AbsoluteFill>;
};
