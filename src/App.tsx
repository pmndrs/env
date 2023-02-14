import { Bars2Icon } from "@heroicons/react/24/outline";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppToolbar } from "./AppToolbar";

import { Outliner } from "./Outliner";
import { Properties } from "./Properties";
import { ScenePreview } from "./ScenePreview";
import { useStore } from "./useStore";

export default function App() {
  const mode = useStore((state) => state.mode);
  return (
    <div className="h-full w-full flex flex-col bg-neutral-800 overflow-hidden text-white">
      <AppToolbar />

      <PanelGroup direction="horizontal" className="flex-1 p-4 pt-1">
        {/* Left */}
        <Panel
          collapsible
          defaultSize={15}
          className="bg-neutral-900 rounded-lg"
        >
          <Outliner />
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1" />
        </PanelResizeHandle>

        {/* Middle */}
        <Panel minSize={30} className="bg-neutral-900 rounded-lg">
          {mode === "edit" && <ScenePreview />}
          {mode === "code" && <div>Code</div>}
        </Panel>

        <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
          <Bars2Icon className="rotate-90 -m-1" />
        </PanelResizeHandle>

        {/* Right */}
        <Panel
          collapsible
          defaultSize={20}
          className="bg-neutral-900 rounded-lg"
        >
          <Properties />
        </Panel>
      </PanelGroup>
    </div>
  );
}
