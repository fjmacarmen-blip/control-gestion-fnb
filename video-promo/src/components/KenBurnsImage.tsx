import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";

interface Props {
  src: string; // ruta dentro de public/
  /** Duración total de la escena en frames (para escalar el zoom) */
  duration: number;
  /** Zoom inicial → final */
  zoom?: [number, number]; // default [1, 1.08]
  /** Pan dirección */
  pan?: "left" | "right" | "up" | "down" | "none";
  /** Opacidad inicial */
  fadeIn?: number;
  style?: React.CSSProperties;
}

/**
 * Imagen con efecto Ken Burns (zoom + pan lento) durante toda la escena.
 * Aporta vida a las capturas estáticas del producto.
 */
export const KenBurnsImage: React.FC<Props> = ({
  src,
  duration,
  zoom = [1, 1.08],
  pan = "right",
  fadeIn = 15,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, duration], zoom, {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, fadeIn], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pan
  let tx = 0, ty = 0;
  const panDistance = 30; // px
  if (pan === "left")  tx = interpolate(frame, [0, duration], [panDistance, -panDistance]);
  if (pan === "right") tx = interpolate(frame, [0, duration], [-panDistance, panDistance]);
  if (pan === "up")    ty = interpolate(frame, [0, duration], [panDistance, -panDistance]);
  if (pan === "down")  ty = interpolate(frame, [0, duration], [-panDistance, panDistance]);

  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
        opacity,
        ...style,
      }}
    />
  );
};
