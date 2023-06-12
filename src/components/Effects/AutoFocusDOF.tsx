import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DepthOfField } from "@react-three/postprocessing";
import { Raycaster, Vector2, Vector3 } from "three";

export default function AutoFocusDOF({
  bokehScale = 10,
  focalLength = 0.01,
  focusSpeed = 0.2,
  mouseFocus = false,
  resolution = 2048,
}) {
  const camera = useThree((state) => state.camera);
  const mouse = useThree((state) => state.mouse);
  const scene = useThree((state) => state.scene);

  const ref = useRef<React.ElementRef<typeof DepthOfField>>(null);
  const raycaster = new Raycaster();
  const finalVector = new Vector3();

  raycaster.firstHitOnly = true;

  useFrame((state) => {
    if (mouseFocus) {
      raycaster.setFromCamera(mouse, camera);
    } else {
      raycaster.setFromCamera(new Vector2(0, 0), camera);
    }

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      finalVector.lerp(intersects[0].point, focusSpeed);
      if (ref.current) {
        ref.current.target = finalVector;
      }
    }
  });

  return (
    <DepthOfField
      focalLength={focalLength}
      bokehScale={bokehScale}
      height={resolution}
      ref={ref}
    />
  );
}
