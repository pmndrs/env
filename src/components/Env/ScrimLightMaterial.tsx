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
  uniform vec2 uLightPosition;

  varying vec2 vUv;

  // SOURCE: https://articles.hyperknot.com/area_lights_in_shaders/

  float area_light_antideriv(vec2 uv, float i, float h, float t) {
    float lxh = length(vec2(uv.x, h));
    return -i * uv.x * atan((t-uv.y) / lxh) / lxh;
  }

  float area_light(vec2 uv, float i, float h_bottom, float h_top, float t_start, float t_end) {
    // i - light's intensity
    // h_top and h_bottom - the light's top and bottom above the ground
    // t_start and t_end - the light's start and end on the y-axis
    float v =
    + area_light_antideriv(uv, i, h_top, t_end)
    + area_light_antideriv(uv, i, h_bottom, t_start)
    - area_light_antideriv(uv, i, h_bottom, t_end)
    - area_light_antideriv(uv, i, h_top, t_start);
    return max(0.0, v);
  }

  float point_light(vec2 uv, float h, float i) {
    // h - light's height over the ground
    // i - light's intensity
    return i * h * pow(dot(uv, uv) + h * h, -1.5);
  }

  void main() {
    vec2 uv = vUv;
    uv = (2.0 * uv - 1.0);

    float l = area_light(uv + uLightPosition, uIntensity, 0.5 - uLightPosition.x, 3.0, -0.25, 0.25);
    // l = point_light(uv + uLightPosition, uLightPosition.x + 0.5, uIntensity);

    vec3 color = vec3(l);
    
    // Apply intensity and color
    color *= uColor;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

const ScrimLightShaderMaterial = shaderMaterial(
  {
    uOpacity: 1,
    uColor: new THREE.Color(0xffffff),
    uIntensity: 1,
    uLightPosition: new THREE.Vector2(0, 0),
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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    ref.current.uniforms.uLightPosition.value = new THREE.Vector2(
      Math.sin(time) * 0.5,
      Math.cos(time) * 0.5
    );
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
