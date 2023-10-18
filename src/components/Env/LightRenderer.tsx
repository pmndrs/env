import { Sphere, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import * as THREE from "three";
import {
  Light,
  ProceduralScrimLight,
  ProceduralUmbrellaLight,
  SkyGradientLight,
  TextureLight,
  toggleLightSelectionAtom,
} from "../../store";
import { ProceduralScrimLightMaterial } from "./ProceduralScrimLightMaterial";
import { ProceduralUmbrellaLightMaterial } from "./ProceduralUmbrellaLightMaterial";
import { SkyGradientLightMaterial } from "./SkyGradientLightMaterial";
import { TextureLightMaterial } from "./TextureLightMaterial";
import { latlonToPhiTheta } from "../../utils/coordinates";
import { useGesture } from "@use-gesture/react";

export function LightRenderer({
  index,
  lightAtom,
  enableEvents = false,
}: {
  index: number;
  lightAtom: PrimitiveAtom<Light>;
  enableEvents?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [light, setLight] = useAtom(lightAtom);
  const toggleSelection = useSetAtom(toggleLightSelectionAtom);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const size = useThree((state) => state.size);
  const bind = useGesture(
    {
      onHover: ({ hovering }) => setHovered(hovering ?? false),
      onClick: () => toggleSelection(light.id),
      onDrag: ({ offset: [x, y] }) => {
        setLight((l) => {
          // Convert to lat/lon
          const lat = THREE.MathUtils.mapLinear(y, 0, size.height, 1, -1);
          const lon = THREE.MathUtils.mapLinear(x, 0, size.width, -1, 1);
          return {
            ...l,
            latlon: { x: lon, y: lat },
            ts: Date.now(),
          };
        });
      },
      onWheel: ({ delta: [x, y], event: { altKey, shiftKey } }) => {
        if (!enableEvents) {
          return;
        }

        if (!light.selected) {
          return;
        }

        if (altKey) {
          setLight((l) => ({
            ...l,
            intensity: l.intensity + y * 0.001,
            ts: Date.now(),
          }));
        } else if (shiftKey) {
          setLight((l) => ({
            ...l,
            scale: l.scale + y * 0.001,
            ts: Date.now(),
          }));
        }
      },
    },
    {
      enabled: enableEvents,
      drag: {
        enabled: enableEvents && light.selected,
      },
      hover: {
        enabled: enableEvents,
      },
      wheel: {
        enabled: enableEvents && light.selected,
      },
    }
  );

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const { phi, theta } = latlonToPhiTheta(light.latlon);

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
      {...(bind() as any)}
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
