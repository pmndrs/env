import * as THREE from "three";
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Camera = {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
};
type BaseLight = {
  id: string;
  name: string;
  shape: "rect" | "circle" | "ring";
  intensity: number;
  distance: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  phi: number;
  theta: number;
  target: [number, number, number];
  visible: boolean;
  solo: boolean;
  opacity: number;
};
type SolidLight = BaseLight & {
  type: "solid";
  color: string;
};
type GradientLight = BaseLight & {
  type: "gradient";
  colorA: string;
  colorB: string;
  contrast: number;
  axes: "x" | "y" | "z";
};
type NoiseLight = BaseLight & {
  type: "noise";
  algorithm: "perlin" | "simplex" | "cell" | "curl";
  colorA: string;
  colorB: string;
  colorC: string;
  colorD: string;
  noiseScale: number;
  noiseType: "perlin" | "simplex" | "cell" | "curl";
};
type TextureLight = BaseLight & {
  type: "texture";
  map: THREE.Texture;
};
export type Light = SolidLight | GradientLight | NoiseLight | TextureLight;
type State = {
  mode: "scene" | "code" | "hdri";
  setMode: (mode: State["mode"]) => void;
  modelUrl: string;
  isSolo: boolean;
  textureMaps: THREE.Texture[];
  cameras: Camera[];
  selectedCameraId: string;
  lights: Light[];
  selectedLightId: string | null;
  setTextureMaps: (maps: THREE.Texture[]) => void;
  setSelectedCameraId: (id: string) => void;
  resetSelectedCamera: () => void;
  updateSelectedCamera: (camera: Partial<Camera>) => void;
  addCamera: (camera: Camera) => void;
  setSelectedLightId: (id: string) => void;
  clearSelectedLight: () => void;
  addLight: (light: Light) => void;
  updateLight: (light: Partial<Light>) => void;
  setLightVisibleById: (id: string, visible: boolean) => void;
  toggleLightVisibilityById: (id: string) => void;
  duplicateLightById: (id: string) => void;
  removeLightById: (id: string) => void;
  removeSelectedLight: () => void;
  duplicateSelectedLight: () => void;
  toggleSoloLightById: (id: string) => void;
};
export const useStore = create<State>()(
  persist(
    immer(
      (set, get) =>
        ({
          mode: "scene",
          setMode: (mode) => set({ mode }),
          modelUrl: "/911-transformed.glb",
          isSolo: false,
          textureMaps: [],
          setTextureMaps: (maps: THREE.Texture[]) =>
            set((state) => void (state.textureMaps = maps)),
          cameras: [
            {
              id: "default",
              name: "Default",
              position: [0, 0, 5],
              rotation: [0, 0, 0],
            },
          ],
          selectedCameraId: "default",
          setSelectedCameraId: (id: string) => set({ selectedCameraId: id }),
          resetSelectedCamera: () => {
            set({ selectedCameraId: "default" });
          },
          addCamera: (camera: Camera) =>
            set((state) => void state.cameras.push(camera)),

          updateSelectedCamera: (camera: Partial<Camera>) =>
            set((state) => ({
              cameras: state.cameras.map((c: Camera) =>
                c.id === get().selectedCameraId ? { ...c, ...camera } : c
              ),
            })),
          lights: [
            {
              name: `Light A`,
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
            },
          ],
          selectedLightId: null,
          setSelectedLightId: (id: string) => set({ selectedLightId: id }),
          clearSelectedLight: () => {
            set({ selectedLightId: null });
          },
          addLight: (light: Light) =>
            set((state) => ({
              lights: [...state.lights, light],
            })),
          updateLight: (light: Partial<Light>) =>
            set((state) => ({
              lights: state.lights.map((l: Light) =>
                l.id === light.id ? { ...l, ...light } : l
              ),
            })),
          setLightVisibleById: (id: string, visible: boolean) => {
            const light = get().lights.find((l) => l.id === id);
            if (light) {
              set((state) => {
                const light = state.lights.find((l: Light) => l.id === id);
                if (light) {
                  light.visible = visible;
                }
              });
            }
          },
          toggleLightVisibilityById: (id: string) => {
            const state = get();
            const light = state.lights.find((l) => l.id === id);
            if (light) {
              state.setLightVisibleById(id, !light.visible);
            }
          },
          duplicateLightById: (id: string) => {
            const state = get();
            const light = state.lights.find((l) => l.id === id);
            if (light) {
              const newLight = {
                ...light,
                id: THREE.MathUtils.generateUUID(),
                name: `${light.name} (copy)`,
              };
              state.addLight(newLight);
            }
          },
          removeLightById: (id: string) => {
            const state = get();
            const light = state.lights.find((l) => l.id === id);
            if (light) {
              set((state) => ({
                lights: state.lights.filter((l) => l.id !== id),
                selectedLightId:
                  state.selectedLightId === id ? null : state.selectedLightId,
              }));
            }
          },
          removeSelectedLight: () => {
            const state = get();
            if (state.selectedLightId) {
              state.removeLightById(state.selectedLightId);
            }
          },
          duplicateSelectedLight: () => {
            const state = get();
            if (state.selectedLightId) {
              state.duplicateLightById(state.selectedLightId);
            }
          },
          toggleSoloLightById: (id: string) => {
            set((state) => {
              const light = state.lights.find((l) => l.id === id);
              if (light) {
                light.solo = !light.solo;
              }

              // Check if any lights are soloed
              const soloed = state.lights.some((l) => l.solo);
              if (soloed) {
                // If so, make all lights invisible except the soloed ones
                state.lights.forEach((l) => (l.visible = l.solo));
                state.isSolo = true;
              } else {
                // If not, make all lights visible
                state.lights.forEach((l) => (l.visible = true));
                state.isSolo = false;
              }
            });
          },
        } as State)
    ),
    {
      name: "env-storage",
      version: 1,
      getStorage: () => localStorage,
    }
  )
);
