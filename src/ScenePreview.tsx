import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { LayerMaterial } from "lamina";
import { button, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import convertCubemapToEquirectangular from "./convertCubemapToEquirectangular";
import { CubeMaterial } from "./CubeMaterial";
import { Effects } from "./Effects";
import { Lightformer } from "./Lightformer";
import { Model } from "./Model";
import { Color, Gradient, Noise, Texture } from "lamina";
import { Light, useStore } from "./useStore";

export function ScenePreview() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const view1Ref = useRef<HTMLDivElement | null>(null);
  const view2Ref = useRef<HTMLDivElement | null>(null);

  const lights = useStore((state) => state.lights);
  const cameras = useStore((state) => state.cameras);

  const selectedLightId = useStore((state) => state.selectedLightId);
  const selectedCameraId = useStore((state) => state.selectedCameraId);
  const updateSelectedCamera = useStore((state) => state.updateSelectedCamera);

  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  const [
    {
      background,
      envMap,
      backgroundColor,
      ambientLightIntensity,
      debugMaterial,
      shadows,
      autoRotate,
    },
  ] = useControls(
    () => ({
      envMap: {
        label: "Show Env Map",
        value: true,
        render: () => selectedLightId === null,
      },
      background: {
        label: "Show BG",
        value: true,
        render: () => selectedLightId === null,
      },
      backgroundColor: {
        label: "BG Color",
        value: "#000000",
        render: () => selectedLightId === null,
      },
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
    }),
    [selectedLightId]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full overflow-hidden relative"
      style={{
        backgroundSize: "20px 20px",
        backgroundImage:
          "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
      }}
    >
      <div ref={view1Ref} className="w-full h-full" />
      {envMap && <div ref={view2Ref} className="w-full h-full" />}
      <Canvas
        shadows
        dpr={[1, 2]}
        eventSource={containerRef as React.MutableRefObject<HTMLDivElement>}
        className="!absolute top-0 left-0 pointer-events-none w-full h-full"
        gl={{
          preserveDrawingBuffer: true, // for screenshot
          logarithmicDepthBuffer: true,
          antialias: true,
        }}
      >
        <LoadTextureMaps />

        <DownloadHDRI texture={texture} />

        {/* @ts-ignore */}
        {cameras.map((camera) => (
          <PerspectiveCamera
            key={camera.id}
            makeDefault={camera.id === selectedCameraId}
            position={camera.position}
            rotation={camera.rotation}
            near={0.001}
          />
        ))}

        <SaveBackgroundTexture setTexture={setTexture} />

        <Suspense fallback={null}>
          <Model debugMaterial={debugMaterial} />
        </Suspense>

        <hemisphereLight intensity={ambientLightIntensity} />

        <Perf
          minimal
          position="bottom-right"
          style={{ position: "absolute" }}
        />
        <OrbitControls
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

        <ambientLight intensity={ambientLightIntensity} />

        <Environment resolution={2048} background={background}>
          <color attach="background" args={[backgroundColor]} />
          {lights.map((light) => {
            const {
              id,
              distance,
              phi,
              theta,
              intensity,
              shape,
              scale,
              scaleX,
              scaleY,
              visible,
              rotation,
              opacity,
            } = light;
            return (
              <Lightformer
                key={id}
                visible={visible}
                form={shape}
                intensity={intensity}
                position={new THREE.Vector3().setFromSphericalCoords(
                  distance,
                  phi,
                  theta
                )}
                rotation={[rotation, 0, 0]}
                scale={[scale * scaleX, scale * scaleY, scale]}
                target={[0, 0, 0]}
                castShadow={false}
                receiveShadow={false}
              >
                <LayerMaterial
                  alpha={opacity}
                  transparent
                  side={THREE.DoubleSide}
                  toneMapped={false}
                >
                  <LightformerLayers light={light} />
                </LayerMaterial>
              </Lightformer>
            );
          })}
        </Environment>

        <Effects />
      </Canvas>
    </div>
  );
}

function LightformerLayers({ light }: { light: Light }) {
  if (light.type === "solid") {
    const color = new THREE.Color(light.color);
    color.multiplyScalar(light.intensity);
    return <Color color={color} />;
  } else if (light.type === "gradient") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    return (
      <Gradient
        colorA={colorA}
        colorB={colorB}
        contrast={light.contrast}
        axes={light.axes}
      />
    );
  } else if (light.type === "noise") {
    const colorA = new THREE.Color(light.colorA);
    const colorB = new THREE.Color(light.colorB);
    const colorC = new THREE.Color(light.colorC);
    const colorD = new THREE.Color(light.colorD);
    colorA.multiplyScalar(light.intensity);
    colorB.multiplyScalar(light.intensity);
    colorC.multiplyScalar(light.intensity);
    colorD.multiplyScalar(light.intensity);
    return (
      <Noise
        colorA={colorA}
        colorB={colorB}
        colorC={colorC}
        colorD={colorD}
        type={light.noiseType}
        scale={light.noiseScale}
      />
    );
  } else if (light.type === "texture") {
    return <Texture map={light.map} />;
  } else {
    throw new Error("Unknown light type");
  }
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

function SaveBackgroundTexture({
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

function EnvMapPlane({ texture, ...props }: { texture: THREE.Texture }) {
  return (
    <mesh {...props} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[2, 1, 1, 1]} />
      <CubeMaterial map={texture} />
    </mesh>
  );
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
