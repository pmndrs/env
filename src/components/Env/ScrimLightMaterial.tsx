import { shaderMaterial } from "@react-three/drei";
import {
  MaterialNode,
  ThreeElements,
  extend,
  useFrame,
} from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { Light, ScrimLight } from "../../store";
import { PrimitiveAtom, useAtomValue } from "jotai";

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
  uniform float uLightDistance;

  varying vec2 vUv;

  // SOURCE: https://articles.hyperknot.com/area_lights_in_shaders/

  float point_light(vec2 uv, float h, float i) {
    // h - light's height over the ground
    // i - light's intensity
    return i * h * pow(dot(uv, uv) + h * h, -1.5);
  }

  float disc_light(vec2 uv, float h, float i) {
    // h - light's height over the ground
    // i - light's intensity
    if (uv.x > 0.) return 0.;
    return i * h * -uv.x * pow(dot(uv,uv) + h*h, -2.);
  }

  float rod_light_antideriv(vec2 uv, float i, float h) {
    return i * uv.x / (dot(uv,uv) + h*h);
  }

  float rod_light(vec2 uv, float i, float h_top, float h_bottom) {
    // h_top and h_bottom - the light's top and bottom above the ground
    // i - light's intensity
    return rod_light_antideriv(uv, i, h_top) - rod_light_antideriv(uv, i, h_bottom);
  }

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

  void main() {
    vec2 uv = vUv;
    uv = (2.0 * uv - 1.0);
    uv -= uLightPosition;

    float l = 0.0;
    l = point_light(uv, uLightDistance, uIntensity);
    // l = disc_light(uv, uLightDistance, uIntensity);
    // l = rod_light(uv, uIntensity, uLightDistance, uLightDistance + 0.5);
    // l = area_light(uv, uIntensity, uLightDistance, uLightDistance + 0.5, -0.25, 0.25);
    
    // Clamp to 0
    l = max(0.0, l);

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
    uLightDistance: 0.5,
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

export function ScrimLightMaterial({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<ScrimLight>;
}) {
  const ref = useRef<ThreeElements["scrimLightShaderMaterial"]>(null!);

  const light = useAtomValue(lightAtom);

  const [color] = useState(() => new THREE.Color(0xffffff));

  useFrame(() => {
    ref.current.uniforms.uColor.value = color.set(light.color);
    ref.current.uniforms.uIntensity.value = light.intensity;
    ref.current.uniforms.uOpacity.value = light.opacity;
    ref.current.uniforms.uLightPosition.value = new THREE.Vector2(
      light.lightPosition.x,
      light.lightPosition.y
    );
    ref.current.uniforms.uLightDistance.value = light.lightDistance;
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
