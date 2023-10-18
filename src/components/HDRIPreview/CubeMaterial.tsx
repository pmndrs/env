import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import {
  fragmentShader,
  vertexShader,
} from "./convertCubemapToEquirectangular";
import { ComponentProps } from "react";

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

export function CubeMaterial({ ...props }: ComponentProps<"cubeMapMaterial">) {
  return (
    <cubeMapMaterial
      key={(CubeMapMaterialImpl as any).key}
      attach="material"
      transparent
      side={THREE.DoubleSide}
      {...props}
    />
  );
}
