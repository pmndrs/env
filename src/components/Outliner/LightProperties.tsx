import { Light } from "../../store";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { Pane } from "tweakpane";

export function LightProperties({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
  const [light, setLight] = useAtom(lightAtom);
  const ref = useRef<HTMLDivElement>(null!);

  const handleChange = useCallback(
    (e: any) => {
      setLight((old) => ({ ...old, [e.target.key]: structuredClone(e.value) }));
    },
    [light.id]
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const pane = new Pane({ container: ref.current, expanded: true });

    pane.addBinding(light, "name").on("change", handleChange);

    pane.addBlade({ view: "separator" });

    pane
      .addBinding(light, "scale", { min: 0, step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "scaleX", { label: "width", min: 0, step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "scaleY", { label: "height", min: 0, step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "rotation", { step: 0.1 })
      .on("change", handleChange);
    pane
      .addBinding(light, "latlon", {
        x: { min: -1, max: 1, step: 0.01 },
        y: { inverted: true, min: -1, max: 1, step: 0.01 },
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
          label: "scrim xy",
          x: { min: -1, max: 1 },
          y: { inverted: true, min: -1, max: 1 },
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

    if (light.type === "sky_gradient") {
      pane.addBinding(light, "color2").on("change", handleChange);
    }

    return () => {
      pane.dispose();
    };
  }, [light.id]);

  return <div ref={ref} />;
}
