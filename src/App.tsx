import { Bars2Icon } from "@heroicons/react/24/outline";
import { Leva } from "leva";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { Outliner } from "./Outliner";
import { ScenePreview } from "./ScenePreview";

export default function App() {
  return (
    <div className="h-full w-full bg-neutral-800 overflow-hidden p-4 text-white">
      <PanelGroup direction="horizontal">
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
        <Panel
          minSize={30}
          className="bg-neutral-900 rounded-lg"
          style={{
            gridArea: "scene",
            backgroundSize: "20px 20px",
            backgroundImage:
              "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
          }}
        >
          <ScenePreview />
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
          <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
            Properties
          </h2>
          <div className="p-2">
            <Leva
              neverHide
              fill
              flat
              titleBar={false}
              theme={{
                colors: {
                  elevation1: "transparent",
                  elevation2: "transparent",
                  elevation3: "rgba(255, 255, 255, 0.1)",
                },
                sizes: {
                  rootWidth: "100%",
                },
              }}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
