import { Canvas } from "@react-three/fiber";
import { EnvMapPlane } from "./EnvMapPlane";
import { useSetAtom } from "jotai";
import { deselectLightsAtom } from "../../store";

export function HDRIPreview() {
  const deselectLights = useSetAtom(deselectLightsAtom);
  return (
    <div
      className="w-full h-full overflow-hidden relative"
      style={{
        backgroundSize: "20px 20px",
        backgroundImage:
          "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => deselectLights()}
      >
        <EnvMapPlane />
      </Canvas>
    </div>
  );
}
