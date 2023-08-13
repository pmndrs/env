import { createPortal } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { CubeMaterial } from "./CubeMaterial";
import { Env } from "../Env";
import { DownloadHDRI } from "./DownloadHDRI";
import { SaveBackgroundTexture } from "./SaveBackgroundTexture";
import { Environment } from "@react-three/drei";

export function EnvMapPlane() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());
  const scene = useMemo(() => new THREE.Scene(), []);

  return (
    <>
      {createPortal(
        <>
          <SaveBackgroundTexture setTexture={setTexture} />
          <DownloadHDRI texture={texture} />
          <Environment
            resolution={2048}
            far={100}
            near={0.01}
            frames={Infinity}
            background
          >
            <Env />
          </Environment>
        </>,
        scene
      )}
      <mesh rotation={[Math.PI, 0, 0]}>
        <planeGeometry args={[2, 1, 1, 1]} />
        <CubeMaterial map={texture} />
      </mesh>
    </>
  );
}
