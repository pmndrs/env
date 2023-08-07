import { Environment } from "@react-three/drei";
import { lightAtomsAtom } from "../../store";
// import { UmbrellaLightMaterial } from "./UmbrellaLightMaterial";
import { useAtomValue } from "jotai";
import { LightRenderer } from "./LightRenderer";

export function Env() {
  const lightAtoms = useAtomValue(lightAtomsAtom);

  return (
    <Environment
      resolution={2048}
      far={100}
      near={0.01}
      frames={Infinity}
      background
    >
      <color attach="background" args={["black"]} />
      {lightAtoms.map((lightAtom) => (
        <LightRenderer key={lightAtom.toString()} lightAtom={lightAtom} />
      ))}
    </Environment>
  );
}
