import { PlusIcon } from "@heroicons/react/24/outline";
import * as THREE from "three";

import {
  Camera,
  Light,
  cameraAtomsAtom,
  camerasAtom,
  lightAtomsAtom,
  lightsAtom,
  selectedCameraAtom,
} from "../../store";
import { LightListItem } from "./LightListItem";
import { CameraListItem } from "./CameraListItem";
import { useAtomValue, useSetAtom } from "jotai";

export function Outliner() {
  const lightAtoms = useAtomValue(lightAtomsAtom);
  const setLights = useSetAtom(lightsAtom);
  const addLight = (light: Light) => setLights((lights) => [...lights, light]);

  const cameraAtoms = useAtomValue(cameraAtomsAtom);
  const setCameras = useSetAtom(camerasAtom);
  const currentCamera = useAtomValue(selectedCameraAtom);
  const addCamera = (camera: Camera) =>
    setCameras((cameras) => [...cameras, camera]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="uppercase font-light text-xs tracking-widest text-gray-300">
          Cameras
        </h2>
        <button
          className="rounded p-1 -m-1 hover:bg-white/20 transition-colors"
          onClick={() => {
            addCamera({
              ...currentCamera,
              name: `Camera ${String.fromCharCode(cameraAtoms.length + 65)}`,
              id: THREE.MathUtils.generateUUID(),
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <ul className="m-0 p-2 flex flex-col gap-1">
        {cameraAtoms.map((cameraAtom, index) => (
          <CameraListItem
            key={cameraAtom.toString()}
            index={index}
            cameraAtom={cameraAtom}
          />
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
              name: `Light ${String.fromCharCode(lightAtoms.length + 65)}`,
              id: THREE.MathUtils.generateUUID(),
              shape: "rect",
              type: "scrim",
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
              selected: false,
              opacity: 1,
              animate: false,
              lightDistance: 0.3,
              lightPosition: { x: 0, y: 0 },
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <ul className="m-0 p-2 flex flex-col flex-1 gap-1">
        {lightAtoms.map((lightAtom) => (
          <LightListItem key={lightAtom.toString()} lightAtom={lightAtom} />
        ))}
      </ul>
    </div>
  );
}
