import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AutoFocusDOF from "./AutoFocusDOF";
import { usePerformanceMonitor } from "@react-three/drei";
import { useState } from "react";

export function Effects() {
  const [dofEnabled, setDofEnabled] = useState(true);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  usePerformanceMonitor({
    onDecline: () => {
      setDofEnabled(false);
      setBloomEnabled(false);
    },
    onIncline: () => {
      setDofEnabled(true);
      setBloomEnabled(true);
    },
  });
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {dofEnabled ? <AutoFocusDOF /> : <></>}
      {bloomEnabled ? (
        <Bloom
          mipmapBlur
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          height={500}
        />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
