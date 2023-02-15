import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { LayerMaterial, Gradient, Noise, Color, Texture } from "lamina";
import { useControls, folder } from "leva";
import { Light, useStore } from "./useStore";

export function Env() {
  const lights = useStore((state) => state.lights);
  const selectedLightId = useStore((state) => state.selectedLightId);

  const [{ background, backgroundColor }] = useControls(
    () => ({
      background: folder(
        {
          background: {
            label: "Show BG",
            value: true,
            render: () => selectedLightId === null,
          },
          backgroundColor: {
            label: "BG Color",
            value: "#000000",
            render: () => selectedLightId === null,
          },
        },
        {
          order: 0,
        }
      ),
    }),
    [selectedLightId]
  );

  return (
    <Environment resolution={2048} background={background}>
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
