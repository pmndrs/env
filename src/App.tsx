import {
  BakeShadows,
  Bounds,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  Stats,
  useGLTF,
} from "@react-three/drei";
import { applyProps, Canvas } from "@react-three/fiber";
import { unflatten } from "flat";
import { button, Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { useCallback, useMemo, useState } from "react";
import * as THREE from "three";
import { EyeIcon, EyeSlashIcon, FlagIcon } from "@heroicons/react/24/outline";
import { EyeIcon as EyeFilledIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { LayerMaterial, Depth, Color } from "lamina";

type LightformerProps = React.ComponentPropsWithoutRef<typeof Lightformer>;

function generateTexture() {
  const width = 1024;
  const height = 512;

  const size = width * height;
  const data = new Uint8Array(4 * size);

  const s = Math.random();
  const t = Math.random();
  const u = Math.random();

  for (let i = 0; i < size; i++) {
    const color = new THREE.Color(
      Math.sin((i / size) * Math.PI * 2 * s + 0.1) * 0.5 + 0.5,
      Math.cos((i / size) * Math.PI * 2 * t + 0.24) * 0.5 + 0.5,
      Math.cos((i / size) * Math.PI * 2 * u - 0.538) * 0.5 + 0.5
    );

    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    const stride = i * 4;

    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
    data[stride + 3] = 255;
  }

  // used the buffer to create a DataTexture
  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return texture;
}

function App() {
  const [texture, setTexture] = useState(() => generateTexture());

  const regenerate = useCallback(() => setTexture(generateTexture()), []);

  const [{ background, backgroundColor }] = useControls(() => ({
    background: true,
    backgroundColor: "#0000ff",
    regenerate: button(regenerate),
    addLight: button(() => {
      setLightformers((prev) => ({
        ...prev,
        [String.fromCharCode(Object.keys(prev).length + 65)]: {
          intensity: 0.75,
          position: [5, 0, 0],
          scale: [5, 5, 1],
        },
      }));
    }),
  }));

  const [lightformers, setLightformers] = useState<
    Record<string, LightformerProps>
  >({});

  const [value] = useControls(
    () =>
      Object.fromEntries(
        Object.entries(lightformers).flatMap(([key, lightformer]) => [
          [
            `${key}.visible`,
            {
              value: lightformer.visible ?? true,
            },
          ],
          [
            `${key}.selected`,
            {
              value: lightformer.selected ?? false,
            },
          ],
          [
            `${key}.form`,
            {
              value: lightformer.form ?? "rect",
              options: ["rect", "ring", "circle"],
            },
          ],
          [
            `${key}.intensity`,
            { value: lightformer.intensity, step: 0.1, min: 0 },
          ],
          [`${key}.position`, { value: lightformer.position, step: 0.1 }],
          [
            `${key}.scale`,
            { value: lightformer.scale ?? [1, 1, 1], step: 0.1, min: 0 },
          ],
          [`${key}.color`, { value: lightformer.color ?? "#fff" }],
        ])
      ),
    [lightformers]
  );

  const _lightformers: Record<string, LightformerProps> = useMemo(
    () => unflatten(value),
    [value]
  );

  return (
    <div
      style={{
        gridTemplateAreas: `
            "outliner scene properties"
            "outliner editor properties"
          `,
      }}
      className="bg-neutral-800 grid grid-cols-[250px_1fr_300px] grid-rows-[3fr_2fr] w-full h-full overflow-hidden gap-4 p-4 text-white"
    >
      <div
        style={{ gridArea: "outliner" }}
        className="bg-neutral-900 rounded-lg"
      >
        <Outliner
          lightformers={_lightformers}
          setLightformers={setLightformers}
        />
      </div>

      <div
        style={{
          gridArea: "editor",
          backgroundSize: "20px 20px",
          backgroundImage:
            "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
        }}
        className="bg-neutral-900 rounded-lg overflow-hidden"
      >
        <EditorCanvas texture={texture} />
      </div>

      <div
        style={{ gridArea: "scene" }}
        className="bg-neutral-900 overflow-hidden rounded-lg"
      >
        <ScenePreview
          background={background}
          backgroundColor={backgroundColor}
          lightformers={_lightformers}
          texture={texture}
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
                accent1: "#666",
                accent2: "#333",
                accent3: "#666",
                highlight1: "#fff",
                highlight2: "#aaa",
                highlight3: "#fff",
                vivid1: "#fff",
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
  const { scene, nodes, materials } = useGLTF("/911-transformed.glb");
  useMemo(() => {
    Object.values(nodes).forEach(
      (node) => node.isMesh && (node.receiveShadow = node.castShadow = true)
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

export default App;

function Outliner({
  lightformers,
  setLightformers,
}: {
  lightformers: Record<string, LightformerProps>;
  setLightformers: (...args: any) => void;
}) {
  return (
    <div>
      <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
        Lights
      </h2>
      <ul className="m-0 p-2 flex flex-col gap-1">
        {Object.entries(lightformers).map(([key, props]) => (
          <li
            key={key}
            className={clsx(
              "group flex list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
              props.selected && "bg-white/20",
              !props.selected && "hover:bg-white/10"
            )}
          >
            <input
              type="checkbox"
              hidden
              checked={props.selected}
              className="peer"
            />

            <span className="flex-1 text-xs font-mono text-gray-300">
              Light {key}
            </span>

            <button className="text-white opacity-0 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity">
              <FlagIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setLightformers((prev) => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    visible: !prev[key].visible,
                  },
                }));
              }}
              className={clsx(
                "text-white opacity-0 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity",
                !props.visible && "opacity-40"
              )}
            >
              {lightformers[key].visible ? (
                <EyeFilledIcon className="w-4 h-4" />
              ) : (
                <EyeSlashIcon className="w-4 h-4 " />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorCanvas({ texture }: { texture: THREE.Texture }) {
  return (
    <Canvas camera={{ near: 0.001 }}>
      <Bounds fit clip observe damping={6} margin={0.5}>
        <EnvironmentPlane texture={texture} />
      </Bounds>
    </Canvas>
  );
}

function ScenePreview({
  background,
  backgroundColor,
  lightformers,
  texture,
}: {
  background: boolean;
  backgroundColor: string;
  lightformers: Record<string, LightformerProps>;
  texture: THREE.Texture;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        near: 0.001,
        position: [2, 2, 2],
      }}
      style={{ position: "relative" }}
    >
      <BakeShadows />
      <ambientLight intensity={0.2} />
      {/* <Float floatingRange={[-0.2, 0.2]} speed={4}>
     <mesh position={[0, 1, 0]} castShadow receiveShadow>
       <torusKnotGeometry args={[1, 0.3, 128, 128]} />
       <meshPhysicalMaterial
         reflectivity={0.6}
         roughness={0.2}
         color="black"
       />
     </mesh>
    </Float> */}

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

      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />
      {/* <gridHelper /> */}
      <OrbitControls />
      <Environment background={background} resolution={2048}>
        {Object.entries(lightformers).map(([key, props]) => (
          <Lightformer key={key} {...props} target={[0, 0, 0]} />
        ))}
        {/* <primitive attach="background" object={texture} /> */}
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
    </Canvas>
  );
}

function EnvironmentPlane({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh>
      <planeGeometry args={[10, 5, 1, 1]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
