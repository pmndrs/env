import * as THREE from "three";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useStore } from "../../hooks/useStore";
import { UmbrellaLightMaterial } from "./UmbrellaLightMaterial";
import { ScrimLightMaterial } from "./ScrimLightMaterial";

export function Env() {
  const lights = useStore((state) => state.lights);

  return (
    <Environment
      resolution={2048}
      far={100}
      near={0.01}
      frames={Infinity}
      background
    >
      <color attach="background" args={["black"]} />
      {lights.map((light) => {
        const {
          id,
          distance,
          phi,
          theta,
          shape,
          scale,
          scaleX,
          scaleY,
          visible,
          rotation,
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
              <ScrimLightMaterial lightId={light.id} />
              {/* <UmbrellaLightMaterial lightId={light.id} /> */}
            </Lightformer>
          </Float>
        );
      })}
    </Environment>
  );
}
