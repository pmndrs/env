import { Resize, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "../../hooks/useStore";

export function Model({ debugMaterial, ...props }: any) {
  const modelUrl = useStore((state) => state.modelUrl);
  const {
    scene,
    // @ts-ignore
    nodes,
    // @ts-ignore
    materials,
  } = useGLTF(modelUrl);

  useMemo(() => {
    Object.values(nodes).forEach(
      (node: any) =>
        node.isMesh && (node.receiveShadow = node.castShadow = true)
    );
    const material = new THREE.MeshStandardMaterial({
      color: "black",
      roughness: 0.1,
      metalness: 0,
    });
    Object.values(nodes).forEach((node: any) => {
      if (node.isMesh && debugMaterial) {
        node.userData.material = node.material;
        node.material = material;
      } else {
        node.material = node.userData.material || node.material;
      }
    });
  }, [nodes, materials, debugMaterial]);

  return (
    <Resize scale={2}>
      <primitive object={scene} {...props} />
    </Resize>
  );
}
