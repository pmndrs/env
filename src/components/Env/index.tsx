import * as THREE from "three";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { Light, lightAtomsAtom } from "../../hooks/useStore";
// import { UmbrellaLightMaterial } from "./UmbrellaLightMaterial";
import { ScrimLightMaterial } from "./ScrimLightMaterial";
import { PrimitiveAtom, useAtomValue } from "jotai";

export function Env() {
  const lightAtoms = useAtomValue(lightAtomsAtom);

  return (
    <Environment
      resolution={2048}
      far={100}
      near={0.01}
      frames={Infinity}
      background
    >
      <color attach="background" args={["black"]} />
      {lightAtoms.map((lightAtom) => (
        <LightRenderer key={lightAtom.toString()} lightAtom={lightAtom} />
      ))}
    </Environment>
  );
}

function LightRenderer({ lightAtom }: { lightAtom: PrimitiveAtom<Light> }) {
  const light = useAtomValue(lightAtom);

  return (
    <Float
      enabled={light.animate}
      speed={light.animationSpeed} // Animation speed, defaults to 1
      rotationIntensity={light.animationRotationIntensity} // XYZ rotation intensity, defaults to 1
      floatIntensity={light.animationFloatIntensity} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
      floatingRange={light.animationFloatingRange}
    >
      <Lightformer
        visible={light.visible}
        form={light.shape}
        position={new THREE.Vector3().setFromSphericalCoords(
          light.distance,
          light.phi,
          light.theta
        )}
        rotation={[light.rotation, 0, 0]}
        scale={[
          light.scale * light.scaleX,
          light.scale * light.scaleY,
          light.scale,
        ]}
        target={[0, 0, 0]}
        castShadow={false}
        receiveShadow={false}
      >
        <ScrimLightMaterial lightAtom={lightAtom} />
        {/* <UmbrellaLightMaterial lightId={light.id} /> */}
      </Lightformer>
    </Float>
  );
}
