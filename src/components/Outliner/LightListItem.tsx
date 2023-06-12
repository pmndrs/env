import {
  EyeSlashIcon,
  FlagIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import {
  EyeIcon as EyeFilledIcon,
  FlagIcon as FlagFilledIcon
} from "@heroicons/react/24/solid";
import * as ContextMenu from "@radix-ui/react-context-menu";
import clsx from "clsx";
import { folder, useControls } from "leva";
import { useStore, Light } from "../../hooks/useStore";

export function LightListItem({ light }: { light: Light; }) {
  const {
    id, type, name, visible, solo, shape, intensity, distance, phi, theta, scale, scaleX, scaleY, opacity,
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
              value: opacity ?? 1,
              step: 0.1,
              min: 0,
              max: 1,
              onChange: (v) => updateLight({ id, opacity: v }),
            },
            [`scaleMultiplier ~${id}`]: {
              label: "Scale Multiplier",
              value: scale ?? 1,
              step: 0.1,
              min: 0,
              max: 10,
              onChange: (v) => updateLight({ id, scale: v }),
            },
            [`scale ~${id}`]: {
              label: "Scale",
              value: [scaleX, scaleY] ?? [1, 1],
              step: 0.1,
              min: 0,
              joystick: false,
              onChange: (v) => updateLight({ id, scaleX: v[0], scaleY: v[1] }),
            },
            [`distance ~${id}`]: {
              label: "Distance",
              value: distance ?? 1,
              step: 0.1,
              min: 0,
              onChange: (v) => updateLight({ id, distance: v }),
            },
            [`phi ~${id}`]: {
              label: "Phi",
              value: phi ?? 1,
              step: 0.1,
              min: 0,
              max: Math.PI,
              onChange: (v) => updateLight({ id, phi: v }),
            },
            [`theta ~${id}`]: {
              label: "Theta",
              value: theta ?? 1,
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
                    value: textureMaps.find((value) => light.map === value)?.name ??
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
            )} />
          <input
            type="checkbox"
            hidden
            readOnly
            checked={selectedLightId === id}
            className="peer" />

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
