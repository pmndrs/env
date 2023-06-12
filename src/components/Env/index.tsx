import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { LayerMaterial, Gradient, Noise, Color, Texture } from "lamina";
import { useControls, folder, LevaInputs } from "leva";
import { Light, useStore } from "../../hooks/useStore";

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

  return (
    <Environment
      resolution={2048}
      background
      preset={preset as any}
      blur={blur}
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
        } = light;
        return (
          <Lightformer
            key={id}
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
        );
      })}
    </Environment>
  );
}

function LightformerLayers({ light }: { light: Light }) {
  if (light.type === "solid") {
    const color = new THREE.Color(light.color);
    color.multiplyScalar(light.intensity);
    return <Color color={color} />;
  } else if (light.type === "gradient") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    return (
      <Gradient
        colorA={colorA}
        colorB={colorB}
        contrast={light.contrast}
        axes={light.axes}
      />
    );
  } else if (light.type === "noise") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    const colorC = new THREE.Color(light.colorC);
    const colorD = new THREE.Color(light.colorD);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    colorC.multiplyScalar(light.intensity);
    colorD.multiplyScalar(light.intensity);
    return (
      <Noise
        colorA={colorA}
        colorB={colorB}
        colorC={colorC}
        colorD={colorD}
        type={light.noiseType}
        scale={light.noiseScale}
      />
    );
  } else if (light.type === "texture") {
    return <Texture map={light.map} />;
  } else {
    throw new Error("Unknown light type");
  }
}
