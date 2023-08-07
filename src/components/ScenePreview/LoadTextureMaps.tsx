import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { textureMapsAtom } from "../../hooks/useStore";
import { useSetAtom } from "jotai";

export function LoadTextureMaps() {
  const setTextureMaps = useSetAtom(textureMapsAtom);

  useTexture({ checkerboard: "/textures/checkerboard.png" }, (textures) => {
    if (Array.isArray(textures)) {
      textures.forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const url = new URL(texture.source.data.currentSrc);
        texture.name = url.pathname.split("/").pop() as string;
        texture.needsUpdate = true;
      });
      setTextureMaps(textures);
    } else {
      setTextureMaps([textures]);
    }
  });

  return null;
}
