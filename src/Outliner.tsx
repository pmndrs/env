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
import clsx from "clsx";
import { folder, useControls } from "leva";
import * as THREE from "three";

import { useStore, Camera, Light } from "./useStore";
import { useKeyPress } from "./useKeyPress";

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

function CameraListItem({ index, camera }: { index: number; camera: Camera }) {
  const { id, name } = camera;
  const selectedCameraId = useStore((state) => state.selectedCameraId);
  const setSelectedCameraId = useStore((state) => state.setSelectedCameraId);

  const isSelected = selectedCameraId === id;

  const key = String(index + 1);
  useKeyPress(key, () => setSelectedCameraId(id));

  return (
    <li
      role="button"
      className={clsx(
        "group flex relative list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
        isSelected && "bg-white/20",
        !isSelected && "hover:bg-white/10"
      )}
      onClick={() => {
        if (!isSelected) {
          setSelectedCameraId(id);
        }
      }}
    >
      <CameraIcon className="w-4 h-4 text-green-400" />
      <input
        type="checkbox"
        hidden
        readOnly
        checked={isSelected}
        className="peer"
      />

      <span className="flex-1 text-xs font-mono text-gray-300">{name}</span>

      <kbd
        className={clsx(
          "absolute right-1.5 top-1.5 text-xs font-mono text-gray-300 bg-white/10 w-5 h-5 flex items-center justify-center rounded",
          isSelected && "bg-white/100 text-gray-900"
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
      return {
        Light: folder(
          {},
          {
            color: "yellow",
            order: 0,
          }
        ),
      };
    } else {
      return {
        Light: folder(
          {
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
                    options: [
                      "none",
                      ...textureMaps.map((value) => value.name),
                    ],
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
          },
          {
            color: "yellow",
            order: 0,
          }
        ),
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
