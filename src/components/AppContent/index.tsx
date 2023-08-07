import { Bars2Icon } from "@heroicons/react/24/outline";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Outliner } from "../Outliner/Outliner";
import { Properties } from "../Properties";
import { HDRIPreview } from "../HDRIPreview";
import { ScenePreview } from "../ScenePreview";
import { Code } from "../Code";
import { useAtomValue } from "jotai";
import { modeAtom } from "../../store";

export function AppContent() {
  const mode = useAtomValue(modeAtom);

  return (
    <PanelGroup direction="horizontal" className="flex-1 p-2 pt-1">
      {/* Left */}
      <Panel
        id="outliner"
        order={1}
        collapsible
        defaultSize={15}
        className="isolate shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
      >
        <Outliner />
      </Panel>

      <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
        <Bars2Icon className="rotate-90 -m-1 text-white/50" />
      </PanelResizeHandle>

      {/* Middle */}
      <Panel id="stage" order={2} minSize={30}>
        <PanelGroup direction="vertical">
          <Panel
            id="scene-preview"
            order={1}
            className="isolate shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 bg-[conic-gradient(#202020_90deg,#313131_90deg_180deg,#202020_180deg_270deg,#313131_270deg)] bg-repeat bg-left-top bg-[length:20px_20px] rounded-lg"
          >
            <ScenePreview />
          </Panel>

          {mode.hdri && (
            <>
              <PanelResizeHandle className="h-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm my-1">
                <Bars2Icon className="h-4 -m-1 text-white/50" />
              </PanelResizeHandle>

              <Panel
                id="hdri-preview"
                order={2}
                collapsible
                className="isolate shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 bg-[conic-gradient(#202020_90deg,#313131_90deg_180deg,#202020_180deg_270deg,#313131_270deg)] bg-repeat bg-left-top bg-[length:20px_20px] rounded-lg"
              >
                <HDRIPreview />
              </Panel>
            </>
          )}

          {mode.code && (
            <>
              <PanelResizeHandle className="h-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm my-1">
                <Bars2Icon className="h-4 -m-1 text-white/50" />
              </PanelResizeHandle>

              <Panel
                id="code"
                order={3}
                collapsible
                className="isolate shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 bg-[conic-gradient(#202020_90deg,#313131_90deg_180deg,#202020_180deg_270deg,#313131_270deg)] bg-repeat bg-left-top bg-[length:20px_20px] rounded-lg"
              >
                <Code />
              </Panel>
            </>
          )}
        </PanelGroup>
      </Panel>

      <PanelResizeHandle className="w-2 grid place-items-center transition-all hover:bg-white/40 rounded-sm mx-1">
        <Bars2Icon className="rotate-90 -m-1 text-white/50" />
      </PanelResizeHandle>

      {/* Right */}
      <Panel
        id="properties"
        order={3}
        collapsible
        defaultSize={25}
        className="isolate shadow-inner shadow-white/5 ring-offset-white/10 ring-offset-1 ring-1 ring-black/20 bg-neutral-900 rounded-lg"
      >
        <Properties />
      </Panel>
    </PanelGroup>
  );
}
