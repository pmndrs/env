import * as THREE from "three";
import { atom } from "jotai";
import { splitAtom, atomWithStorage } from "jotai/utils";

export type Camera = {
  id: string;
  name: string;
  selected: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
};

type BaseLight = {
  id: string;
  ts: number;
  name: string;

  shape: "rect" | "circle" | "ring";
  intensity: number;
  opacity: number;

  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;

  latlon: { x: number; y: number };
  target: { x: number; y: number; z: number };

  selected: boolean;
  visible: boolean;
  solo: boolean;

  animate: boolean;
  animationSpeed?: number;
  animationRotationIntensity?: number;
  animationFloatIntensity?: number;
  animationFloatingRange?: [number, number];
};

export type TextureLight = BaseLight & {
  type: "texture";
  color: string;
  map: string;
};

export type ProceduralScrimLight = BaseLight & {
  type: "procedural_scrim";
  color: string;
  lightPosition: { x: number; y: number };
  lightDistance: number;
};

export type ProceduralUmbrellaLight = BaseLight & {
  type: "procedural_umbrella";
  color: string;
  lightSides: number;
};

export type SkyGradientLight = BaseLight & {
  type: "sky_gradient";
  color: string;
  color2: string;
};

export type Light =
  | TextureLight
  | ProceduralScrimLight
  | ProceduralUmbrellaLight
  | SkyGradientLight;

export const debugAtom = atom(false);

export const modeAtom = atomWithStorage("mode", {
  scene: true,
  hdri: true,
  code: false,
});

export const activeModesAtom = atom((get) => {
  const mode = get(modeAtom);
  return Object.keys(mode).filter((key) => mode[key as keyof typeof mode]);
});

export const isLightPaintingAtom = atom(false);

export const modelUrlAtom = atom("/911-transformed.glb");

export const isCommandPaletteOpenAtom = atom(false);

export const pointerAtom = atom({
  point: new THREE.Vector3(),
  normal: new THREE.Vector3(),
});

export const lightsAtom = atomWithStorage<Light[]>("lights", [
  {
    name: `Light A`,
    id: THREE.MathUtils.generateUUID(),
    ts: Date.now(),
    shape: "rect",
    type: "procedural_scrim",
    color: "#fff",
    latlon: { x: 0, y: 0 },
    intensity: 1,
    rotation: 0,
    scale: 2,
    scaleX: 1,
    scaleY: 1,
    target: { x: 0, y: 0, z: 0 },
    selected: false,
    visible: true,
    solo: false,
    opacity: 1,
    animate: false,
    lightDistance: 0.3,
    lightPosition: { x: 0, y: 0 },
  },
]);

export const lightIdsAtom = atom((get) => get(lightsAtom).map((l) => l.id));

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

export const deselectLightsAtom = atom(null, (get, set) => {
  set(lightsAtom, (lights) =>
    lights.map((l) => ({
      ...l,
      selected: false,
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
      ...structuredClone(light),
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

export const camerasAtom = atomWithStorage<Camera[]>("cameras", [
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
