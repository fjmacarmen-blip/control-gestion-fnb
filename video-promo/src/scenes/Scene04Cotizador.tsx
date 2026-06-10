import React from "react";
import { Img, staticFile } from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { Onomatopeya } from "../components/Onomatopeya";
import { colors, fonts, SCENE_DURATIONS } from "../theme";
import texts from "../texts/es.json";

const t = texts.p04_cotizador;
const DUR = SCENE_DURATIONS.p04_cotizador;

/**
 * Panel 4 · EL COTIZADOR (0:34–0:49)
 * Dos capturas reales del cotizador en viñetas solapadas,
 * Paco con la tablet y el contraste ANTES/AHORA.
 */
export const Scene04Cotizador: React.FC = () => {
  return (
    <ComicPage>
      <CaptionBox
        from={5}
        size={48}
        bg={colors.comicRed}
        color="#ffffff"
        style={{ left: 60, top: 45, fontFamily: fonts.display, letterSpacing: 2 }}
      >
        {t.caption}
      </CaptionBox>

      {/* Captura: paso 1 del cotizador (cliente configura su evento) */}
      <ComicPanel
        from={20}
        rotate={-1.2}
        style={{ left: 90, top: 180, width: 920, height: 430 }}
      >
        <KenBurnsImage
          src="assets/cotizador-step-1.png"
          duration={DUR}
          zoom={[1, 1.07]}
          pan="right"
        />
      </ComicPanel>

      {/* zIndex: el caption debe quedar sobre la viñeta del paso 2, que se solapa */}
      <CaptionBox from={70} size={30} bg="#ffffff" style={{ left: 140, top: 650, zIndex: 10 }}>
        {t.text1}
      </CaptionBox>

      {/* Paco con la tablet, al margen derecho */}
      <ComicPanel
        from={110}
        rotate={1}
        style={{ left: 1690, top: 90, width: 170, height: 545 }}
      >
        <Img
          src={staticFile("comic/paco-pose-tablet.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ComicPanel>

      {/* Captura: paso 2, selección de menús */}
      <ComicPanel
        from={200}
        rotate={1.4}
        style={{ left: 720, top: 490, width: 920, height: 430 }}
      >
        <KenBurnsImage
          src="assets/cotizador-step-2-menu.png"
          duration={DUR}
          zoom={[1.06, 1]}
          pan="left"
        />
      </ComicPanel>

      <CaptionBox from={245} size={30} bg="#ffffff" style={{ left: 1080, top: 940 }}>
        {t.text2}
      </CaptionBox>

      {/* Contraste ANTES / AHORA */}
      <CaptionBox from={300} size={32} bg="#ffffff" style={{ left: 110, top: 800 }}>
        <span style={{ color: colors.comicRed, fontFamily: fonts.display, marginRight: 12 }}>
          {t.antes_label}:
        </span>
        <span style={{ textDecoration: "line-through" }}>{t.antes_value}</span>
      </CaptionBox>

      <CaptionBox from={330} size={32} style={{ left: 150, top: 910 }}>
        <span style={{ color: colors.comicBlue, fontFamily: fonts.display, marginRight: 12 }}>
          {t.ahora_label}:
        </span>
        {t.ahora_value}
      </CaptionBox>

      <Onomatopeya
        word={t.onomatopeya}
        from={365}
        size={54}
        style={{ left: 480, top: 800 }}
      />
    </ComicPage>
  );
};
