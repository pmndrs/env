import { PerspectiveCamera } from "@react-three/drei";
import { camerasAtom } from "../../store";
import { useAtomValue } from "jotai";

export function Cameras() {
  const cameras = useAtomValue(camerasAtom);

  return (
    <>
      {cameras.map((camera) => (
        <PerspectiveCamera
          key={camera.id}
          makeDefault={camera.selected}
          position={camera.position}
          rotation={camera.rotation}
          near={0.001}
          far={100}
        />
      ))}
    </>
  );
}
