import { Bounds } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EnvMapPlane } from "./EnvMapPlane";

export function HDRIPreview() {
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
        gl={{
          antialias: true,
        }}
      >
        <Bounds fit clip observe damping={6} margin={0.9}>
          <EnvMapPlane />
        </Bounds>
      </Canvas>
    </div>
  );
}
