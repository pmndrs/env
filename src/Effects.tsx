import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        height={500}
      />
    </EffectComposer>
  );
}
