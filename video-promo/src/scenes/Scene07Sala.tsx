import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { ComicPage } from "../components/ComicPage";
import { ComicPanel } from "../components/ComicPanel";
import { CaptionBox } from "../components/CaptionBox";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { colors, fonts, SCENE_DURATIONS } from "../theme";
import texts from "../texts/es.json";

const t = texts.p07_sala;
const DUR = SCENE_DURATIONS.p07_sala;

/** Ítem de checklist de sala que hace pop. */
const SalaItem: React.FC<{ label: string; from: number; top: number }> = ({
  label,
  from,
  top,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - from,
    fps,
    config: { damping: 10, stiffness: 170, mass: 0.5 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 1250,
        top,
        background: "#ffffff",
        border: `4px solid ${colors.comicBlue}`,
        boxShadow: `6px 6px 0 rgba(22,19,13,0.4)`,
        borderRadius: 12,
        padding: "12px 24px",
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: 30,
        color: colors.ink,
        whiteSpace: "nowrap",
        opacity: Math.min(1, pop * 1.5),
        transform: `scale(${0.4 + 0.6 * pop})`,
      }}
    >
      <span style={{ color: colors.success, marginRight: 12 }}>✓</span>
      {label}
    </div>
  );
};

/**
 * Panel 7 · VISTA DE SALA (1:16–1:29)
 * La vista de sala integrada en el panel, responsive, mostrada en
 * pantalla de móvil, con el checklist de lo que el equipo consulta
 * el día del evento (dietas por mesa, protocolo, alergias).
 */
export const Scene07Sala: React.FC = () => {
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

      {/* Teléfono 1: la sala con el servicio de hoy */}
      <ComicPanel
        from={20}
        rotate={-1.5}
        style={{ left: 110, top: 220, width: 480, height: 615 }}
      >
        <KenBurnsImage
          src="assets/sala-movil-hoy.png"
          duration={DUR}
          zoom={[1, 1.06]}
          pan="up"
        />
      </ComicPanel>

      {/* Teléfono 2: vista de sala vacía */}
      <ComicPanel
        from={70}
        rotate={1.5}
        style={{ left: 640, top: 300, width: 480, height: 615 }}
      >
        <KenBurnsImage
          src="assets/sala-movil-empty.png"
          duration={DUR}
          zoom={[1.06, 1]}
          pan="down"
        />
      </ComicPanel>

      <CaptionBox from={100} size={30} bg="#ffffff" style={{ left: 1230, top: 220 }}>
        {t.text1}
      </CaptionBox>

      {t.items.map((label, i) => (
        <SalaItem key={label} label={label} from={140 + i * 35} top={370 + i * 100} />
      ))}

      <CaptionBox
        from={280}
        size={30}
        bg={colors.comicBlue}
        color="#ffffff"
        style={{ left: 1210, top: 740, width: 600, maxWidth: 600 }}
      >
        {t.text2}
      </CaptionBox>
    </ComicPage>
  );
};
