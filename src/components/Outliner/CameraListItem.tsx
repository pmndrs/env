import { CameraIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useStore, Camera } from "../../hooks/useStore";
import { useKeyPress } from "../../hooks/useKeyPress";

export function CameraListItem({ index, camera }: { index: number; camera: Camera; }) {
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
        className="peer" />

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
