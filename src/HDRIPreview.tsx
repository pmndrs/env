import { Bounds } from "@react-three/drei";
import { Canvas, createPortal, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { CubeMaterial } from "./CubeMaterial";
import { Env } from "./Env";
import convertCubemapToEquirectangular from "./convertCubemapToEquirectangular";
import { useStore } from "./useStore";
import { button, folder, LevaInputs, useControls } from "leva";

export function HDRIPreview() {
  return (
    <div
      className="w-full h-full overflow-hidden relative"
      style={{
        backgroundSize: "20px 20px",
        backgroundImage:
          "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
      }}
    >
      <Canvas dpr={[1, 2]}>
        <Bounds fit clip observe damping={6} margin={0.9}>
          <EnvMapPlane />
        </Bounds>
      </Canvas>
    </div>
  );
}

function EnvMapPlane() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());
  const scene = useMemo(() => new THREE.Scene(), []);

  return (
    <>
      {createPortal(
        <>
          <SaveBackgroundTexture setTexture={setTexture} />
          <DownloadHDRI texture={texture} />
          <Env />
        </>,
        scene
      )}
      {/* <SaveBackgroundTexture setTexture={setTexture} /> */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <planeGeometry args={[2, 1, 1, 1]} />
        <CubeMaterial map={texture} />
      </mesh>
    </>
  );
}

export function SaveBackgroundTexture({
  setTexture,
}: {
  setTexture: (texture: THREE.CubeTexture) => void;
}) {
  const backgroundTexture = useThree((state) => state.scene.background);
  useEffect(() => {
    if (backgroundTexture instanceof THREE.CubeTexture) {
      setTexture(backgroundTexture);
    }
  }, [backgroundTexture]);
  return null;
}

function DownloadHDRI({ texture }: { texture: THREE.CubeTexture }) {
  const renderer = useThree((state) => state.gl);
  const selectedLightId = useStore((state) => state.selectedLightId);

  useControls(
    {
      "Export Settings": folder(
        {
          resolution: {
            label: "Resolution",
            type: LevaInputs.SELECT,
            options: {
              "1k": [1024, 512],
              "2k": [2048, 1024],
              "4k": [4096, 2048],
            },
          },
          format: {
            label: "Format",
            type: LevaInputs.SELECT,
            options: {
              PNG: "image/png",
              JPEG: "image/jpg",
              WEBP: "image/webp",
            },
          },
          "Export HDRI": button(
            (get) => {
              const [width, height] = get("resolution");
              const format = get("format");
              const filename =
                format === "image/png"
                  ? "envmap.png"
                  : format === "image/jpg"
                  ? "envmap.jpg"
                  : format === "image/webp"
                  ? "envmap.webp"
                  : "envmap";

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
                renderer.readRenderTargetPixels(
                  fbo,
                  0,
                  0,
                  width,
                  height,
                  pixels
                );
                const imageData = new ImageData(
                  new Uint8ClampedArray(pixels),
                  width,
                  height
                );
                ctx.putImageData(imageData, 0, 0);
                const link = document.createElement("a");
                link.download = filename;
                link.href = canvas.toDataURL(format, 1.0);
                link.click();
              }
            },
            {
              disabled: selectedLightId !== null,
            }
          ),
        },
        {
          order: 0,
          color: "magenta",
        }
      ),
    },
    [selectedLightId, texture]
  );

  return null;
}
