import { Bounds } from "@react-three/drei";
import { Canvas, createPortal, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { CubeMaterial } from "./CubeMaterial";
import { Env } from "./Env";

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
      <Canvas dpr={[1, 2]}>
        <Bounds fit clip observe damping={6} margin={0.9}>
          <EnvMapPlane />
        </Bounds>
      </Canvas>
    </div>
  );
}

function EnvMapPlane() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());
  const scene = useMemo(() => new THREE.Scene(), []);

  return (
    <>
      {createPortal(
        <>
          <SaveBackgroundTexture setTexture={setTexture} />
          <Env />
        </>,
        scene
      )}
      {/* <SaveBackgroundTexture setTexture={setTexture} /> */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <planeGeometry args={[2, 1, 1, 1]} />
        <CubeMaterial map={texture} />
      </mesh>
    </>
  );
}

export function SaveBackgroundTexture({
  setTexture,
}: {
  setTexture: (texture: THREE.CubeTexture) => void;
}) {
  const backgroundTexture = useThree((state) => state.scene.background);
  useEffect(() => {
    if (backgroundTexture instanceof THREE.CubeTexture) {
      setTexture(backgroundTexture);
    }
  }, [backgroundTexture]);
  return null;
}
