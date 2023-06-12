import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AutoFocusDOF from "./AutoFocusDOF";

export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      <AutoFocusDOF />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        height={500}
      />
    </EffectComposer>
  );
}
