import { CodeBracketIcon, PaintBrushIcon } from "@heroicons/react/24/solid";
import * as Toolbar from "@radix-ui/react-toolbar";
import { useState } from "react";
import { useStore } from "./useStore";

function Logo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 2000 2000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="718" y="1376" width="564" height="564" fill="white" />
      <rect x="718" y="718" width="564" height="564" fill="white" />
      <rect x="60" y="718" width="564" height="564" fill="white" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1376 60H718V624H1376V1282H1940V60H1376Z"
        fill="white"
      />
    </svg>
  );
}

export function AppToolbar() {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);

  return (
    <Toolbar.Root
      aria-label="Editing options"
      className="flex items-center justify-between min-w-[max-content] px-4 pt-1"
    >
      <span className="p-3">
        <Logo />
      </span>

      <Toolbar.ToggleGroup
        type="single"
        aria-label="Tools"
        className="flex divide-x-2 divide-gray-900 bg-black/10 rounded-md overflow-hidden border-white/10 border"
        value={mode}
        onValueChange={setMode}
      >
        <Toolbar.ToggleItem
          value="edit"
          className="px-3 py-1.5 leading-4 text-xs tracking-wide uppercase font-semibold bg-black/10 hover:bg-black/20 data-[state=on]:bg-white data-[state=on]:text-black flex items-center"
        >
          <PaintBrushIcon className="w-4 h-4 mr-2" />
          <span>Edit</span>
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="code"
          className="px-3 py-1.5 leading-4 text-xs tracking-wide uppercase font-semibold bg-black/10 hover:bg-black/20 data-[state=on]:bg-white data-[state=on]:text-black flex items-center"
        >
          <CodeBracketIcon className="w-4 h-4 mr-2" />
          <span>Code</span>
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>

      <Toolbar.Button className="px-[10px] text-white bg-violet-600 flex-shrink-0 flex-grow-0 basis-auto h-[25px] rounded inline-flex text-[13px] leading-none items-center justify-center outline-none hover:bg-violet10 focus:relative focus:shadow-[0_0_0_2px] focus:shadow-violet7">
        Export
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
