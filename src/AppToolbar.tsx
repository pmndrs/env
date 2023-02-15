import {
  ArrowTopRightOnSquareIcon,
  CameraIcon,
  CodeBracketIcon,
  LinkIcon,
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
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
        fillRule="evenodd"
        clipRule="evenodd"
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
            value: "edit",
            label: "Edit",
            icon: PaintBrushIcon,
          },
          {
            value: "code",
            label: "Code",
            icon: CodeBracketIcon,
          },
          {
            value: "render",
            label: "Render",
            icon: CameraIcon,
          },
          {
            value: "preview",
            label: "Preview",
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
