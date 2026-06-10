import React from "react";
import { Img, staticFile } from "remotion";

interface Props {
  /** Tamaño en px (default 110) */
  size?: number;
  opacity?: number;
}

/**
 * Marca de agua · isotipo QBB exacto, semitransparente,
 * fija en la esquina inferior derecha de cada página.
 */
export const Watermark: React.FC<Props> = ({ size = 110, opacity = 0.4 }) => {
  return (
    <Img
      src={staticFile("comic/qbb-isotipo-transparent.png")}
      style={{
        position: "absolute",
        right: 34,
        bottom: 30,
        width: size,
        height: size,
        objectFit: "contain",
        opacity,
      }}
    />
  );
};
