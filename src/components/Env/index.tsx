import * as THREE from "three";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { LayerMaterial } from "lamina";
import { useControls, folder, LevaInputs } from "leva";
import { useStore } from "../../hooks/useStore";
import { LightformerLayers } from "./LightformerLayers";
import React, { useRef, useState } from "react";
import { useSignals } from "./useSignals";
import { LightComponent } from "./LightComponent";

export function Env() {
  const mode = useStore((state) => state.mode);
  const lights = useStore((state) => state.lights);
  const selectedLightId = useStore((state) => state.selectedLightId);

  const [{ background, backgroundColor, preset, blur }] = useControls(
    () => ({
      Background: folder(
        {
          background: {
            label: "Show BG",
            value: true,
            render: () => selectedLightId === null && mode === "scene",
          },
          preset: {
            type: LevaInputs.SELECT,
            label: "Preset",
            value: "",
            options: [
              "",
              "sunset",
              "dawn",
              "night",
              "warehouse",
              "forest",
              "apartment",
              "studio",
              "city",
              "park",
              "lobby",
            ] as const,
          },
          backgroundColor: {
            label: "BG Color",
            value: "#000000",
            render: () => selectedLightId === null && mode === "scene",
          },
          blur: {
            label: "Blur",
            value: 0,
            min: 0,
            max: 1,
          },
        },
        {
          order: 0,
          color: "cyan",
        }
      ),
    }),
    [selectedLightId]
  );

  const [resolution, setResolution] = useState(2048);

  return (
    <Environment
      resolution={resolution}
      background={background}
      preset={preset as any}
      blur={blur}
      frames={Infinity}
      far={100}
      near={0.01}
    >
      <color attach="background" args={[backgroundColor]} />
      {lights.map((light) => (
        <LightComponent key={light.id} light={light} />
      ))}
    </Environment>
  );
}
