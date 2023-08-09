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
import { LightProperties } from "./LightProperties";

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
                !visible && "text-neutral-300/50"
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
                "flex-1 text-xs font-mono text-neutral-300 text-ellipsis overflow-hidden whitespace-nowrap",
                !visible && "text-neutral-300/50 line-through"
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
          <ContextMenu.Content className="flex flex-col gap-1 bg-neutral-800 text-neutral-50 font-light p-1.5 rounded-md shadow-xl">
            <ContextMenu.Item
              className="outline-none select-none rounded px-2 py-0.5 highlighted:bg-white highlighted:text-neutral-900 text-sm"
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
          <LightProperties lightAtom={lightAtom} />
        </PropertiesPanelTunnel.In>
      )}
    </>
  );
}
