import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import AutoFocusDOF from "./AutoFocusDOF";
import { usePerformanceMonitor } from "@react-three/drei";
import { useState } from "react";

export function Effects() {
  const [enabled, setEnabled] = useState(true);

  usePerformanceMonitor({
    onFallback: () => {
      setEnabled(false);
    },
  });

  return (
    <EffectComposer disableNormalPass>
      {enabled ? (
        <>
          <AutoFocusDOF resolution={2048} />
          <Bloom
            mipmapBlur
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
            height={500}
          />
          <Noise opacity={0.03} />
        </>
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
