import { shaderMaterial } from "@react-three/drei";
import {
  MaterialNode,
  ThreeElements,
  extend,
  useFrame,
} from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useStore } from "../../hooks/useStore";

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

  varying vec2 vUv;

  float area_light(in vec2 p, in vec2 a, in vec2 b) {
    // projection point to line
    vec2 pa = p - a;
    vec2 ba = b - a;
    float u = dot(pa, ba) / dot(ba, ba);
    u = clamp(u, 0.0, 1.0);
    vec2 c = mix(a, b, u);
    p = p - c;
    
    //calculate normal and use it to get diffuse light
    vec2 n = normalize(vec2(ba.y, -ba.x));
    float diffuse = dot(n, normalize(p));
    
    //compute attenuation
    float l = length(p);
    float kc = 1.0;
    float kl = 0.3;
    float kq = 1.8;
    float attenuation = 1.0 / (kc + kl * l + kq * l * l);
    
    //return final light
    return diffuse * attenuation;
  }

  float point_light(in vec2 p) {
    return 1.0 / dot(p, p);
  }


  void main() {
    vec2 uv = vUv;
    uv = (2.0 * uv - 1.0);

    float l = area_light(uv, vec2(-0.5, 0.0), vec2(0.5, 0.0));
    // l = point_light(uv);

    vec3 color = vec3(l);
    
    // Apply intensity and color
    color *= uColor * uIntensity;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

const ScrimLightShaderMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uColor: new THREE.Color(0xffffff),
    uIntensity: 1,
  },
  vertexShader,
  fragmentShader
);

extend({ ScrimLightShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    scrimLightShaderMaterial: MaterialNode<
      any,
      typeof ScrimLightShaderMaterial
    >;
  }
}

export function ScrimLightMaterial({ lightId }: { lightId: string }) {
  const ref = useRef<ThreeElements["scrimLightShaderMaterial"]>(null!);
  useFrame(({ clock }) => {
    const light = useStore
      .getState()
      .lights.find((light) => light.id === lightId);
    if (!light) return;
    ref.current.uniforms.uOpacity.value = light.opacity;
    ref.current.uniforms.uIntensity.value = light.intensity;
    if (light.type === "solid") {
      ref.current.uniforms.uColor.value = new THREE.Color(light.color);
    }
  });

  return <scrimLightShaderMaterial ref={ref} transparent />;
}

// Reload on HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    window.location.reload();
  });
}
