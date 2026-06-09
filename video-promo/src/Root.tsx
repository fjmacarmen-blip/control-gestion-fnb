import React from "react";
import { Composition } from "remotion";
import { VideoPromo } from "./compositions/VideoPromo";
import { VideoPromoTeaser } from "./compositions/VideoPromoTeaser";
import { FPS, TOTAL_DURATION, sec } from "./theme";

/**
 * 4 composiciones registradas:
 *  - VideoPromo         · 1920×1080 · 5:30 min (landscape, principal)
 *  - VideoPromoSquare   · 1080×1080 · 5:30 min (LinkedIn / Instagram feed)
 *  - VideoPromoVertical · 1080×1920 · 5:30 min (Stories / Reels / TikTok)
 *  - VideoPromoTeaser   · 1920×1080 · 1:30 min (WhatsApp / preview)
 *
 * Las 3 versiones full reutilizan la composición VideoPromo cambiando
 * solo width/height. El layout interno usa AbsoluteFill que se adapta.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoPromo"
        component={VideoPromo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="VideoPromoSquare"
        component={VideoPromo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="VideoPromoVertical"
        component={VideoPromo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoPromoTeaser"
        component={VideoPromoTeaser}
        durationInFrames={sec(90)}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
