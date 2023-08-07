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
import { useStore, Light } from "../../hooks/useStore";
import { PropertiesPanelTunnel } from "../Properties";

export function LightListItem({ light }: { light: Light }) {
  const { id, name, visible, solo } = light;

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

  return (
    <>
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

      {id === selectedLightId && (
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
                  updateLight({ id, shape });
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
                  updateLight({ id, scale: Number(e.target.value) });
                }}
              />
            </label>

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
                  updateLight({ id, color: e.target.value });
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
                  updateLight({ id, intensity: Number(e.target.value) });
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
                  updateLight({ id, opacity: Number(e.target.value) });
                }}
              />
            </label>

            <hr className="border-white/10 my-2" />

            <label className="grid [grid-template-columns:repeat(24,1fr)] [grid-template-rows:32px] items-center">
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase col-span-10">
                Light Position
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
                    id,
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
                    id,
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
                Light Distance
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
                  updateLight({ id, lightDistance: Number(e.target.value) });
                }}
              />
            </label>
          </div>
        </PropertiesPanelTunnel.In>
      )}
    </>
  );
}
