import { BoltIcon } from "@heroicons/react/24/solid";
import { Bvh, Environment, PerformanceMonitor } from "@react-three/drei";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { useSetAtom } from "jotai";
import { PointerEvent, Suspense, useCallback } from "react";
import { toast } from "sonner";
import * as THREE from "three";
import { lightsAtom, pointerAtom } from "../../store";
import { Env } from "../Env";
import { Model } from "../Model";
import { Cameras } from "./Cameras";
import { Controls } from "./Controls";
import { Debug } from "./Debug";
import { Lights } from "./Lights";

export function ScenePreview() {
  const setLights = useSetAtom(lightsAtom);

  const handleModelClick = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();

      const cameraPosition = e.camera.position.clone();
      const point = e.point.clone();
      const normal =
        e.face?.normal?.clone()?.transformDirection(e.object.matrixWorld) ??
        new THREE.Vector3(0, 0, 1);

      // Reflect the camera position across the normal so that the
      // light is visible in the reflection.
      const cameraToPoint = point.clone().sub(cameraPosition).normalize();
      const reflected = cameraToPoint.reflect(normal);

      const spherical = new THREE.Spherical().setFromVector3(reflected);

      const lat = THREE.MathUtils.mapLinear(spherical.phi, 0, Math.PI, 1, -1);
      const lon = THREE.MathUtils.mapLinear(
        spherical.theta,
        0.5 * Math.PI,
        -1.5 * Math.PI,
        -1,
        1
      );

      const { x, y, z } = point;
      setLights((lights) =>
        lights.map((l) => ({
          ...l,
          target: l.selected ? { x, y, z } : l.target,
          latlon: l.selected ? { x: lon, y: lat } : l.latlon,
          ts: Date.now(),
        }))
      );
    },
    [setLights]
  );

  const setPointer = useSetAtom(pointerAtom);
  const handleModelPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();

      const point = e.point.clone();
      const normal =
        e.face?.normal?.clone()?.transformDirection(e.object.matrixWorld) ??
        new THREE.Vector3(0, 0, 1);

      setPointer({ point, normal });
    },
    [setPointer]
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true, // for screenshot
        logarithmicDepthBuffer: true,
        antialias: true,
      }}
      style={{ touchAction: "none" }}
    >
      <PerformanceMonitor
        threshold={0.3}
        factor={0.1}
        flipflops={3}
        onFallback={() => {
          toast("Switching to low performance mode", {
            description:
              "This will reduce the quality of the preview, but will improve performance.",
            icon: <BoltIcon className="w-4 h-4" />,
          });
        }}
      >
        <Cameras />
        <Lights ambientLightIntensity={0.2} />

        <Suspense fallback={null}>
          <Bvh firstHitOnly>
            <Model
              debugMaterial={false}
              onClick={handleModelClick}
              onPointerMove={handleModelPointerMove}
            />
          </Bvh>
        </Suspense>

        <Suspense fallback={null}>
          <Environment
            resolution={512}
            far={100}
            near={0.01}
            frames={Infinity}
            background
          >
            <Env />
          </Environment>
        </Suspense>

        {/* <Effects /> */}

        <Debug />

        <Controls autoRotate={false} />
      </PerformanceMonitor>
    </Canvas>
  );
}
