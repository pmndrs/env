import { shaderMaterial } from "@react-three/drei";
import {
  MaterialNode,
  ThreeElements,
  extend,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useRef } from "react";
import * as THREE from "three";
import { EXRLoader } from "three-stdlib";
import { TextureLight } from "../../store";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform sampler2D uTexture;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    vec4 tex = texture2D(uTexture, uv);

    gl_FragColor = vec4(tex.rgb * uColor * uIntensity, tex.a * uOpacity);
  }
`;

const TextureLightShaderMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uColor: new THREE.Color(0xffffff),
    uIntensity: 1,
    uTexture: new THREE.DataTexture(),
  },
  vertexShader,
  fragmentShader
);

extend({ TextureLightShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    textureLightShaderMaterial: MaterialNode<
      any,
      typeof TextureLightShaderMaterial
    >;
  }
}

export function TextureLightMaterial({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<TextureLight>;
}) {
  const light = useAtomValue(lightAtom);
  const ref = useRef<ThreeElements["textureLightShaderMaterial"]>(null!);
  const texture = useLoader(EXRLoader, light.map);

  useFrame(() => {
    ref.current.uniforms.uOpacity.value = light.opacity;
    ref.current.uniforms.uIntensity.value = light.intensity;
    ref.current.uniforms.uColor.value = new THREE.Color(light.color);
  });

  return (
    <textureLightShaderMaterial ref={ref} transparent uTexture={texture} />
  );
}

// Reload on HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    window.location.reload();
  });
}
