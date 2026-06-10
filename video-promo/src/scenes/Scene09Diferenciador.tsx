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
import { colors, fonts } from "../theme";
import texts from "../texts/es.json";

const t = texts.p09_diferenciador;

/** Línea de impacto en Bangers que hace pop sobre placa blanca. */
const PunchLine: React.FC<{
  text: string;
  from: number;
  top: number;
  color: string;
  rotate: number;
  size?: number;
}> = ({ text, from, top, color, rotate, size = 52 }) => {
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
        left: 540,
        top,
        background: "#ffffff",
        border: `5px solid ${colors.ink}`,
        boxShadow: `8px 8px 0 rgba(22,19,13,0.5)`,
        padding: "16px 34px",
        fontFamily: fonts.display,
        fontSize: size,
        letterSpacing: 1.5,
        color,
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
 * Panel 9 · EL DIFERENCIADOR (1:42–1:54)
 * Paco con los brazos cruzados y las tres claves del modelo:
 * sin cuotas, datos propios, URL propia.
 */
export const Scene09Diferenciador: React.FC = () => {
  return (
    <ComicPage>
      {/* Paco seguro, brazos cruzados */}
      <ComicPanel
        from={10}
        rotate={-1}
        style={{ left: 140, top: 120, width: 260, height: 878 }}
      >
        <Img
          src={staticFile("comic/paco-pose-brazos-cruzados.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <CaptionBox
        from={20}
        size={54}
        bg={colors.comicRed}
        color="#ffffff"
        style={{
          left: 520,
          top: 110,
          fontFamily: fonts.display,
          letterSpacing: 2,
          maxWidth: "70%",
        }}
      >
        {t.caption}
      </CaptionBox>

      <PunchLine text={t.line1} from={90} top={340} color={colors.comicRed} rotate={-1.5} />
      <PunchLine text={t.line2} from={150} top={520} color={colors.comicBlue} rotate={1} size={44} />
      <PunchLine text={t.line3} from={210} top={690} color={colors.comicOrange} rotate={-0.8} />
    </ComicPage>
  );
};
