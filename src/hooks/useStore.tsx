import * as THREE from "three";
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Easing =
  | "ease"
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "in-out-sine"
  | "in-out-quadratic"
  | "in-out-cubic"
  | "fast-out-slow-in"
  | "in-out-back";

export const Easings: Record<Easing, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1],
  linear: [0, 0, 1, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  "in-out-sine": [0.45, 0.05, 0.55, 0.95],
  "in-out-quadratic": [0.46, 0.03, 0.52, 0.96],
  "in-out-cubic": [0.65, 0.05, 0.36, 1],
  "fast-out-slow-in": [0.4, 0, 0.2, 1],
  "in-out-back": [0.68, -0.55, 0.27, 1.55],
};

export type Signal = {
  id: string;
  name: string;
  targetId: string;
  property: "position" | "rotation" | "scale";
  axis: "x" | "y" | "z";
  start: number;
  end: number;
  animation: "loop" | "pingpong" | "once" | "additive";
  easing: Easing;
  duration: number;
};

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
  scale: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  distance: number;
  phi: number;
  theta: number;
  target: [number, number, number];
  visible: boolean;
  solo: boolean;
  opacity: number;
  animate: boolean;
  animationSpeed?: number;
  animationRotationIntensity?: number;
  animationFloatIntensity?: number;
  animationFloatingRange?: [number, number];
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
  signals: Signal[];
  addSignal: (signal: Signal) => void;
  removeSignalById: (id: string) => void;
  updateSignal: (signal: Partial<Signal>) => void;
  getSignalsForTarget: (targetId: string) => Signal[];
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
          signals: [
            {
              id: THREE.MathUtils.generateUUID(),
              name: "Signal 2",
              targetId: "light-1",
              property: "position",
              axis: "x",
              start: 0,
              end: 1,
              animation: "pingpong",
              easing: "linear",
              duration: 3,
            },
          ],
          addSignal: (signal: Signal) =>
            set((state) => void state.signals.push(signal)),
          removeSignalById: (id: string) =>
            set((state) => ({
              signals: state.signals.filter((s) => s.id !== id),
            })),
          updateSignal: (signal: Partial<Signal>) =>
            set((state) => ({
              signals: state.signals.map((s: Signal) =>
                s.id === signal.id ? { ...s, ...signal } : s
              ),
            })),
          getSignalsForTarget: (targetId: string) =>
            get().signals.filter((s) => s.targetId === targetId),
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
              id: "light-1",
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
              animate: false,
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
