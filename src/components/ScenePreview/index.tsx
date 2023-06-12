import { Suspense } from "react";
import { Bvh, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { button, folder, useControls } from "leva";
import { useStore } from "../../hooks/useStore";
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
  const selectedLightId = useStore((state) => state.selectedLightId);
  const mode = useStore((state) => state.mode);

  const [{ ambientLightIntensity, debugMaterial, autoRotate }] = useControls(
    () => ({
      Preview: folder(
        {
          ambientLightIntensity: {
            label: "Ambient Intensity",
            value: 0.5,
            min: 0,
            max: 3,
            render: () => mode === "scene",
          },
          debugMaterial: {
            label: "Debug Material",
            value: false,
            render: () => mode === "scene",
          },
          autoRotate: {
            label: "Auto Rotate",
            value: false,
            render: () => mode === "scene",
          },
          Screenshot: button(() => {
            const canvas = document.querySelector("canvas");
            if (canvas) {
              const link = document.createElement("a");
              link.download = "screenshot.png";
              link.href = canvas.toDataURL("image/png", 1);
              link.click();
            }
          }),
          "Upload Model": button(() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".glb";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const data = e.target?.result;
                  if (typeof data === "string") {
                    const modelUrl = data;
                    useGLTF.preload(modelUrl);
                    useStore.setState({ modelUrl });
                  }
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }),
        },
        {
          order: 1,
          color: "limegreen",
        }
      ),
    }),
    [selectedLightId]
  );

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
        flipflops={2}
        onDecline={() =>
          toast("Switching to low performance mode", {
            description:
              "This will reduce the quality of the preview, but will improve performance.",
            icon: <BoltIcon className="w-4 h-4" />,
          })
        }
        onIncline={() => toast("Switching to high performance mode")}
      >
        <Cameras />

        <Suspense fallback={null}>
          <Bvh firstHitOnly>
            <Model debugMaterial={debugMaterial} />
          </Bvh>
        </Suspense>

        <Lights ambientLightIntensity={ambientLightIntensity} />

        <Suspense fallback={null}>
          <Env />
        </Suspense>

        <Effects />

        <Debug />

        <Controls autoRotate={autoRotate} />

        <LoadTextureMaps />
      </PerformanceMonitor>
    </Canvas>
  );
}
