import * as THREE from "three";
import { RenderCubeTexture } from "@react-three/drei";
import { ComputeFunction, useThree } from "@react-three/fiber";
import { Env } from "../Env";
import { CubeMaterial } from "./CubeMaterial";
import { useRef } from "react";

const zero = new THREE.Vector3(0, 0, 0);
const dir = new THREE.Vector3(0, 0, 0);

export function EnvMapPlane() {
  const ref = useRef<THREE.Mesh>(null!);
  const viewport = useThree((state) => state.viewport);

  const compute: ComputeFunction = (event, state) => {
    state.pointer.set(
      (event.offsetX / state.size.width) * 2 - 1,
      -(event.offsetY / state.size.height) * 2 + 1
    );
    state.raycaster.setFromCamera(state.pointer, state.camera);

    const [intersection] = state.raycaster.intersectObject(ref.current);

    if (!intersection) {
      return false;
    }

    const { uv } = intersection;

    if (!uv) {
      return false;
    }

    // Convert UV to lat/lon (invert x to match texture)
    const longitude = (1 - uv.x) * 2 * Math.PI - Math.PI + Math.PI / 2;
    const latitude = uv.y * Math.PI;

    // Convert lat/lon to direction
    dir.set(
      -Math.sin(longitude) * Math.sin(latitude),
      Math.cos(latitude),
      -Math.cos(longitude) * Math.sin(latitude)
    );

    state.raycaster.set(zero, dir);

    return undefined;
  };

  return (
    <>
      <mesh
        ref={ref}
        scale={[viewport.width, viewport.height, 1]}
        rotation={[Math.PI, 0, 0]}
      >
        <planeGeometry />
        <CubeMaterial>
          <RenderCubeTexture attach="map" compute={compute} frames={Infinity}>
            <Env enableEvents />
          </RenderCubeTexture>
        </CubeMaterial>
      </mesh>
    </>
  );
}
