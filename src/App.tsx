import {
  CameraIcon,
  EyeSlashIcon,
  FlagIcon,
  LightBulbIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { EyeIcon as EyeFilledIcon } from "@heroicons/react/24/solid";
import {
  BakeShadows,
  Bounds,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  shaderMaterial,
  useGLTF,
  View,
} from "@react-three/drei";
import { applyProps, Canvas, extend, useThree } from "@react-three/fiber";
import clsx from "clsx";
import { Color, Depth, LayerMaterial } from "lamina";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import create from "zustand";
import { immer } from "zustand/middleware/immer";
import * as ContextMenu from "@radix-ui/react-context-menu";

type Look = {
  id: string;
  name: string;
};

type Light = {
  id: string;
  name: string;
  shape: "rect" | "circle" | "ring";
  color: string;
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
};

type State = {
  lights: Light[];
  selectedLightId: string | null;
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
};

const useStore = create(
  immer<State>((set, get) => ({
    lights: [
      {
        name: `Light A`,
        id: THREE.MathUtils.generateUUID(),
        shape: "rect",
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
  }))
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
  const lights = useStore((state) => state.lights);
  const selectedLightId = useStore((state) => state.selectedLightId);
  const removeSelectedLight = useStore((state) => state.removeSelectedLight);
  const duplicateSelectedLight = useStore(
    (state) => state.duplicateSelectedLight
  );

  useKeyPress("x", () => removeSelectedLight());
  useKeyPress("d", () => duplicateSelectedLight());

  const [{ background, backgroundColor }] = useControls(
    () => ({
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
    }),
    [lights, selectedLightId]
  );

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
        <ScenePreview
          background={background}
          backgroundColor={backgroundColor}
        />
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

function Porsche(props: any) {
  const {
    scene,
    // @ts-ignore
    nodes,
    // @ts-ignore
    materials,
  } = useGLTF("/911-transformed.glb");
  useMemo(() => {
    Object.values(nodes).forEach(
      (node: any) =>
        node.isMesh && (node.receiveShadow = node.castShadow = true)
    );
    applyProps(materials.rubber, {
      color: "#222",
      roughness: 0.6,
      roughnessMap: null,
      normalScale: [4, 4],
    });
    applyProps(materials.window, {
      color: "black",
      roughness: 0,
      clearcoat: 0.1,
    });
    applyProps(materials.coat, {
      envMapIntensity: 4,
      roughness: 0.5,
      metalness: 1,
    });
    applyProps(materials.paint, {
      roughness: 0.5,
      metalness: 0.8,
      color: "#555",
      envMapIntensity: 2,
    });
  }, [nodes, materials]);
  return <primitive object={scene} {...props} />;
}

function Outliner() {
  const lights = useStore((state) => state.lights);
  const addLight = useStore((state) => state.addLight);

  return (
    <div>
      <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
        Looks
      </h2>
      <ul className="m-0 p-2 flex flex-col gap-1">
        <LookListItem id="default" name="Default" />
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
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      <ul className="m-0 p-2 flex flex-col gap-1">
        {lights.map((light) => (
          <LightListItem key={light.id} {...light} />
        ))}
      </ul>
    </div>
  );
}

const CubeMapMaterialImpl = shaderMaterial(
  {
    map: new THREE.CubeTexture(),
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
  `
    precision mediump float;
    
    varying vec2 vUv;
    uniform samplerCube map;
    
    #define PI 3.14159
    
    void main() {
      vec2 coord = vUv * 2.0 + vec2(-1.0, -1.0);
      
      float a = coord.x * PI;
      float b = coord.y * PI * 0.5;
      
      vec3 rayDirection = vec3(
        sin(a) * cos(b),
        sin(b),
        cos(a) * cos(b)
      );
      
      vec3 color = vec3(textureCube(map, rayDirection));

      gl_FragColor = vec4(color, 1.0);

      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }
  `
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
      // map={texture}
      side={THREE.DoubleSide}
    />
  );
}

function EnvMapPlane({ texture, ...props }: { texture: THREE.Texture }) {
  return (
    <mesh {...props}>
      <planeGeometry args={[2, 1, 1, 1]} />
      <CubeMaterial map={texture} />
    </mesh>
  );
}

function ScenePreview({
  background,
  backgroundColor,
}: {
  background: boolean;
  backgroundColor: string;
}) {
  const [texture, setTexture] = useState(() => new THREE.Texture());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const view1Ref = useRef<HTMLDivElement | null>(null);
  const view2Ref = useRef<HTMLDivElement | null>(null);

  const lights = useStore((state) => state.lights);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full overflow-hidden relative"
    >
      <div ref={view1Ref} className="w-full h-full" />
      <div ref={view2Ref} className="w-full h-full" />
      <Canvas
        shadows
        dpr={[1, 2]}
        eventSource={containerRef as React.MutableRefObject<HTMLDivElement>}
        className="!absolute top-0 left-0 pointer-events-none w-full h-full"
      >
        {/* @ts-ignore */}
        <View
          index={1}
          track={view1Ref as React.MutableRefObject<HTMLDivElement>}
        >
          <PerspectiveCamera makeDefault position={[2, 2, 2]} near={0.001} />

          <SaveBackgroundTexture setTexture={setTexture} />

          <BakeShadows />

          <Porsche
            scale={1.6}
            position={[-0.5, 1, 0]}
            rotation={[0, Math.PI / 5, 0]}
          />
          <ContactShadows
            resolution={1024}
            frames={1}
            position={[0, 0, 0]}
            scale={20}
            blur={3}
            opacity={1}
            far={10}
          />

          <Perf
            minimal
            position="bottom-right"
            style={{ position: "absolute" }}
          />
          <OrbitControls />
          <Environment background={background} resolution={2048}>
            {lights.map(
              ({
                id,
                color,
                distance,
                phi,
                theta,
                intensity,
                shape,
                scale,
                scaleX,
                scaleY,
                visible,
              }) => (
                <Lightformer
                  key={id}
                  visible={visible}
                  form={shape}
                  intensity={intensity}
                  color={color}
                  position={new THREE.Vector3().setFromSphericalCoords(
                    distance,
                    phi,
                    theta
                  )}
                  scale={[scale * scaleX, scale * scaleY, scale]}
                  target={[0, 0, 0]}
                />
              )
            )}
            <mesh scale={100}>
              <sphereGeometry args={[1, 64, 64]} />
              <LayerMaterial side={THREE.BackSide}>
                <Color color="#444" alpha={1} mode="normal" />
                <Depth
                  colorA={backgroundColor}
                  colorB="black"
                  alpha={0.5}
                  mode="normal"
                  near={0}
                  far={300}
                  origin={[100, 100, 100]}
                />
              </LayerMaterial>
            </mesh>
          </Environment>
        </View>

        {/* @ts-ignore */}
        <View
          index={2}
          track={view2Ref as React.MutableRefObject<HTMLDivElement>}
        >
          <Bounds fit clip observe damping={6} margin={0.5}>
            <EnvMapPlane texture={texture} />
          </Bounds>
        </View>
      </Canvas>
    </div>
  );
}

function SaveBackgroundTexture({
  setTexture,
}: {
  setTexture: (texture: THREE.Texture) => void;
}) {
  const backgroundTexture = useThree((state) => state.scene.background);
  useEffect(() => {
    if (backgroundTexture instanceof THREE.Texture) {
      setTexture(backgroundTexture);
    }
  }, [backgroundTexture]);
  return null;
}

function LookListItem({ id, name }: Look) {
  const selectedLookId = id;
  return (
    <li
      role="button"
      className={clsx(
        "group flex list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
        selectedLookId === id && "bg-white/20",
        selectedLookId !== id && "hover:bg-white/10"
      )}
    >
      <CameraIcon className="w-4 h-4 text-green-400" />
      <input
        type="checkbox"
        hidden
        readOnly
        checked={selectedLookId === id}
        className="peer"
      />

      <span className="flex-1 text-xs font-mono text-gray-300">{name}</span>
    </li>
  );
}

function LightListItem({
  id,
  name,
  visible,
  shape,
  intensity,
  color,
  distance,
  phi,
  theta,
  scale,
  scaleX,
  scaleY,
}: Light) {
  const selectedLightId = useStore((state) => state.selectedLightId);
  const toggleLightVisibilityById = useStore(
    (state) => state.toggleLightVisibilityById
  );
  const setSelectedLightId = useStore((state) => state.setSelectedLightId);
  const clearSelectedLight = useStore((state) => state.clearSelectedLight);
  const updateLight = useStore((state) => state.updateLight);
  const duplicateLightById = useStore((state) => state.duplicateLightById);
  const removeLightById = useStore((state) => state.removeLightById);

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
        [`color ~${id}`]: {
          label: "Color",
          value: color ?? "#fff",
          onChange: (v) => updateLight({ id, color: v }),
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
      };
    }
  }, [
    selectedLightId,
    id,
    name,
    shape,
    intensity,
    color,
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
          <LightBulbIcon className="w-4 h-4 text-yellow-400" />
          <input
            type="checkbox"
            hidden
            readOnly
            checked={selectedLightId === id}
            className="peer"
          />

          <span className="flex-1 text-xs font-mono text-gray-300 text-ellipsis overflow-hidden whitespace-nowrap">
            {name}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-white opacity-0 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity"
          >
            <FlagIcon className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLightVisibilityById(id);
            }}
            className={clsx(
              "text-white opacity-0 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity",
              !visible && "opacity-40"
            )}
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
