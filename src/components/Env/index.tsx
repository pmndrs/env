import * as THREE from "three";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { LayerMaterial } from "lamina";
import { useControls, folder, LevaInputs } from "leva";
import { useStore } from "../../hooks/useStore";
import { LightformerLayers } from "./LightformerLayers";
import { useState } from "react";

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
      {lights.map((light) => {
        const {
          id,
          distance,
          phi,
          theta,
          intensity,
          shape,
          scale,
          scaleX,
          scaleY,
          visible,
          rotation,
          opacity,
          animate,
          animationSpeed,
          animationFloatIntensity,
          animationRotationIntensity,
          animationFloatingRange,
        } = light;

        return (
          <Float
            key={id}
            enabled={animate}
            speed={animationSpeed} // Animation speed, defaults to 1
            rotationIntensity={animationRotationIntensity} // XYZ rotation intensity, defaults to 1
            floatIntensity={animationFloatIntensity} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
            floatingRange={animationFloatingRange}
          >
            <Lightformer
              visible={visible}
              form={shape}
              intensity={intensity}
              position={new THREE.Vector3().setFromSphericalCoords(
                distance,
                phi,
                theta
              )}
              rotation={[rotation, 0, 0]}
              scale={[scale * scaleX, scale * scaleY, scale]}
              target={[0, 0, 0]}
              castShadow={false}
              receiveShadow={false}
            >
              <LayerMaterial
                alpha={opacity}
                transparent
                side={THREE.DoubleSide}
                toneMapped={false}
              >
                <LightformerLayers light={light} />
              </LayerMaterial>
            </Lightformer>
          </Float>
        );
      })}
    </Environment>
  );
}
