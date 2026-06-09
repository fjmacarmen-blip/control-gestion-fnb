import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { SCENE_DURATIONS } from "../theme";
import { Scene01ColdOpen } from "../scenes/Scene01ColdOpen";
import { Scene02Personaje } from "../scenes/Scene02Personaje";
import { Scene03Problema } from "../scenes/Scene03Problema";
import { Scene04OhCrap } from "../scenes/Scene04OhCrap";
import { Scene05Solucion } from "../scenes/Scene05Solucion";
import { Scene06Cotizador } from "../scenes/Scene06Cotizador";
import { Scene07Recetario } from "../scenes/Scene07Recetario";
import { Scene08SalaMovil } from "../scenes/Scene08SalaMovil";
import { Scene09Metricas } from "../scenes/Scene09Metricas";
import { Scene10Diferenciador } from "../scenes/Scene10Diferenciador";
import { Scene11CTA } from "../scenes/Scene11CTA";

/**
 * Composición principal · 1920×1080 (landscape)
 * Duración: 9 900 frames @ 30 fps = 330 seg = 5:30 min
 * Música de fondo: Faith de Ron Gelinas (público/audio/faith.mp3)
 */
export const VideoPromo: React.FC = () => {
  // Offsets acumulados (frame en que arranca cada escena)
  let frame = 0;
  const at = (key: keyof typeof SCENE_DURATIONS) => {
    const start = frame;
    frame += SCENE_DURATIONS[key];
    return start;
  };

  return (
    <AbsoluteFill style={{ background: "#0a1733" }}>
      {/* Música de fondo · suave · descomenta cuando bajes faith.mp3 a public/audio/ */}
      {/* <Audio src={staticFile("audio/faith.mp3")} volume={0.18} /> */}

      <Sequence from={at("s01_coldOpen")}      durationInFrames={SCENE_DURATIONS.s01_coldOpen}>      <Scene01ColdOpen /></Sequence>
      <Sequence from={at("s02_personaje")}     durationInFrames={SCENE_DURATIONS.s02_personaje}>     <Scene02Personaje /></Sequence>
      <Sequence from={at("s03_problema")}      durationInFrames={SCENE_DURATIONS.s03_problema}>      <Scene03Problema /></Sequence>
      <Sequence from={at("s04_ohCrap")}        durationInFrames={SCENE_DURATIONS.s04_ohCrap}>        <Scene04OhCrap /></Sequence>
      <Sequence from={at("s05_solucion")}      durationInFrames={SCENE_DURATIONS.s05_solucion}>      <Scene05Solucion /></Sequence>
      <Sequence from={at("s06_cotizador")}     durationInFrames={SCENE_DURATIONS.s06_cotizador}>     <Scene06Cotizador /></Sequence>
      <Sequence from={at("s07_recetario")}     durationInFrames={SCENE_DURATIONS.s07_recetario}>     <Scene07Recetario /></Sequence>
      <Sequence from={at("s08_salaMovil")}     durationInFrames={SCENE_DURATIONS.s08_salaMovil}>     <Scene08SalaMovil /></Sequence>
      <Sequence from={at("s09_metricas")}      durationInFrames={SCENE_DURATIONS.s09_metricas}>      <Scene09Metricas /></Sequence>
      <Sequence from={at("s10_diferenciador")} durationInFrames={SCENE_DURATIONS.s10_diferenciador}> <Scene10Diferenciador /></Sequence>
      <Sequence from={at("s11_cta")}           durationInFrames={SCENE_DURATIONS.s11_cta}>           <Scene11CTA /></Sequence>
    </AbsoluteFill>
  );
};
