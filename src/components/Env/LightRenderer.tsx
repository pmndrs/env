import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useRef } from "react";
import * as THREE from "three";
import {
  Light,
  ProceduralScrimLight,
  ProceduralUmbrellaLight,
  SkyGradientLight,
  TextureLight,
} from "../../store";
import { ProceduralScrimLightMaterial } from "./ProceduralScrimLightMaterial";
import { ProceduralUmbrellaLightMaterial } from "./ProceduralUmbrellaLightMaterial";
import { SkyGradientLightMaterial } from "./SkyGradientLightMaterial";
import { TextureLightMaterial } from "./TextureLightMaterial";

export function LightRenderer({
  index,
  lightAtom,
}: {
  index: number;
  lightAtom: PrimitiveAtom<Light>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const light = useAtomValue(lightAtom);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    // Convert lat/lon to phi/theta
    const phi = THREE.MathUtils.mapLinear(light.latlon.y, -1, 1, Math.PI, 0);
    const theta = THREE.MathUtils.mapLinear(
      light.latlon.x,
      -1,
      1,
      0.5 * Math.PI,
      -1.5 * Math.PI
    );

    meshRef.current.position.setFromSphericalCoords(3, phi, theta);

    meshRef.current.scale.setX(light.scale * light.scaleX);
    meshRef.current.scale.setY(light.scale * light.scaleY);
    meshRef.current.scale.setZ(light.scale);

    meshRef.current.lookAt(light.target.x, light.target.y, light.target.z);
    meshRef.current.rotateZ(light.rotation);
    meshRef.current.updateMatrix();
  });

  if (light.type === "sky_gradient") {
    return (
      <Sphere
        visible={light.visible}
        args={[100, 64, 64]}
        castShadow={false}
        receiveShadow={false}
        renderOrder={index}
      >
        <SkyGradientLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<SkyGradientLight>}
        />
      </Sphere>
    );
  }

  return (
    <mesh
      ref={meshRef}
      visible={light.visible}
      castShadow={false}
      receiveShadow={false}
      renderOrder={index}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      {light.type === "procedural_scrim" && (
        <ProceduralScrimLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<ProceduralScrimLight>}
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
    </mesh>
  );
}
