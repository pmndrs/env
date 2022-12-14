import {
  CameraIcon,
  EyeSlashIcon,
  FlagIcon,
  LightBulbIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  EyeIcon as EyeFilledIcon,
  FlagIcon as FlagFilledIcon,
} from "@heroicons/react/24/solid";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  AccumulativeShadows,
  Bounds,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  RandomizedLight,
  shaderMaterial,
  useGLTF,
  useTexture,
  View,
} from "@react-three/drei";
import { Canvas, extend, useThree } from "@react-three/fiber";
import clsx from "clsx";
import { Color, Gradient, LayerMaterial, Noise, Texture } from "lamina";
import { button, Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Lightformer } from "./Lightformer";
import convertCubemapToEquirectangular, {
  fragmentShader,
  vertexShader,
} from "./convertCubemapToEquirectangular";

type Camera = {
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

type Light = SolidLight | GradientLight | NoiseLight | TextureLight;

type State = {
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

const useStore = create<State>()(
  persist(
    immer(
      (set, get) =>
        ({
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

function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    function keyDownHandler(event: KeyboardEvent) {
      if (event.key === targetKey) {
        handler();
      }
    }
    window.addEventListener("keypress", keyDownHandler);
    return () => {
      window.removeEventListener("keypress", keyDownHandler);
    };
  }, []);
}

export default function App() {
  return (
    <div
      style={{
        gridTemplateAreas: `
            "outliner scene properties"
            "outliner scene properties"
          `,
      }}
      className="bg-neutral-800 grid grid-cols-[250px_1fr_340px] grid-rows-[3fr_2fr] w-full h-full overflow-hidden gap-4 p-4 text-white"
    >
      <div
        style={{ gridArea: "outliner" }}
        className="bg-neutral-900 rounded-lg"
      >
        <Outliner />
      </div>

      <div
        style={{
          gridArea: "scene",
          backgroundSize: "20px 20px",
          backgroundImage:
            "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
        }}
        className="bg-neutral-900 rounded-lg overflow-hidden"
      >
        <ScenePreview />
      </div>

      <div
        style={{ gridArea: "properties" }}
        className="bg-neutral-900 rounded-lg overflow-y-auto"
      >
        <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
          Properties
        </h2>
        <div className="p-2">
          <Leva
            neverHide
            fill
            flat
            titleBar={false}
            theme={{
              colors: {
                elevation1: "transparent",
                elevation2: "transparent",
                elevation3: "rgba(255, 255, 255, 0.1)",
              },
              sizes: {
                rootWidth: "100%",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Model({ debugMaterial, ...props }: any) {
  const modelUrl = useStore((state) => state.modelUrl);
  const {
    scene,
    // @ts-ignore
    nodes,
    // @ts-ignore
    materials,
  } = useGLTF(modelUrl);
  useMemo(() => {
    Object.values(nodes).forEach(
      (node: any) =>
        node.isMesh && (node.receiveShadow = node.castShadow = true)
    );
    const material = new THREE.MeshPhysicalMaterial({
      color: "black",
      roughness: 0,
    });
    Object.values(nodes).forEach((node: any) => {
      if (node.isMesh && debugMaterial) {
        node.userData.material = node.material;
        node.material = material;
      } else {
        node.material = node.userData.material || node.material;
      }
    });
  }, [nodes, materials, debugMaterial]);
  return <primitive object={scene} {...props} />;
}

function Outliner() {
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

const CubeMapMaterialImpl = shaderMaterial(
  {
    map: new THREE.CubeTexture(),
  },
  vertexShader,
  fragmentShader
);

// @ts-ignore
CubeMapMaterialImpl.key = THREE.MathUtils.generateUUID();

extend({ CubeMapMaterial: CubeMapMaterialImpl });

type CubeMapMaterialType = JSX.IntrinsicElements["shaderMaterial"];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cubeMapMaterial: CubeMapMaterialType;
    }
  }
}

function CubeMaterial({ map }: { map: THREE.Texture }) {
  return (
    <cubeMapMaterial
      key={(CubeMapMaterialImpl as any).key}
      attach="material"
      // @ts-ignore
      map={map}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

function EnvMapPlane({ texture, ...props }: { texture: THREE.Texture }) {
  return (
    <mesh {...props} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[2, 1, 1, 1]} />
      <CubeMaterial map={texture} />
    </mesh>
  );
}

function DownloadHDRI({ texture }: { texture: THREE.CubeTexture }) {
  const renderer = useThree((state) => state.gl);
  const selectedLightId = useStore((state) => state.selectedLightId);
  useControls(
    {
      "Download Env Map": button(
        () => {
          const width = 2048;
          const height = 1024;
          const fbo = convertCubemapToEquirectangular(
            texture,
            renderer,
            width,
            height
          );
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            const pixels = new Uint8Array(width * height * 4);
            renderer.readRenderTargetPixels(fbo, 0, 0, width, height, pixels);
            const imageData = new ImageData(
              new Uint8ClampedArray(pixels),
              width,
              height
            );
            ctx.putImageData(imageData, 0, 0);
            const link = document.createElement("a");
            link.download = "envmap.png";
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
          }
        },
        {
          disabled: selectedLightId !== null,
        }
      ),
    },
    [selectedLightId, texture]
  );

  return null;
}

function ScenePreview() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const view1Ref = useRef<HTMLDivElement | null>(null);
  const view2Ref = useRef<HTMLDivElement | null>(null);

  const lights = useStore((state) => state.lights);
  const cameras = useStore((state) => state.cameras);

  const selectedLightId = useStore((state) => state.selectedLightId);
  const selectedCameraId = useStore((state) => state.selectedCameraId);
  const updateSelectedCamera = useStore((state) => state.updateSelectedCamera);

  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  const [
    {
      background,
      envMap,
      backgroundColor,
      ambientLightIntensity,
      debugMaterial,
      shadows,
      autoRotate,
    },
  ] = useControls(
    () => ({
      envMap: {
        label: "Show Env Map",
        value: true,
        render: () => selectedLightId === null,
      },
      background: {
        label: "Show BG",
        value: true,
        render: () => selectedLightId === null,
      },
      backgroundColor: {
        label: "BG Color",
        value: "#0000ff",
        render: () => selectedLightId === null,
      },
      ambientLightIntensity: {
        label: "Ambient Intensity",
        value: 0.5,
        min: 0,
        max: 3,
        render: () => selectedLightId === null,
      },
      debugMaterial: {
        label: "Debug Material",
        value: false,
        render: () => selectedLightId === null,
      },
      shadows: {
        label: "Shadows",
        value: true,
        render: () => selectedLightId === null,
      },
      autoRotate: {
        label: "Auto Rotate",
        value: false,
        render: () => selectedLightId === null,
      },
      Screenshot: button(
        () => {
          const canvas = document.querySelector("canvas");
          if (canvas) {
            const link = document.createElement("a");
            link.download = "screenshot.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
          }
        },
        {
          disabled: selectedLightId !== null,
        }
      ),
      "Upload Model": button(
        () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".glb";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = e.target?.result;
                if (data) {
                  const blob = new Blob([data], { type: "model/gltf-binary" });
                  const url = URL.createObjectURL(blob);
                  useGLTF.preload(url);
                  useStore.setState({ modelUrl: url });
                }
              };
              reader.readAsArrayBuffer(file);
            }
          };
          input.click();
        },
        {
          disabled: selectedLightId !== null,
        }
      ),
    }),
    [selectedLightId]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full overflow-hidden relative"
    >
      <div ref={view1Ref} className="w-full h-full" />
      {envMap && <div ref={view2Ref} className="w-full h-full" />}
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          eventSource={containerRef as React.MutableRefObject<HTMLDivElement>}
          className="!absolute top-0 left-0 pointer-events-none w-full h-full"
          gl={{ preserveDrawingBuffer: true }}
        >
          <LoadTextureMaps />

          <DownloadHDRI texture={texture} />

          {/* @ts-ignore */}
          <View
            index={1}
            track={view1Ref as React.MutableRefObject<HTMLDivElement>}
          >
            {cameras.map((camera) => (
              <PerspectiveCamera
                key={camera.id}
                makeDefault={camera.id === selectedCameraId}
                position={camera.position}
                rotation={camera.rotation}
                near={0.001}
              />
            ))}

            <SaveBackgroundTexture setTexture={setTexture} />

            <Model debugMaterial={debugMaterial} />

            <AccumulativeShadows
              temporal
              resolution={1024}
              frames={30}
              color={background ? backgroundColor : "#000000"}
              alphaTest={0.65}
              opacity={1}
              scale={20}
              position={[0, 0, 0]}
              visible={shadows}
            >
              <RandomizedLight
                amount={10}
                radius={2}
                ambient={0.5}
                bias={0.001}
                position={[5, 8, -10]}
              />
            </AccumulativeShadows>

            <Perf
              minimal
              position="bottom-right"
              style={{ position: "absolute" }}
            />
            <OrbitControls
              ref={controlsRef}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              onEnd={(e) => {
                if (controlsRef.current) {
                  updateSelectedCamera({
                    position: controlsRef.current.object.position.toArray(),
                    rotation: controlsRef.current.object.rotation.toArray() as [
                      number,
                      number,
                      number
                    ],
                  });
                }
              }}
              enableDamping={false}
            />

            <ambientLight intensity={ambientLightIntensity} />

            <Environment background={background} resolution={2048}>
              <color attach="background" args={[backgroundColor]} />
              {lights.map((light) => {
                const {
                  id,
                  distance,
                  phi,
                  theta,
                  intensity,
                  shape,
                  scale,
                  scaleX,
                  scaleY,
                  visible,
                  rotation,
                  opacity,
                } = light;
                return (
                  <Lightformer
                    key={id}
                    visible={visible}
                    form={shape}
                    intensity={intensity}
                    position={new THREE.Vector3().setFromSphericalCoords(
                      distance,
                      phi,
                      theta
                    )}
                    rotation={[rotation, 0, 0]}
                    scale={[scale * scaleX, scale * scaleY, scale]}
                    target={[0, 0, 0]}
                  >
                    <LayerMaterial
                      color={new THREE.Color(0xffffff).multiplyScalar(3)}
                      alpha={opacity}
                      transparent
                    >
                      <LightformerLayers light={light} />
                    </LayerMaterial>
                  </Lightformer>
                );
              })}
            </Environment>
          </View>

          {envMap && (
            <>
              {/* @ts-ignore */}
              <View
                index={2}
                track={view2Ref as React.MutableRefObject<HTMLDivElement>}
              >
                <Bounds fit clip observe damping={6} margin={0.5}>
                  <EnvMapPlane texture={texture} />
                </Bounds>
              </View>
            </>
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}

function LoadTextureMaps() {
  const setTextureMaps = useStore((state) => state.setTextureMaps);

  useTexture({ checkerboard: "/textures/checkerboard.png" }, (textures) => {
    if (Array.isArray(textures)) {
      textures.forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const url = new URL(texture.source.data.currentSrc);
        texture.name = url.pathname.split("/").pop() as string;
        texture.needsUpdate = true;
      });
      setTextureMaps(textures);
    } else {
      setTextureMaps([textures]);
    }
  });

  return null;
}

function SaveBackgroundTexture({
  setTexture,
}: {
  setTexture: (texture: THREE.CubeTexture) => void;
}) {
  const backgroundTexture = useThree((state) => state.scene.background);
  useEffect(() => {
    if (backgroundTexture instanceof THREE.CubeTexture) {
      setTexture(backgroundTexture);
    }
  }, [backgroundTexture]);
  return null;
}

function CameraListItem({ index, camera }: { index: number; camera: Camera }) {
  const { id, name } = camera;
  const selectedCameraId = useStore((state) => state.selectedCameraId);
  const setSelectedCameraId = useStore((state) => state.setSelectedCameraId);

  const key = String(index + 1);
  useKeyPress(key, () => setSelectedCameraId(id));

  return (
    <li
      role="button"
      className={clsx(
        "group flex relative list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
        selectedCameraId === id && "bg-white/20",
        selectedCameraId !== id && "hover:bg-white/10"
      )}
      onClick={() => {
        if (selectedCameraId !== id) {
          setSelectedCameraId(id);
        }
      }}
    >
      <CameraIcon className="w-4 h-4 text-green-400" />
      <input
        type="checkbox"
        hidden
        readOnly
        checked={selectedCameraId === id}
        className="peer"
      />

      <span className="flex-1 text-xs font-mono text-gray-300">{name}</span>

      <kbd
        className={clsx(
          "absolute right-1.5 top-1.5 text-xs font-mono text-gray-300 bg-white/10 w-5 h-5 flex items-center justify-center rounded",
          selectedCameraId === id && "bg-white text-gray-900"
        )}
      >
        {key}
      </kbd>
    </li>
  );
}

function LightListItem({ light }: { light: Light }) {
  const {
    id,
    type,
    name,
    visible,
    solo,
    shape,
    intensity,
    distance,
    phi,
    theta,
    scale,
    scaleX,
    scaleY,
    opacity,
  } = light;

  const selectedLightId = useStore((state) => state.selectedLightId);
  const toggleLightVisibilityById = useStore(
    (state) => state.toggleLightVisibilityById
  );
  const setSelectedLightId = useStore((state) => state.setSelectedLightId);
  const clearSelectedLight = useStore((state) => state.clearSelectedLight);
  const updateLight = useStore((state) => state.updateLight);
  const duplicateLightById = useStore((state) => state.duplicateLightById);
  const removeLightById = useStore((state) => state.removeLightById);
  const toggleSoloLightById = useStore((state) => state.toggleSoloLightById);
  const isSolo = useStore((state) => state.isSolo);
  const textureMaps = useStore((state) => state.textureMaps);

  useControls(() => {
    if (selectedLightId !== id) {
      return {};
    } else {
      return {
        [`name ~${id}`]: {
          label: "Name",
          value: name ?? "Light",
          onChange: (v) => updateLight({ id, name: v }),
        },
        [`shape ~${id}`]: {
          label: "Shape",
          value: shape ?? "rect",
          options: ["rect", "ring", "circle"],
          onChange: (v) => updateLight({ id, shape: v }),
        },
        [`intensity ~${id}`]: {
          label: "Intensity",
          value: intensity,
          step: 0.1,
          min: 0,
          onChange: (v) => updateLight({ id, intensity: v }),
        },
        [`opacity ~${id}`]: {
          label: "Opacity",
          value: opacity ?? 1.0,
          step: 0.1,
          min: 0,
          max: 1,
          onChange: (v) => updateLight({ id, opacity: v }),
        },
        [`scaleMultiplier ~${id}`]: {
          label: "Scale Multiplier",
          value: scale ?? 1.0,
          step: 0.1,
          min: 0,
          max: 10,
          onChange: (v) => updateLight({ id, scale: v }),
        },
        [`scale ~${id}`]: {
          label: "Scale",
          value: [scaleX, scaleY] ?? [1.0, 1.0],
          step: 0.1,
          min: 0,
          joystick: false,
          onChange: (v) => updateLight({ id, scaleX: v[0], scaleY: v[1] }),
        },
        [`distance ~${id}`]: {
          label: "Distance",
          value: distance ?? 1.0,
          step: 0.1,
          min: 0,
          onChange: (v) => updateLight({ id, distance: v }),
        },
        [`phi ~${id}`]: {
          label: "Phi",
          value: phi ?? 1.0,
          step: 0.1,
          min: 0,
          max: Math.PI,
          onChange: (v) => updateLight({ id, phi: v }),
        },
        [`theta ~${id}`]: {
          label: "Theta",
          value: theta ?? 1.0,
          step: 0.1,
          min: 0,
          max: Math.PI * 2,
          onChange: (v) => updateLight({ id, theta: v }),
        },

        [`type ~${id}`]: {
          label: "Type",
          value: type ?? "#fff",
          options: ["solid", "gradient", "noise", "texture"],
          onChange: (v) => updateLight({ id, type: v }),
        },

        ...(() => {
          if (light.type === "solid") {
            return {
              [`color ~${id}`]: {
                label: "Color",
                value: light.color ?? "#fff",
                onChange: (v) => updateLight({ id, color: v }),
              },
            };
          } else if (light.type === "gradient") {
            return {
              [`colorA ~${id}`]: {
                label: "Color A",
                value: light.colorA ?? "#f5c664",
                onChange: (v) => updateLight({ id, colorA: v }),
              },
              [`colorB ~${id}`]: {
                label: "Color B",
                value: light.colorB ?? "#ff0000",
                onChange: (v) => updateLight({ id, colorB: v }),
              },
              [`contrast ~${id}`]: {
                label: "Contrast",
                value: light.contrast ?? 1,
                onChange: (v) => updateLight({ id, contrast: v }),
              },
              [`axes ~${id}`]: {
                label: "Axes",
                value: light.axes ?? "x",
                options: ["x", "y"],
                onChange: (v) => updateLight({ id, axes: v }),
              },
            };
          } else if (light.type === "noise") {
            return {
              [`colorA ~${id}`]: {
                label: "Color A",
                value: light.colorA ?? "#f5c664",
                onChange: (v) => updateLight({ id, colorA: v }),
              },
              [`colorB ~${id}`]: {
                label: "Color B",
                value: light.colorB ?? "#ff0000",
                onChange: (v) => updateLight({ id, colorB: v }),
              },
              [`colorC ~${id}`]: {
                label: "Color C",
                value: light.colorB ?? "#00ff00",
                onChange: (v) => updateLight({ id, colorC: v }),
              },
              [`colorD ~${id}`]: {
                label: "Color D",
                value: light.colorD ?? "#0000ff",
                onChange: (v) => updateLight({ id, colorD: v }),
              },
              [`noiseScale ~${id}`]: {
                label: "Noise Scale",
                value: light.noiseScale ?? 1,
                min: 0,
                onChange: (v) => updateLight({ id, noiseScale: v }),
              },
              [`noiseType ~${id}`]: {
                label: "Noise Type",
                value: light.noiseType ?? "perlin",
                options: ["perlin", "simplex", "cell", "curl"],
                onChange: (v) => updateLight({ id, noiseType: v }),
              },
            };
          } else if (light.type === "texture") {
            return {
              [`map ~${id}`]: {
                label: "Map",
                value:
                  textureMaps.find((value) => light.map === value)?.name ??
                  "none",
                options: ["none", ...textureMaps.map((value) => value.name)],
                onChange: (v) => {
                  updateLight({
                    id,
                    map: textureMaps.find((map) => map.name === v),
                  });
                },
              },
            };
          } else {
            return {};
          }
        })(),
      };
    }
  }, [
    selectedLightId,
    id,
    name,
    shape,
    intensity,
    type,
    distance,
    phi,
    theta,
    scale,
    scaleX,
    scaleY,
  ]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <li
          key={id}
          role="button"
          className={clsx(
            "group flex list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
            selectedLightId === id && "bg-white/20",
            selectedLightId !== id && "hover:bg-white/10"
          )}
          onClick={() => {
            if (selectedLightId === id) {
              clearSelectedLight();
            } else {
              setSelectedLightId(id);
            }
          }}
        >
          <LightBulbIcon
            className={clsx(
              "w-4 h-4 text-yellow-400",
              !visible && "text-gray-300/50"
            )}
          />
          <input
            type="checkbox"
            hidden
            readOnly
            checked={selectedLightId === id}
            className="peer"
          />

          <span
            className={clsx(
              "flex-1 text-xs font-mono text-gray-300 text-ellipsis overflow-hidden whitespace-nowrap",
              !visible && "text-gray-300/50 line-through"
            )}
          >
            {name}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSoloLightById(id);
            }}
            className={clsx(
              "text-white opacity-40 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity",
              solo && "opacity-100"
            )}
          >
            {solo ? (
              <FlagFilledIcon className="w-4 h-4" />
            ) : (
              <FlagIcon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLightVisibilityById(id);
            }}
            className={clsx(
              "text-white opacity-40 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity",
              "disabled:cursor-not-allowed disabled:hover:opacity-0"
            )}
            disabled={isSolo && !solo}
          >
            {visible ? (
              <EyeFilledIcon className="w-4 h-4" />
            ) : (
              <EyeSlashIcon className="w-4 h-4 " />
            )}
          </button>
        </li>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="flex flex-col gap-1 bg-neutral-800 text-gray-50 font-light p-1.5 rounded-md shadow-xl">
          <ContextMenu.Item
            className="outline-none select-none rounded px-2 py-0.5 highlighted:bg-white highlighted:text-gray-900 text-sm"
            onSelect={() => duplicateLightById(id)}
          >
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Item
            className="outline-none select-none rounded px-2 py-0.5 text-white highlighted:bg-red-500 highlighted:text-white text-sm"
            onSelect={() => removeLightById(id)}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function LightformerLayers({ light }: { light: Light }) {
  if (light.type === "solid") {
    const color = new THREE.Color(light.color);
    color.multiplyScalar(light.intensity);
    return <Color color={color} />;
  } else if (light.type === "gradient") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    return (
      <Gradient
        colorA={colorA}
        colorB={colorB}
        contrast={light.contrast}
        axes={light.axes}
      />
    );
  } else if (light.type === "noise") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    const colorC = new THREE.Color(light.colorC);
    const colorD = new THREE.Color(light.colorD);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    colorC.multiplyScalar(light.intensity);
    colorD.multiplyScalar(light.intensity);
    return (
      <Noise
        colorA={colorA}
        colorB={colorB}
        colorC={colorC}
        colorD={colorD}
        type={light.noiseType}
        scale={light.noiseScale}
      />
    );
  } else if (light.type === "texture") {
    return <Texture map={light.map} />;
  } else {
    throw new Error("Unknown light type");
  }
}
