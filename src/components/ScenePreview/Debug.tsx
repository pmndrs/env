import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { Perf } from "r3f-perf";
import { useRef } from "react";
import * as THREE from "three";
import { useKeyPress } from "../../hooks/useKeyPress";
import { debugAtom, pointerAtom } from "../../store";

export function Debug() {
  const [debug, setDebug] = useAtom(debugAtom);

  useKeyPress("]", () => {
    setDebug((old) => !old);
  });

  const arrowRef = useRef<THREE.ArrowHelper>(null);
  const polarGridRef = useRef<THREE.PolarGridHelper>(null);

  const readPointer = useAtomCallback((get) => {
    const pointer = get(pointerAtom);
    return pointer;
  });

  useFrame(() => {
    if (!debug) {
      return;
    }

    const { point, normal } = readPointer();

    if (arrowRef.current) {
      arrowRef.current.position.copy(point);
      arrowRef.current.setDirection(normal);
    }

    if (polarGridRef.current) {
      polarGridRef.current.position.copy(point);
      polarGridRef.current.lookAt(
        point.clone().add(normal.clone().multiplyScalar(1))
      );
      polarGridRef.current.rotateX(Math.PI / 2);
      polarGridRef.current.updateMatrixWorld();
    }
  });

  if (!debug) {
    return null;
  }

  return (
    <>
      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />
      <gridHelper args={[100, 100, 0x444444, 0x444444]} />
      <axesHelper args={[1]} />
      <arrowHelper ref={arrowRef} args={[undefined, undefined, 0.07, "red"]} />
      <polarGridHelper
        ref={polarGridRef}
        args={[0.03, 1, 1, undefined, "yellow", "yellow"]}
        renderOrder={-1}
      />
    </>
  );
}
