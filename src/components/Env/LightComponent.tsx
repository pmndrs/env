import { useRef } from "react";
import { Light, useStore } from "../../hooks/useStore";
import { useSignals } from "./useSignals";
import { Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { LayerMaterial } from "lamina";
import { LightformerLayers } from "./LightformerLayers";

export function LightComponent({ light }: { light: Light }) {
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

  const ref = useRef<THREE.Mesh>(null);

  const signals = useStore((state) => state.getSignalsForTarget(id));

  useSignals(ref, signals);

  return (
    <Lightformer
      ref={ref}
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
}
