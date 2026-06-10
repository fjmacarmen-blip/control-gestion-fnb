import React from "react";
import { Composition } from "remotion";
import { VideoComic } from "./compositions/VideoComic";
import { FPS, TOTAL_DURATION } from "./theme";

/**
 * 3 composiciones registradas (motion comic v5.19 · 2:18 min):
 *  - VideoPromo         · 1920×1080 (landscape, principal)
 *  - VideoPromoSquare   · 1080×1080 (LinkedIn / Instagram feed)
 *  - VideoPromoVertical · 1080×1920 (Stories / Reels / TikTok)
 *
 * Las 3 reutilizan VideoComic: el lienzo 16:9 se escala y centra
 * sobre fondo de papel cómic en los formatos cuadrado y vertical.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPromo"
        component={VideoComic}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="VideoPromoSquare"
        component={VideoComic}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="VideoPromoVertical"
        component={VideoComic}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
