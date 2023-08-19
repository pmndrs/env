import { Resize, useGLTF } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import * as THREE from "three";
import { modelUrlAtom } from "../../store";

export function Model({ debugMaterial, ...props }: any) {
  const modelUrl = useAtomValue(modelUrlAtom);

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
    <group {...props} dispose={null}>
      <Resize scale={2}>
        <primitive object={scene} />
      </Resize>
    </group>
  );
}
