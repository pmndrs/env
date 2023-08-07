import { Suspense } from "react";
import { Bvh, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Effects } from "../Effects";
import { Env } from "../Env";
import { Model } from "../Model";
import { Cameras } from "./Cameras";
import { Controls } from "./Controls";
import { Debug } from "./Debug";
import { LoadTextureMaps } from "./LoadTextureMaps";
import { Lights } from "./Lights";
import { toast } from "sonner";
import { BoltIcon } from "@heroicons/react/24/solid";

export function ScenePreview() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true, // for screenshot
        logarithmicDepthBuffer: true,
        antialias: true,
      }}
    >
      <PerformanceMonitor
        threshold={1}
        factor={1}
        flipflops={0}
        onFallback={() => {
          toast("Switching to low performance mode", {
            description:
              "This will reduce the quality of the preview, but will improve performance.",
            icon: <BoltIcon className="w-4 h-4" />,
          });
        }}
      >
        <Cameras />

        <Suspense fallback={null}>
          <Bvh firstHitOnly>
            <Model debugMaterial={false} />
          </Bvh>
        </Suspense>

        <Lights ambientLightIntensity={0.2} />

        <Suspense fallback={null}>
          <Env />
        </Suspense>

        {/* <Effects /> */}

        <Debug />

        <Controls autoRotate={false} />

        <LoadTextureMaps />
      </PerformanceMonitor>
    </Canvas>
  );
}
