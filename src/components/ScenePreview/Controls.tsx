import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { selectedCameraAtom } from "../../hooks/useStore";
import { useSetAtom } from "jotai";

export type ControlsProps = {
  autoRotate: boolean;
};

export const Controls = ({ autoRotate }: ControlsProps) => {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const setCamera = useSetAtom(selectedCameraAtom);

  return (
    <OrbitControls
      makeDefault
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      enableDamping={false}
      onEnd={(e) => {
        if (controlsRef.current) {
          setCamera({
            position: controlsRef.current.object.position.toArray(),
            rotation: controlsRef.current.object.rotation.toArray() as [
              number,
              number,
              number
            ],
          });
        }
      }}
    />
  );
};
