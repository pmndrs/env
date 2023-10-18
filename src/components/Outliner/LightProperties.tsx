import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import { Light, isLightPaintingAtom } from "../../store";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";

export function LightProperties({
  lightAtom,
}: {
  lightAtom: PrimitiveAtom<Light>;
}) {
  const [isLightPainting, setLightPainting] = useAtom(isLightPaintingAtom);
  const [light, setLight] = useAtom(lightAtom);
  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);

  const handleChange = useCallback(
    (e: any) => {
      setLight((old) => ({
        ...old,
        [e.target.key]: structuredClone(e.value),
        ts: Date.now(),
      }));
    },
    [light.id]
  );

  useEffect(() => {
    pane.current?.refresh();
  }, [light.ts]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    pane.current = new Pane({ container: ref.current, expanded: true });

    pane.current.addBinding(light, "name").on("change", handleChange);

    pane.current.addBlade({ view: "separator" });

    pane.current
      .addBinding(light, "scale", { min: 0, step: 0.1 })
      .on("change", handleChange);
    pane.current
      .addBinding(light, "scaleX", { label: "width", min: 0, step: 0.1 })
      .on("change", handleChange);
    pane.current
      .addBinding(light, "scaleY", { label: "height", min: 0, step: 0.1 })
      .on("change", handleChange);
    pane.current
      .addBinding(light, "rotation", { step: 0.1 })
      .on("change", handleChange);
    pane.current
      .addBinding(light, "latlon", {
        x: { min: -1, max: 1, step: 0.01 },
        y: { inverted: true, min: -1, max: 1, step: 0.01 },
      })
      .on("change", handleChange);
    pane.current.addBinding(light, "target").on("change", handleChange);
    pane.current
      .addButton({ title: "Paint Light", label: "", disabled: isLightPainting })
      .on("click", () => {
        setLightPainting(true);
        toast("Light Paint Mode Activated", {
          duration: Infinity,
          action: {
            label: "Done",
            onClick: () => setLightPainting(false),
          },
          icon: <CursorArrowRippleIcon className="w-4 h-4" />,
          description: "Click on the model to paint the light.",
        });
      });

    pane.current.addBlade({ view: "separator" });

    pane.current.addBinding(light, "color").on("change", handleChange);
    pane.current
      .addBinding(light, "intensity", { min: 0, step: 0.1 })
      .on("change", handleChange);
    pane.current
      .addBinding(light, "opacity", { min: 0, max: 1 })
      .on("change", handleChange);

    pane.current.addBlade({ view: "separator" });

    pane.current.addBinding(light, "type", { readonly: true });

    if (light.type === "procedural_umbrella") {
      pane.current
        .addBinding(light, "lightSides", { min: 3, max: 20 })
        .on("change", handleChange);
    }

    if (light.type === "procedural_scrim") {
      pane.current
        .addBinding(light, "lightPosition", {
          label: "scrim xy",
          x: { min: -1, max: 1 },
          y: { inverted: true, min: -1, max: 1 },
        })
        .on("change", handleChange);
      pane.current
        .addBinding(light, "lightDistance", {
          min: 0.01,
          max: 1,
          label: "spread",
        })
        .on("change", handleChange);
    }

    if (light.type === "sky_gradient") {
      pane.current.addBinding(light, "color2").on("change", handleChange);
    }

    return () => {
      pane.current.dispose();
    };
  }, [light.id, isLightPainting]);

  return <div ref={ref} />;
}
