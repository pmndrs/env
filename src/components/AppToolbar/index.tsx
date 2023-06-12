import {
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useStore } from "../../hooks/useStore";
import { Logo } from "./Logo";

export function AppToolbar() {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);

  return (
    <Toolbar.Root
      aria-label="Editing options"
      className="flex items-center justify-between min-w-[max-content] px-4 pt-1"
    >
      <span className="p-3 flex items-center gap-4">
        <Logo />
        <h1 className="font-bold tracking-wide text-xl">Env</h1>
      </span>

      <Toolbar.ToggleGroup
        type="single"
        aria-label="Tools"
        className="flex divide-x divide-white/10 bg-neutral-900 rounded-md overflow-hidden shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20"
        value={mode}
        onValueChange={setMode}
      >
        {[
          {
            value: "scene",
            label: "Scene",
            icon: PaintBrushIcon,
          },
          {
            value: "code",
            label: "Code",
            icon: CodeBracketIcon,
          },
          {
            value: "hdri",
            label: "HDRI",
            icon: PhotoIcon,
          },
        ].map(({ value, label, icon: Icon }) => (
          <Toolbar.ToggleItem
            key={value}
            value={value}
            className="px-3 py-1.5 leading-4 text-xs tracking-wide uppercase font-semibold bg-white/0 hover:bg-white/10 bg-gradient-to-b data-[state=on]:from-blue-500 data-[state=on]:to-blue-600 data-[state=on]:text-white flex items-center"
          >
            <Icon className="w-4 h-4 mr-2" />
            <span>{label}</span>
          </Toolbar.ToggleItem>
        ))}
      </Toolbar.ToggleGroup>

      <Toolbar.Link
        href="https://github.com/pmndrs/env"
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center items-center text-xs px-3 py-1.5 leading-4 tracking-wide uppercase font-semibold bg-white/0 hover:bg-white/100 text-white hover:text-black rounded-md transition-all duration-500 ease-in-out"
      >
        <span>Source Code</span>
        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
      </Toolbar.Link>
    </Toolbar.Root>
  );
}
