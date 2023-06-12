import { PerspectiveCamera } from "@react-three/drei";
import React from "react";
import { useStore } from "../../hooks/useStore";

export function Cameras() {
  const cameras = useStore((state) => state.cameras);
  const selectedCameraId = useStore((state) => state.selectedCameraId);

  return (
    <>
      {cameras.map((camera) => (
        <PerspectiveCamera
          key={camera.id}
          makeDefault={camera.id === selectedCameraId}
          position={camera.position}
          rotation={camera.rotation}
          near={0.001}
          far={100} />
      ))}
    </>
  );
}
