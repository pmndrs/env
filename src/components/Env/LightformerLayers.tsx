import * as THREE from "three";
import { Gradient, Noise, Color, Texture } from "lamina";
import { Light } from "../../hooks/useStore";

export function LightformerLayers({ light }: { light: Light }) {
  if (light.type === "solid") {
    const color = new THREE.Color(light.color);
    color.multiplyScalar(light.intensity);
    return <Color color={color} />;
  } else if (light.type === "gradient") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    return (
      <Gradient
        colorA={colorA}
        colorB={colorB}
        contrast={light.contrast}
        axes={light.axes}
      />
    );
  } else if (light.type === "noise") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    const colorC = new THREE.Color(light.colorC);
    const colorD = new THREE.Color(light.colorD);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    colorC.multiplyScalar(light.intensity);
    colorD.multiplyScalar(light.intensity);
    return (
      <Noise
        colorA={colorA}
        colorB={colorB}
        colorC={colorC}
        colorD={colorD}
        type={light.noiseType}
        scale={light.noiseScale}
      />
    );
  } else if (light.type === "texture") {
    return <Texture map={light.map} />;
  } else {
    throw new Error("Unknown light type");
  }
}
