import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { SpeechBubble } from "../components/SpeechBubble";
import { colors, fonts } from "../theme";
import texts from "../texts/es.json";

const t = texts.p03_solucion;

/** Tagline en Bangers sobre placa de color que hace pop. */
const Tagline: React.FC<{ text: string; from: number; top: number; bg: string; rotate: number }> = ({
  text,
  from,
  top,
  bg,
  rotate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 10, stiffness: 160, mass: 0.5 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 1400,
        top,
        background: bg,
        color: "#ffffff",
        border: `5px solid ${colors.ink}`,
        boxShadow: `8px 8px 0 rgba(22,19,13,0.5)`,
        padding: "14px 30px",
        fontFamily: fonts.display,
        fontSize: 52,
        letterSpacing: 1.5,
        whiteSpace: "nowrap",
        opacity: Math.min(1, pop * 1.5),
        transform: `rotate(${rotate}deg) scale(${0.4 + 0.6 * pop})`,
      }}
    >
      {text}
    </div>
  );
};

/**
 * Panel 3 · LA SOLUCIÓN (0:22–0:34)
 * Paco presenta la plataforma: isotipo QBB en viñeta propia
 * y tres taglines de impacto.
 */
export const Scene03Solucion: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox from={5} size={36} style={{ left: 60, top: 50 }}>
        {t.caption}
      </CaptionBox>

      {/* Paco presentando con el brazo extendido hacia la derecha */}
      <ComicPanel
        from={10}
        rotate={-1}
        style={{ left: 130, top: 160, width: 272, height: 850 }}
      >
        <Img
          src={staticFile("comic/paco-pose-presenta.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <SpeechBubble
        from={40}
        size={36}
        tail="bottom-left"
        style={{ left: 470, top: 130, maxWidth: 600 }}
      >
        {t.bubble}
      </SpeechBubble>

      {/* Isotipo QBB en viñeta destacada */}
      <ComicPanel
        from={70}
        rotate={2}
        bg="#ffffff"
        padding={30}
        style={{ left: 990, top: 360, width: 340, height: 340 }}
      >
        <Img
          src={staticFile("comic/qbb-isotipo-512.png")}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </ComicPanel>

      <Tagline text={t.tagline1} from={130} top={330} bg={colors.comicRed} rotate={-2} />
      <Tagline text={t.tagline2} from={175} top={490} bg={colors.comicBlue} rotate={1.5} />
      <Tagline text={t.tagline3} from={220} top={650} bg={colors.comicOrange} rotate={-1} />
    </ComicPage>
  );
};
