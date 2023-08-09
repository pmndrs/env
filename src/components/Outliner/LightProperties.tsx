import { Light } from "../../store";
import { PrimitiveAtom, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Pane } from "tweakpane";

export function LightProperties({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
  const [light, setLight] = useAtom(lightAtom);
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const pane = new Pane({ container: ref.current, expanded: true });

    function handleChange(e: any) {
      setLight((old) => ({ ...old, [e.target.key]: e.value }));
    }

    pane.addBinding(light, "name").on("change", handleChange);

    pane.addBlade({ view: "separator" });

    pane
      .addBinding(light, "scale", { min: 0, step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "latlon", {
        min: -1,
        max: 1,
        step: 0.01,
      })
      .on("change", handleChange);

    pane.addBlade({ view: "separator" });

    pane.addBinding(light, "color").on("change", handleChange);
    pane
      .addBinding(light, "intensity", { min: 0, step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "opacity", { min: 0, max: 1 })
      .on("change", handleChange);

    pane.addBlade({ view: "separator" });

    pane.addBinding(light, "type", { readonly: true });

    if (light.type === "procedural_umbrella") {
      pane
        .addBinding(light, "lightSides", { min: 3, max: 20 })
        .on("change", handleChange);
    }

    if (light.type === "procedural_scrim") {
      pane
        .addBinding(light, "lightPosition", {
          min: -1,
          max: 1,
          label: "scrim xy",
        })
        .on("change", handleChange);
      pane
        .addBinding(light, "lightDistance", {
          min: 0,
          max: 1,
          label: "spread",
        })
        .on("change", handleChange);
    }

    return () => {
      pane.dispose();
    };
  }, [light.id]);

  return <div ref={ref} />;
}
