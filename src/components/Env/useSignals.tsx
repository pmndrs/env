import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { Easings, type Easing, type Signal } from "../../hooks/useStore";

export function useSignals<R extends React.MutableRefObject<THREE.Mesh | null>>(
  ref: R,
  signals: Signal[] = []
) {
  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const dt = clock.getElapsedTime();

    for (const signal of signals) {
      if (signal.animation === "pingpong") {
        const t = dt % (signal.duration * 2);

        if (t < signal.duration) {
          const v = ease(signal.easing, t / signal.duration);
          ref.current[signal.property][signal.axis] =
            signal.start + (signal.end - signal.start) * v;
        } else {
          const v = ease(
            signal.easing,
            (t - signal.duration) / signal.duration
          );
          ref.current[signal.property][signal.axis] =
            signal.end + (signal.start - signal.end) * v;
        }
      } else if (signal.animation === "loop") {
        const t = dt % signal.duration;
        const v = ease(signal.easing, t / signal.duration);

        ref.current[signal.property][signal.axis] =
          signal.start + (signal.end - signal.start) * v;
      } else if (signal.animation === "once") {
        const t = Math.min(dt, signal.duration);
        const v = ease(signal.easing, t / signal.duration);

        ref.current[signal.property][signal.axis] =
          signal.start + (signal.end - signal.start) * v;
      }
    }

    // Manually update the transform matrix
    ref.current.updateMatrix();
  });

  return ref;
}

function ease(easing: Easing, value: number) {
  const [mX1, mY1, mX2, mY2] = Easings[easing];
  const epsilon = 1e-6;
  const curveX = (t: number) => {
    const v = 1 - t;
    return 3 * v * v * t * mX1 + 3 * v * t * t * mX2 + t * t * t;
  };
  const curveY = (t: number) => {
    const v = 1 - t;
    return 3 * v * v * t * mY1 + 3 * v * t * t * mY2 + t * t * t;
  };
  const solveCurveX = (x: number) => {
    let t2 = x;
    let derivative;
    let x2;
    for (let i = 0; i < 8; i++) {
      x2 = curveX(t2) - x;
      if (Math.abs(x2) < epsilon) {
        return t2;
      }
      derivative = 3 * t2 * t2 - 6 * t2 * x + 3 * x;
      if (Math.abs(derivative) < epsilon) {
        break;
      }
      t2 -= x2 / derivative;
    }
    let t1 = 1;
    let t0 = 0;
    t2 = x;
    while (t1 > t0) {
      x2 = curveX(t2) - x;
      if (Math.abs(x2) < epsilon) {
        return t2;
      }
      if (x2 > 0) {
        t1 = t2;
      } else {
        t0 = t2;
      }
      t2 = (t1 + t0) * 0.5;
    }
    return t2;
  };
  return curveY(solveCurveX(value));
}
