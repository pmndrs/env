import * as THREE from "three";

export function latlonToPhiTheta(latlon: { x: number; y: number }): {
  phi: number;
  theta: number;
} {
  const phi = THREE.MathUtils.mapLinear(latlon.y, -1, 1, Math.PI, 0);
  const theta = THREE.MathUtils.mapLinear(
    latlon.x,
    -1,
    1,
    0.5 * Math.PI,
    -1.5 * Math.PI
  );
  return { phi, theta };
}
