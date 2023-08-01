import { Bars2Icon } from "@heroicons/react/24/outline";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Toaster } from "sonner";

import { AppToolbar } from "./components/AppToolbar";
import { CommandPalette } from "./components/CommandPalette";
import { Outliner } from "./components/Outliner/Outliner";
import { Properties } from "./components/Properties";
import { Stage } from "./components/Stage";

export default function App() {
  return (
    <div className="h-full w-full flex flex-col from-neutral-900 to-neutral-800 bg-gradient-to-t overflow-hidden text-white">
      <Toaster theme="dark" />

      <CommandPalette />

      <AppToolbar />

      <PanelGroup direction="horizontal" className="flex-1 p-2 pt-1">
        {/* Left */}
        <Panel
          collapsible
          defaultSize={25}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
        >
          <Outliner />
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1 text-white/50" />
        </PanelResizeHandle>

        {/* Middle */}
        <Panel
          minSize={30}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 bg-[conic-gradient(#202020_90deg,#313131_90deg_180deg,#202020_180deg_270deg,#313131_270deg)] bg-repeat bg-left-top bg-[length:20px_20px] rounded-lg"
        >
          <Stage />
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1 text-white/50" />
        </PanelResizeHandle>

        {/* Right */}
        <Panel
          collapsible
          defaultSize={25}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
        >
          <Properties />
        </Panel>
      </PanelGroup>
    </div>
  );
}
