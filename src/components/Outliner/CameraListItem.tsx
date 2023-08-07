import { CameraIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Camera,
  selectCameraAtom,
  toggleCameraSelectionAtom,
} from "../../store";
import { useKeyPress } from "../../hooks/useKeyPress";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";

export function CameraListItem({
  index,
  cameraAtom,
}: {
  index: number;
  cameraAtom: PrimitiveAtom<Camera>;
}) {
  const camera = useAtomValue(cameraAtom);

  const toggleCameraSelection = useSetAtom(toggleCameraSelectionAtom);
  const selectCamera = useSetAtom(selectCameraAtom);

  const key = String(index + 1);
  useKeyPress(key, () => selectCamera(camera.id));

  return (
    <li
      role="button"
      className={clsx(
        "group flex relative list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
        camera.selected && "bg-white/20",
        !camera.selected && "hover:bg-white/10"
      )}
      onClick={() => toggleCameraSelection(camera.id)}
    >
      <CameraIcon className="w-4 h-4 text-green-400" />
      <input
        type="checkbox"
        hidden
        readOnly
        checked={camera.selected}
        className="peer"
      />

      <span className="flex-1 text-xs font-mono text-gray-300">
        {camera.name}
      </span>

      <kbd
        className={clsx(
          "absolute right-1.5 top-1.5 text-xs font-mono text-gray-300 bg-white/10 w-5 h-5 flex items-center justify-center rounded",
          camera.selected && "bg-white/100 text-gray-900"
        )}
      >
        {key}
      </kbd>
    </li>
  );
}
