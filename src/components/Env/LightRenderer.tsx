import * as THREE from "three";
import { Float, Lightformer } from "@react-three/drei";
import {
  Light,
  ProceduralUmbrellaLight,
  ScrimLight,
  TextureLight,
} from "../../store";
import { ScrimLightMaterial } from "./ScrimLightMaterial";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { TextureLightMaterial } from "./TextureLightMaterial";
import { ProceduralUmbrellaLightMaterial } from "./ProceduralUmbrellaLightMaterial";

export function LightRenderer({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
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
        {light.type === "scrim" && (
          <ScrimLightMaterial
            lightAtom={lightAtom as PrimitiveAtom<ScrimLight>}
          />
        )}
        {light.type === "texture" && (
          <TextureLightMaterial
            lightAtom={lightAtom as PrimitiveAtom<TextureLight>}
          />
        )}
        {light.type === "procedural_umbrella" && (
          <ProceduralUmbrellaLightMaterial
            lightAtom={lightAtom as PrimitiveAtom<ProceduralUmbrellaLight>}
          />
        )}
      </Lightformer>
    </Float>
  );
}
