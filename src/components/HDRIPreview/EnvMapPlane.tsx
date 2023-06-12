import { createPortal } from "@react-three/fiber";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { CubeMaterial } from "./CubeMaterial";
import { Env } from "../Env";
import { SaveBackgroundTexture } from "./SaveBackgroundTexture";
import { DownloadHDRI } from "./DownloadHDRI";

export function EnvMapPlane() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());
  const scene = useMemo(() => new THREE.Scene(), []);

  return (
    <>
      {createPortal(
        <>
          <SaveBackgroundTexture setTexture={setTexture} />
          <DownloadHDRI texture={texture} />
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
