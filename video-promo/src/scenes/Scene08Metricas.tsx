import React from "react";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { Onomatopeya } from "../components/Onomatopeya";
import { colors, fonts, SCENE_DURATIONS } from "../theme";
import texts from "../texts/es.json";

const t = texts.p08_metricas;
const DUR = SCENE_DURATIONS.p08_metricas;

/**
 * Panel 8 · MÉTRICAS Y CALENDARIO (1:29–1:42)
 * Panel de control y acceso superadmin en viñetas solapadas,
 * con el calendario que bloquea dobles reservas.
 */
export const Scene08Metricas: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox
        from={5}
        size={40}
        bg={colors.comicRed}
        color="#ffffff"
        style={{ left: 60, top: 45, fontFamily: fonts.display, letterSpacing: 2 }}
      >
        {t.caption}
      </CaptionBox>

      {/* Captura: panel de gestión */}
      <ComicPanel
        from={20}
        rotate={-1}
        style={{ left: 90, top: 190, width: 880, height: 412 }}
      >
        <KenBurnsImage
          src="assets/metricas-presupuestos.png"
          duration={DUR}
          zoom={[1, 1.07]}
          pan="right"
        />
      </ComicPanel>

      <CaptionBox from={80} size={30} bg="#ffffff" style={{ left: 1060, top: 250, width: 700, maxWidth: 700 }}>
        {t.text1}
      </CaptionBox>

      {/* Captura: vista superadmin multi-tenant */}
      <ComicPanel
        from={150}
        rotate={1.2}
        style={{ left: 900, top: 560, width: 880, height: 412 }}
      >
        <KenBurnsImage
          src="assets/metricas-calendario.png"
          duration={DUR}
          zoom={[1.06, 1]}
          pan="left"
        />
      </ComicPanel>

      <CaptionBox from={230} size={30} style={{ left: 110, top: 700, width: 640, maxWidth: 640 }}>
        {t.text2}
      </CaptionBox>

      <Onomatopeya
        word={t.onomatopeya}
        from={290}
        size={54}
        color={colors.comicOrange}
        starColor={colors.comicYellow}
        rotate={-10}
        style={{ left: 1600, top: 400 }}
      />
    </ComicPage>
  );
};
