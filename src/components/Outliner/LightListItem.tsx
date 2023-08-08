import {
  EyeSlashIcon,
  FlagIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
  EyeIcon as EyeFilledIcon,
  FlagIcon as FlagFilledIcon,
} from "@heroicons/react/24/solid";
import * as ContextMenu from "@radix-ui/react-context-menu";
import clsx from "clsx";
import {
  Light,
  isSoloAtom,
  toggleSoloAtom,
  toggleLightSelectionAtom,
  deleteLightAtom,
  duplicateLightAtom,
} from "../../store";
import { PropertiesPanelTunnel } from "../Properties";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";

export function LightListItem({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
  const [light, setLight] = useAtom(lightAtom);
  const isSolo = useAtomValue(isSoloAtom);
  const toggleSolo = useSetAtom(toggleSoloAtom);
  const toggleSelection = useSetAtom(toggleLightSelectionAtom);
  const duplicateLight = useSetAtom(duplicateLightAtom);
  const deleteLight = useSetAtom(deleteLightAtom);

  const { id, name, visible, solo, selected } = light;

  const toggleVisibility = () =>
    setLight((old) => ({ ...old, visible: !old.visible }));

  const updateLight = (light: Partial<Light>) =>
    setLight((old) => ({ ...old, ...light } as any));

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <li
            key={id}
            role="button"
            className={clsx(
              "group flex list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
              selected && "bg-white/20",
              !selected && "hover:bg-white/10"
            )}
            onClick={() => toggleSelection(light.id)}
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
              checked={selected}
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
                toggleSolo(light.id);
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
                toggleVisibility();
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
              onSelect={() => duplicateLight(light.id)}
            >
              Duplicate
            </ContextMenu.Item>
            <ContextMenu.Item
              className="outline-none select-none rounded px-2 py-0.5 text-white highlighted:bg-red-500 highlighted:text-white text-sm"
              onSelect={() => deleteLight(light.id)}
            >
              Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {selected && (
        <PropertiesPanelTunnel.In>
          <div className="flex flex-col gap-2">
            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Name
              </span>
              <input
                key={`${id}-name`}
                type="text"
                className="col-start-8 col-span-18 h-8 px-2 py-1 text-gray-100 bg-black/25 border border-gray-400/20 rounded-sm focus:outline-none focus:border-gray-100/20 "
                defaultValue={light.name}
                onChange={(e) => {
                  updateLight({ id, name: e.target.value });
                }}
              />
            </label>

            <hr className="border-white/10 my-2" />

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Shape
              </span>
              <select
                key={`${id}-shape`}
                className="col-start-8 col-span-18 h-8 px-2 py-1 text-gray-100 bg-black/25 border border-gray-400/20 rounded-sm focus:outline-none focus:border-gray-100/20 "
                defaultValue={light.shape}
                onChange={(e) => {
                  const shape = e.target.value as Light["shape"];
                  updateLight({ shape });
                }}
              >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="ring">Ring</option>
              </select>
            </label>

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Scale
              </span>
              <input
                key={`${id}-scale`}
                className="col-start-8 col-span-18"
                type="range"
                min={0}
                max={10}
                step={0.01}
                defaultValue={light.scale}
                onChange={(e) => {
                  updateLight({ scale: Number(e.target.value) });
                }}
              />
            </label>

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Radius
              </span>
              <input
                key={`${id}-scale`}
                className="col-start-8 col-span-18"
                type="range"
                min={0}
                max={10}
                step={0.01}
                defaultValue={light.distance}
                onChange={(e) => {
                  updateLight({ distance: Number(e.target.value) });
                }}
              />
            </label>

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-5">
                Lat-Lon
              </span>
              <input
                key={`${id}-position-theta`}
                className="col-start-8 col-span-8"
                type="range"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                defaultValue={light.theta}
                onChange={(e) => {
                  updateLight({
                    theta: Number(e.target.value),
                  });
                }}
              />
              <input
                key={`${id}-position-phi`}
                className="col-start-17 col-span-8"
                type="range"
                min={-Math.PI}
                max={0}
                step={0.01}
                defaultValue={light.phi}
                onChange={(e) => {
                  updateLight({
                    phi: Number(e.target.value),
                  });
                }}
              />
            </label>

            <hr className="border-white/10 my-2" />

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Color
              </span>
              <input
                key={`${id}-color`}
                className="col-start-8 col-span-18"
                type="color"
                defaultValue={light.color}
                onChange={(e) => {
                  updateLight({ color: e.target.value });
                }}
              />
            </label>

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Intensity
              </span>
              <input
                key={`${id}-intensity`}
                className="col-start-8 col-span-18"
                type="range"
                min={0}
                max={10}
                step={0.01}
                defaultValue={light.intensity}
                onChange={(e) => {
                  updateLight({ intensity: Number(e.target.value) });
                }}
              />
            </label>

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Opacity
              </span>
              <input
                key={`${id}-opacity`}
                className="col-start-8 col-span-18"
                type="range"
                min={0}
                max={1}
                step={0.01}
                defaultValue={light.opacity}
                onChange={(e) => {
                  updateLight({ opacity: Number(e.target.value) });
                }}
              />
            </label>

            <hr className="border-white/10 my-2" />

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                Light Type
              </span>

              <span className="col-start-11 col-span-12 font-mono text-xs">
                {light.type === "texture" && "Texture"}
                {light.type === "procedural_scrim" && "Procedural Scrim"}
                {light.type === "procedural_umbrella" && "Procedural Umbrella"}
              </span>
            </label>

            {light.type === "procedural_umbrella" && (
              <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
                <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-6">
                  Light Sides
                </span>
                <input
                  key={`${id}-opacity`}
                  className="col-start-8 col-span-18"
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  defaultValue={light.lightSides}
                  onChange={(e) => {
                    updateLight({ lightSides: Number(e.target.value) });
                  }}
                />
              </label>
            )}

            {light.type === "procedural_scrim" && (
              <>
                <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
                  <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-10">
                    Scrim Position
                  </span>
                  <input
                    key={`${id}-lightPosition-x`}
                    className="col-start-11 col-span-6"
                    type="range"
                    min={-1}
                    max={1}
                    step={0.01}
                    defaultValue={light.lightPosition.x}
                    onChange={(e) => {
                      updateLight({
                        lightPosition: {
                          x: Number(e.target.value),
                          y: light.lightPosition.y,
                        },
                      });
                    }}
                  />
                  <input
                    key={`${id}-lightPosition-y`}
                    className="col-start-19 col-span-6"
                    type="range"
                    min={-1}
                    max={1}
                    step={0.01}
                    defaultValue={light.lightPosition.y}
                    onChange={(e) => {
                      updateLight({
                        lightPosition: {
                          x: light.lightPosition.x,
                          y: Number(e.target.value),
                        },
                      });
                    }}
                  />
                </label>

                <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
                  <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-10">
                    Scrim Distance
                  </span>
                  <input
                    key={`${id}-lightDistance`}
                    className="col-start-11 col-span-14"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={light.lightDistance}
                    onChange={(e) => {
                      updateLight({ lightDistance: Number(e.target.value) });
                    }}
                  />
                </label>
              </>
            )}
          </div>
        </PropertiesPanelTunnel.In>
      )}
    </>
  );
}
