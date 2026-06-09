import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme";

type Pose = "thinking" | "worried" | "happy" | "waving";

interface Props {
  pose?: Pose;
  size?: number;
  /** Si true · respiración / movimiento sutil */
  animated?: boolean;
}

/**
 * Avatar cartoon de Paco · SVG dibujado a mano por código.
 * Hotelero 30 años · gafas redondas · pelo grisáceo · traje casual oscuro.
 * 4 poses para distintos momentos del vídeo.
 */
export const PacoAvatar: React.FC<Props> = ({
  pose = "thinking",
  size = 240,
  animated = true,
}) => {
  const frame = useCurrentFrame();

  // Respiración: movimiento vertical sutil ±2px @ 0.5 Hz
  const breathing = animated
    ? Math.sin(frame / 18) * 2
    : 0;

  // Brazo / mano según pose
  const handY = pose === "waving"
    ? interpolate(frame % 60, [0, 30, 60], [0, -15, 0])
    : 0;

  const eyeShape = pose === "happy" ? "happy" : "open";
  const mouthShape = pose === "happy" ? "smile" : pose === "worried" ? "frown" : "neutral";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      style={{ display: "block" }}
    >
      <g transform={`translate(0, ${breathing})`}>
        {/* Cuello */}
        <rect x="100" y="140" width="40" height="30" fill="#d4a373" rx="4" />

        {/* Camisa / traje · azul navy oscuro */}
        <path
          d="M 60 175 Q 60 165 75 165 L 100 165 Q 100 170 120 170 Q 140 170 140 165 L 165 165 Q 180 165 180 175 L 180 240 L 60 240 Z"
          fill={colors.bgElevated}
          stroke={colors.bgSurface}
          strokeWidth="2"
        />

        {/* Cuello camisa cream */}
        <path
          d="M 105 165 L 120 178 L 135 165"
          fill="none"
          stroke={colors.text}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Cara · tono cálido */}
        <ellipse cx="120" cy="105" rx="42" ry="48" fill="#e8c9a5" />

        {/* Pelo · grisáceo · línea de pelo retroceso natural 50+ */}
        <path
          d="M 80 80 Q 90 50 120 48 Q 150 50 160 80 L 160 95 Q 155 78 145 75 Q 130 72 120 76 Q 110 72 95 75 Q 85 78 80 95 Z"
          fill="#8a8580"
        />

        {/* Patillas */}
        <path d="M 82 95 Q 80 110 84 120" stroke="#8a8580" strokeWidth="3" fill="none" />
        <path d="M 158 95 Q 160 110 156 120" stroke="#8a8580" strokeWidth="3" fill="none" />

        {/* Gafas · marco redondo */}
        <circle cx="103" cy="106" r="13" fill="none" stroke="#2a2520" strokeWidth="2.5" />
        <circle cx="137" cy="106" r="13" fill="none" stroke="#2a2520" strokeWidth="2.5" />
        <line x1="116" y1="106" x2="124" y2="106" stroke="#2a2520" strokeWidth="2.5" />

        {/* Ojos */}
        {eyeShape === "open" ? (
          <>
            <circle cx="103" cy="106" r="2.5" fill="#2a2520" />
            <circle cx="137" cy="106" r="2.5" fill="#2a2520" />
          </>
        ) : (
          // happy: ojos arqueados ^
          <>
            <path d="M 98 108 Q 103 102 108 108" stroke="#2a2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 132 108 Q 137 102 142 108" stroke="#2a2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Nariz · línea sutil */}
        <path d="M 120 115 L 118 128 L 122 130" stroke="#c9a378" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Boca */}
        {mouthShape === "smile" && (
          <path d="M 108 140 Q 120 152 132 140" stroke="#2a2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {mouthShape === "neutral" && (
          <path d="M 110 142 Q 120 145 130 142" stroke="#2a2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {mouthShape === "frown" && (
          <path d="M 108 145 Q 120 138 132 145" stroke="#2a2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Mano (sólo si pose=waving) */}
        {pose === "waving" && (
          <g transform={`translate(60, ${190 + handY})`}>
            <circle cx="0" cy="0" r="14" fill="#e8c9a5" />
            <path
              d="M -8 -2 L -8 -12 M -3 -2 L -3 -14 M 2 -2 L 2 -14 M 7 -2 L 7 -10"
              stroke="#d4a373"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Cejas según pose */}
        {pose === "worried" && (
          <>
            <path d="M 93 92 Q 103 87 113 90" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 127 90 Q 137 87 147 92" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}
        {pose === "thinking" && (
          <>
            <path d="M 93 93 L 113 92" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 127 90 L 147 91" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}
        {(pose === "happy" || pose === "waving") && (
          <>
            <path d="M 93 94 Q 103 90 113 94" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 127 94 Q 137 90 147 94" stroke="#5a5550" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Gota de sudor (pose worried) */}
        {pose === "worried" && (
          <path
            d="M 160 100 Q 162 108 164 110 Q 162 112 158 110 Q 156 106 160 100 Z"
            fill={colors.info}
            opacity={0.85}
          />
        )}
      </g>
    </svg>
  );
};
