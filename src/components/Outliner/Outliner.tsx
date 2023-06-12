import {
  PlusIcon,
} from "@heroicons/react/24/outline";
import * as THREE from "three";

import { useStore } from "../../hooks/useStore";
import { LightListItem } from "./LightListItem";
import { CameraListItem } from "./CameraListItem";

export function Outliner() {
  const lights = useStore((state) => state.lights);
  const cameras = useStore((state) => state.cameras);
  const addLight = useStore((state) => state.addLight);
  const addCamera = useStore((state) => state.addCamera);

  const selectedCameraId = useStore((state) => state.selectedCameraId);
  const currentCamera = cameras.find((c) => c.id === selectedCameraId);

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="uppercase font-light text-xs tracking-widest text-gray-300">
          Cameras
        </h2>
        <button
          className="rounded p-1 -m-1 hover:bg-white/20 transition-colors"
          onClick={() => {
            addCamera({
              rotation: [0, 0, 0],
              position: [0, 0, 5],
              ...currentCamera,
              name: `Camera ${String.fromCharCode(cameras.length + 65)}`,
              id: THREE.MathUtils.generateUUID(),
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <ul className="m-0 p-2 flex flex-col gap-1">
        {cameras.map((camera, index) => (
          <CameraListItem key={camera.id} index={index} camera={camera} />
        ))}
      </ul>

      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="uppercase font-light text-xs tracking-widest text-gray-300">
          Lights
        </h2>
        <button
          className="rounded p-1 -m-1 hover:bg-white/20 transition-colors"
          onClick={() => {
            addLight({
              name: `Light ${String.fromCharCode(lights.length + 65)}`,
              id: THREE.MathUtils.generateUUID(),
              shape: "rect",
              type: "solid",
              color: "#fff",
              distance: 4,
              phi: Math.PI / 2,
              theta: 0,
              intensity: 1,
              rotation: 0,
              scale: 2,
              scaleX: 1,
              scaleY: 1,
              target: [0, 0, 0],
              visible: true,
              solo: false,
              opacity: 1,
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <ul className="m-0 p-2 flex flex-col gap-1">
        {lights.map((light) => (
          <LightListItem key={light.id} light={light} />
        ))}
      </ul>
    </div>
  );
}


