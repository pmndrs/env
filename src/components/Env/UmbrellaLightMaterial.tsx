import { shaderMaterial } from "@react-three/drei";
import {
  MaterialNode,
  ThreeElements,
  extend,
  useFrame,
} from "@react-three/fiber";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useRef } from "react";
import * as THREE from "three";
import { Light } from "../../store";

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
  uniform float uLightSides;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    uv = 2.0 * uv - 1.0;

    vec2 p = uv;
    float at = atan(p.y, p.x);
    float angle = sin(fract(at / PI * uLightSides) * PI) * PI * 0.5;
    float radius = length(p);
    float intensity = 1.0 - smoothstep(0.8, 1.0, radius * radius);

    vec3 color = vec3(angle * intensity);
    
    // Apply intensity and color
    color *= uColor * uIntensity;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

const UmbrellaLightShaderMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uColor: new THREE.Color(0xffffff),
    uIntensity: 1,
    uLightSides: 4,
  },
  vertexShader,
  fragmentShader
);

extend({ UmbrellaLightShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    umbrellaLightShaderMaterial: MaterialNode<
      any,
      typeof UmbrellaLightShaderMaterial
    >;
  }
}

export function UmbrellaLightMaterial({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
  const light = useAtomValue(lightAtom);
  const ref = useRef<ThreeElements["umbrellaLightShaderMaterial"]>(null!);
  useFrame(() => {
    ref.current.uniforms.uOpacity.value = light.opacity;
    ref.current.uniforms.uIntensity.value = light.intensity;
    ref.current.uniforms.uColor.value = new THREE.Color(light.color);
  });

  return <umbrellaLightShaderMaterial ref={ref} transparent />;
}

// Reload on HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    window.location.reload();
  });
}
