import { useStore } from "../../hooks/useStore";
import { Code } from "../Code";
import { HDRIPreview } from "../HDRIPreview";
import { ScenePreview } from "../ScenePreview";

export function Stage() {
  const mode = useStore((state) => state.mode);

  return (
    <>
      {mode === "scene" && <ScenePreview />}
      {mode === "code" && <Code />}
      {mode === "hdri" && <HDRIPreview />}
    </>
  );
}
