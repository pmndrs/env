import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import {
  fragmentShader,
  vertexShader,
} from "./convertCubemapToEquirectangular";

const CubeMapMaterialImpl = shaderMaterial(
  {
    map: new THREE.CubeTexture(),
  },
  vertexShader,
  fragmentShader
);

// @ts-ignore
CubeMapMaterialImpl.key = THREE.MathUtils.generateUUID();

extend({ CubeMapMaterial: CubeMapMaterialImpl });

type CubeMapMaterialType = JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cubeMapMaterial: CubeMapMaterialType;
    }
  }
}

export function CubeMaterial({ map }: { map: THREE.Texture }) {
  return (
    <cubeMapMaterial
      key={(CubeMapMaterialImpl as any).key}
      attach="material"
      // @ts-ignore
      map={map}
      transparent
      side={THREE.DoubleSide}
    />
  );
}
