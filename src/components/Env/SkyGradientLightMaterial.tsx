import { shaderMaterial } from "@react-three/drei";
import {
  MaterialNode,
  ThreeElements,
  extend,
  useFrame,
} from "@react-three/fiber";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useRef, useState } from "react";
import * as THREE from "three";
import { SkyGradientLight } from "../../store";

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
  uniform vec3 uColor2;
  uniform float uIntensity;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec3 color = mix(uColor, uColor2, uv.y);
    gl_FragColor = vec4(color * uIntensity, uOpacity);
  }
`;

const SkyGradientLightShaderMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uColor: new THREE.Color(0xffffff),
    uColor2: new THREE.Color(0xffffff),
    uIntensity: 1,
  },
  vertexShader,
  fragmentShader
);

extend({ SkyGradientLightShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    skyGradientLightShaderMaterial: MaterialNode<
      any,
      typeof SkyGradientLightShaderMaterial
    >;
  }
}

export function SkyGradientLightMaterial({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<SkyGradientLight>;
}) {
  const light = useAtomValue(lightAtom);
  const ref = useRef<ThreeElements["skyGradientLightShaderMaterial"]>(null!);

  const [color] = useState(() => new THREE.Color(0xffffff));
  const [color2] = useState(() => new THREE.Color(0xffffff));

  useFrame(() => {
    ref.current.uniforms.uOpacity.value = light.opacity;
    ref.current.uniforms.uIntensity.value = light.intensity;
    ref.current.uniforms.uColor.value = color.set(light.color);
    ref.current.uniforms.uColor2.value = color2.set(light.color2);
  });

  return (
    <skyGradientLightShaderMaterial
      ref={ref}
      transparent={true}
      depthFunc={THREE.AlwaysDepth}
      side={THREE.BackSide}
    />
  );
}

// Reload on HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    window.location.reload();
  });
}
