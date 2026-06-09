import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { sec } from "../theme";
import { Scene01ColdOpen } from "../scenes/Scene01ColdOpen";
import { Scene05Solucion } from "../scenes/Scene05Solucion";
import { Scene06Cotizador } from "../scenes/Scene06Cotizador";
import { Scene11CTA } from "../scenes/Scene11CTA";

/**
 * Teaser · 90 segundos · resumen reducido para WhatsApp / preview
 * Mezcla: hook (s01) + solución (s05) + demo cotizador rápido + CTA.
 * Total: 90 seg = 2700 frames @ 30fps
 */
export const VideoPromoTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a1733" }}>
      {/* Hook 15s */}
      <Sequence from={0} durationInFrames={sec(15)}>
        <Scene01ColdOpen />
      </Sequence>

      {/* Solución 20s (reducida) */}
      <Sequence from={sec(15)} durationInFrames={sec(20)}>
        <Scene05Solucion />
      </Sequence>

      {/* Demo cotizador 30s (reducida) */}
      <Sequence from={sec(35)} durationInFrames={sec(30)}>
        <Scene06Cotizador />
      </Sequence>

      {/* CTA 25s */}
      <Sequence from={sec(65)} durationInFrames={sec(25)}>
        <Scene11CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
