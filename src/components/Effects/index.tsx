import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AutoFocusDOF from "./AutoFocusDOF";
import { usePerformanceMonitor } from "@react-three/drei";
import { useState } from "react";

export function Effects() {
  const [factor, setFactor] = useState(1);
  usePerformanceMonitor({
    onDecline: (api) => {
      setFactor(api.factor);
    },
    onIncline: (api) => {
      setFactor(api.factor);
    },
  });
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <AutoFocusDOF resolution={factor > 0.5 ? 2048 : 1024} />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        height={factor > 0.5 ? 500 : 250}
      />
    </EffectComposer>
  );
}
