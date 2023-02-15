import { Bars2Icon } from "@heroicons/react/24/outline";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppToolbar } from "./AppToolbar";
import { Code } from "./Code";
import { HDRIPreview } from "./HDRIPreview";

import { Outliner } from "./Outliner";
import { PathTracedPreview } from "./PathTracedPreview";
import { Properties } from "./Properties";
import { ScenePreview } from "./ScenePreview";
import { useStore } from "./useStore";

export default function App() {
  const mode = useStore((state) => state.mode);
  return (
    <div className="h-full w-full flex flex-col from-neutral-900 to-neutral-800 bg-gradient-to-t overflow-hidden text-white">
      <AppToolbar />

      <PanelGroup direction="horizontal" className="flex-1 p-4 pt-1">
        {/* Left */}
        <Panel
          collapsible
          defaultSize={15}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
        >
          <Outliner />
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1" />
        </PanelResizeHandle>

        {/* Middle */}
        <Panel
          minSize={30}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
        >
          {mode === "edit" && <ScenePreview />}
          {mode === "code" && <Code />}
          {mode === "preview" && <HDRIPreview />}
          {mode === "render" && <PathTracedPreview />}
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1" />
        </PanelResizeHandle>

        {/* Right */}
        <Panel
          collapsible
          defaultSize={20}
          className="shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
        >
          <Properties />
        </Panel>
      </PanelGroup>
    </div>
  );
}
