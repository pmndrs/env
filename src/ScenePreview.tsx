import {
  AccumulativeShadows,
  OrbitControls,
  PerspectiveCamera,
  RandomizedLight,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { button, folder, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import convertCubemapToEquirectangular from "./convertCubemapToEquirectangular";
import { Effects } from "./Effects";
import { Env } from "./Env";
import { SaveBackgroundTexture } from "./HDRIPreview";
import { Model } from "./Model";
import { useStore } from "./useStore";

export function ScenePreview() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());

  const selectedLightId = useStore((state) => state.selectedLightId);
  const updateSelectedCamera = useStore((state) => state.updateSelectedCamera);

  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  const [{ ambientLightIntensity, debugMaterial, shadows, autoRotate }] =
    useControls(
      () => ({
        settings: folder(
          {
            ambientLightIntensity: {
              label: "Ambient Intensity",
              value: 0.5,
              min: 0,
              max: 3,
              render: () => selectedLightId === null,
            },
            debugMaterial: {
              label: "Debug Material",
              value: false,
              render: () => selectedLightId === null,
            },
            shadows: {
              label: "Shadows",
              value: true,
              render: () => selectedLightId === null,
            },
            autoRotate: {
              label: "Auto Rotate",
              value: false,
              render: () => selectedLightId === null,
            },
            Screenshot: button(
              () => {
                const canvas = document.querySelector("canvas");
                if (canvas) {
                  const link = document.createElement("a");
                  link.download = "screenshot.png";
                  link.href = canvas.toDataURL("image/png", 1);
                  link.click();
                }
              },
              {
                disabled: selectedLightId !== null,
              }
            ),
            "Upload Model": button(
              () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".glb";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const data = e.target?.result;
                      if (typeof data === "string") {
                        const modelUrl = data;
                        useGLTF.preload(modelUrl);
                        useStore.setState({ modelUrl });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              },
              {
                disabled: selectedLightId !== null,
              }
            ),
          },
          {
            order: 1,
          }
        ),
      }),
      [selectedLightId]
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
    >
      <LoadTextureMaps />
      <SaveBackgroundTexture setTexture={setTexture} />
      <DownloadHDRI texture={texture} />

      <Cameras />

      <ambientLight intensity={ambientLightIntensity} />
      <hemisphereLight intensity={ambientLightIntensity} />

      <Suspense fallback={null}>
        <Model debugMaterial={debugMaterial} />
        <Env />
      </Suspense>

      {shadows && (
        <AccumulativeShadows
          temporal
          frames={30}
          color="black"
          alphaTest={0.65}
          opacity={0.5}
          scale={14}
          position={[0, 0, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={4}
            ambient={0.5}
            bias={0.001}
            position={[0, 15, 0]}
          />
        </AccumulativeShadows>
      )}

      <Effects />

      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />

      <OrbitControls
        makeDefault
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        onEnd={(e) => {
          if (controlsRef.current) {
            updateSelectedCamera({
              position: controlsRef.current.object.position.toArray(),
              rotation: controlsRef.current.object.rotation.toArray() as [
                number,
                number,
                number
              ],
            });
          }
        }}
        enableDamping={false}
      />
    </Canvas>
  );
}

function Cameras() {
  const cameras = useStore((state) => state.cameras);
  const selectedCameraId = useStore((state) => state.selectedCameraId);

  return (
    <>
      {cameras.map((camera) => (
        <PerspectiveCamera
          key={camera.id}
          makeDefault={camera.id === selectedCameraId}
          position={camera.position}
          rotation={camera.rotation}
          near={0.001}
        />
      ))}
    </>
  );
}

function LoadTextureMaps() {
  const setTextureMaps = useStore((state) => state.setTextureMaps);

  useTexture({ checkerboard: "/textures/checkerboard.png" }, (textures) => {
    if (Array.isArray(textures)) {
      textures.forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const url = new URL(texture.source.data.currentSrc);
        texture.name = url.pathname.split("/").pop() as string;
        texture.needsUpdate = true;
      });
      setTextureMaps(textures);
    } else {
      setTextureMaps([textures]);
    }
  });

  return null;
}

function DownloadHDRI({ texture }: { texture: THREE.CubeTexture }) {
  const renderer = useThree((state) => state.gl);
  const selectedLightId = useStore((state) => state.selectedLightId);
  useControls(
    {
      "Download Env Map": button(
        () => {
          const width = 2048;
          const height = 1024;
          const fbo = convertCubemapToEquirectangular(
            texture,
            renderer,
            width,
            height
          );
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            const pixels = new Uint8Array(width * height * 4);
            renderer.readRenderTargetPixels(fbo, 0, 0, width, height, pixels);
            const imageData = new ImageData(
              new Uint8ClampedArray(pixels),
              width,
              height
            );
            ctx.putImageData(imageData, 0, 0);
            const link = document.createElement("a");
            link.download = "envmap.png";
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
          }
        },
        {
          disabled: selectedLightId !== null,
        }
      ),
    },
    [selectedLightId, texture]
  );

  return null;
}
