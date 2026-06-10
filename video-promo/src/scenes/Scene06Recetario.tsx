import React from "react";
import { Img, staticFile } from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { SpeechBubble } from "../components/SpeechBubble";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { colors, fonts, SCENE_DURATIONS } from "../theme";
import texts from "../texts/es.json";

const t = texts.p06_recetario;
const DUR = SCENE_DURATIONS.p06_recetario;

/**
 * Panel 6 · RECETARIO + ESCANDALLOS (1:02–1:16)
 * Captura grande del recetario con sidebar, Paco explicando
 * con el dedo alzado y el mensaje de control de costes.
 */
export const Scene06Recetario: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox
        from={5}
        size={42}
        bg={colors.comicRed}
        color="#ffffff"
        style={{ left: 60, top: 45, fontFamily: fonts.display, letterSpacing: 2 }}
      >
        {t.caption}
      </CaptionBox>

      {/* Captura: recetario con sidebar de categorías */}
      <ComicPanel
        from={20}
        rotate={-0.8}
        style={{ left: 80, top: 190, width: 1040, height: 487 }}
      >
        <KenBurnsImage
          src="assets/recetario-sidebar.png"
          duration={DUR}
          zoom={[1, 1.07]}
          pan="left"
        />
      </ComicPanel>

      {/* Bocadillo apuntando hacia Paco */}
      <SpeechBubble
        from={230}
        size={30}
        tail="bottom-right"
        style={{ left: 1180, top: 130, maxWidth: 600 }}
      >
        {t.bubble}
      </SpeechBubble>

      {/* Paco con el dedo alzado, explicando */}
      <ComicPanel
        from={60}
        rotate={1.5}
        style={{ left: 1430, top: 420, width: 300, height: 424 }}
      >
        <Img
          src={staticFile("comic/paco-pose-dedo-alzado.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      <CaptionBox from={90} size={30} bg="#ffffff" style={{ left: 120, top: 730 }}>
        {t.text1}
      </CaptionBox>

      <CaptionBox from={160} size={30} style={{ left: 240, top: 860 }}>
        {t.text2}
      </CaptionBox>
    </ComicPage>
  );
};
