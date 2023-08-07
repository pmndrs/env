import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import convertCubemapToEquirectangular from "./convertCubemapToEquirectangular";
import { useStore } from "../../hooks/useStore";
import { encodeRGBE, HDRImageData } from "@derschmale/io-rgbe";

export function DownloadHDRI({ texture }: { texture: THREE.CubeTexture }) {
  const renderer = useThree((state) => state.gl);
  const selectedLightId = useStore((state) => state.selectedLightId);

  // useControls(
  //   () => ({
  //     "Export Settings": folder(
  //       {
  //         resolution: {
  //           label: "Resolution",
  //           type: LevaInputs.SELECT,
  //           options: {
  //             "1k": [1024, 512],
  //             "2k": [2048, 1024],
  //             "4k": [4096, 2048],
  //           },
  //         },
  //         format: {
  //           label: "Format",
  //           type: LevaInputs.SELECT,
  //           options: {
  //             HDR: "image/vnd.radiance",
  //             PNG: "image/png",
  //             JPEG: "image/jpg",
  //             WEBP: "image/webp",
  //           },
  //         },
  //         "Export HDRI": button((get) => {
  //           const [width, height] = get("Export Settings.resolution");
  //           const format = get("Export Settings.format");
  //           const filename =
  //             format === "image/vnd.radiance"
  //               ? "envmap.hdr"
  //               : format === "image/png"
  //               ? "envmap.png"
  //               : format === "image/jpg"
  //               ? "envmap.jpg"
  //               : format === "image/webp"
  //               ? "envmap.webp"
  //               : "envmap";

  //           if (format === "image/vnd.radiance") {
  //             const fbo = convertCubemapToEquirectangular(
  //               texture,
  //               renderer,
  //               width,
  //               height,
  //               THREE.SRGBColorSpace,
  //               THREE.FloatType
  //             );

  //             const pixels = new Float32Array(width * height * 4);
  //             renderer.readRenderTargetPixels(fbo, 0, 0, width, height, pixels);

  //             // Convert RBGA buffer to RGB
  //             const rgbPixels = new Float32Array(width * height * 3);
  //             for (let i = 0; i < width * height; i++) {
  //               rgbPixels[i * 3] = pixels[i * 4];
  //               rgbPixels[i * 3 + 1] = pixels[i * 4 + 1];
  //               rgbPixels[i * 3 + 2] = pixels[i * 4 + 2];
  //             }

  //             const imgData = new HDRImageData();
  //             imgData.width = width;
  //             imgData.height = height;
  //             imgData.exposure = 1;
  //             imgData.gamma = 1;
  //             imgData.data = rgbPixels;

  //             const blob = new Blob([encodeRGBE(imgData)], {
  //               type: "application/octet-stream",
  //             });
  //             const url = URL.createObjectURL(blob);

  //             const link = document.createElement("a");
  //             link.download = filename;
  //             link.href = url;
  //             link.click();

  //             URL.revokeObjectURL(url);
  //           } else {
  //             const fbo = convertCubemapToEquirectangular(
  //               texture,
  //               renderer,
  //               width,
  //               height
  //             );

  //             const canvas = document.createElement("canvas");
  //             canvas.width = width;
  //             canvas.height = height;

  //             const ctx = canvas.getContext("2d");
  //             if (ctx) {
  //               const pixels = new Uint8Array(width * height * 4);
  //               renderer.readRenderTargetPixels(
  //                 fbo,
  //                 0,
  //                 0,
  //                 width,
  //                 height,
  //                 pixels
  //               );
  //               const imageData = new ImageData(
  //                 new Uint8ClampedArray(pixels),
  //                 width,
  //                 height
  //               );
  //               ctx.putImageData(imageData, 0, 0);
  //               const link = document.createElement("a");
  //               link.download = filename;
  //               link.href = canvas.toDataURL(format, 1);
  //               link.click();
  //             }
  //           }
  //         }),
  //       },
  //       {
  //         order: 3,
  //         color: "magenta",
  //       }
  //     ),
  //   }),
  //   [selectedLightId, texture]
  // );

  return null;
}
