import * as THREE from "three";
import { atom } from "jotai";
import { splitAtom } from "jotai/utils";

export type Camera = {
  id: string;
  name: string;
  selected: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
};

type BaseLight = {
  id: string;
  name: string;

  shape: "rect" | "circle" | "ring";
  intensity: number;
  opacity: number;

  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  distance: number;

  phi: number;
  theta: number;
  target: [number, number, number];

  selected: boolean;
  visible: boolean;
  solo: boolean;

  animate: boolean;
  animationSpeed?: number;
  animationRotationIntensity?: number;
  animationFloatIntensity?: number;
  animationFloatingRange?: [number, number];
};

export type ScrimLight = BaseLight & {
  type: "scrim";
  color: string;
  lightPosition: { x: number; y: number };
  lightDistance: number;
};

export type TextureLight = BaseLight & {
  type: "texture";
  color: string;
  map: string;
};

export type ProceduralUmbrellaLight = BaseLight & {
  type: "procedural_umbrella";
  color: string;
  lightSides: number;
};

export type Light = ScrimLight | TextureLight | ProceduralUmbrellaLight;

export const modeAtom = atom({
  scene: true,
  hdri: true,
  code: false,
});

export const activeModesAtom = atom((get) => {
  const mode = get(modeAtom);
  return Object.keys(mode).filter((key) => mode[key as keyof typeof mode]);
});

export const modelUrlAtom = atom("/911-transformed.glb");

export const isCommandPaletteOpenAtom = atom(false);

export const lightsAtom = atom<Light[]>([
  {
    name: `Light A`,
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
    selected: false,
    visible: true,
    solo: false,
    opacity: 1,
    animate: false,
    lightDistance: 0.3,
    lightPosition: { x: 0, y: 0 },
  },
]);

export const lightAtomsAtom = splitAtom(lightsAtom);

export const isSoloAtom = atom((get) => {
  const lights = get(lightsAtom);
  return lights.length > 0 && lights.some((l) => l.solo);
});

export const isLightSelectedAtom = atom((get) => {
  const lights = get(lightsAtom);
  return lights.length > 0 && lights.some((l) => l.selected);
});

export const selectLightAtom = atom(null, (get, set, lightId: Light["id"]) => {
  set(lightsAtom, (lights) =>
    lights.map((l) => ({
      ...l,
      selected: l.id === lightId,
    }))
  );
});

export const toggleSoloAtom = atom(null, (get, set, lightId: Light["id"]) => {
  const lights = get(lightsAtom);
  const light = lights.find((l) => l.id === lightId)!;
  const isSolo = get(isSoloAtom);

  if (isSolo && light.solo) {
    set(
      lightsAtom,
      lights.map((l) => ({
        ...l,
        solo: false,
        visible: true,
      }))
    );
  } else {
    set(
      lightsAtom,
      lights.map((l) => ({
        ...l,
        solo: l.id === lightId,
        visible: l.id === lightId,
        selected: l.id === lightId,
      }))
    );
  }
});

export const toggleLightSelectionAtom = atom(
  null,
  (get, set, lightId: Light["id"]) => {
    set(lightsAtom, (lights) =>
      lights.map((l) => ({
        ...l,
        selected: l.id === lightId ? !l.selected : false,
      }))
    );
  }
);

export const duplicateLightAtom = atom(
  null,
  (get, set, lightId: Light["id"]) => {
    const lights = get(lightsAtom);
    const light = lights.find((l) => l.id === lightId)!;
    const isSolo = get(isSoloAtom);
    const newLight = {
      ...light,
      visible: isSolo ? false : light.visible,
      solo: false,
      selected: false,
      id: THREE.MathUtils.generateUUID(),
      name: `${light.name} (copy)`,
    };
    set(lightsAtom, [...lights, newLight]);
  }
);

export const deleteLightAtom = atom(null, (get, set, lightId: Light["id"]) => {
  const lights = get(lightsAtom);
  const light = lights.find((l) => l.id === lightId)!;
  const isSolo = get(isSoloAtom);

  const newLights = lights.filter((l) => l.id !== lightId);

  if (isSolo && light.solo) {
    set(
      lightsAtom,
      newLights.map((l) => ({
        ...l,
        solo: false,
        visible: true,
      }))
    );
  } else {
    set(lightsAtom, newLights);
  }
});

export const camerasAtom = atom<Camera[]>([
  {
    id: "default",
    name: "Default",
    selected: true,
    position: [0, 0, 5],
    rotation: [0, 0, 0],
  },
]);

export const cameraAtomsAtom = splitAtom(camerasAtom);

export const selectedCameraAtom = atom(
  (get) => {
    const cameras = get(camerasAtom);
    return cameras.find((c) => c.selected)!;
  },
  (get, set, value: Partial<Camera>) => {
    const cameras = get(camerasAtom);
    const selectedCamera = cameras.find((c) => c.selected)!;
    set(
      camerasAtom,
      cameras.map((c) => (c.id === selectedCamera.id ? { ...c, ...value } : c))
    );
  }
);

export const isCameraSelectedAtom = atom((get) => {
  const cameras = get(camerasAtom);
  return cameras.length > 0 && cameras.some((c) => c.selected);
});

export const toggleCameraSelectionAtom = atom(
  null,
  (get, set, cameraId: Camera["id"]) => {
    set(camerasAtom, (cameras) =>
      cameras.map((c) => ({
        ...c,
        selected: c.id === cameraId ? !c.selected : false,
      }))
    );
  }
);

export const selectCameraAtom = atom(
  null,
  (get, set, cameraId: Camera["id"]) => {
    set(camerasAtom, (cameras) =>
      cameras.map((c) => ({
        ...c,
        selected: c.id === cameraId,
      }))
    );
  }
);

export const textureMapsAtom = atom<THREE.Texture[]>([]);
