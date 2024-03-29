import { lightAtomsAtom } from "../../store";
import { useAtomValue } from "jotai";
import { LightRenderer } from "./LightRenderer";

export function Env({ enableEvents = false }: { enableEvents?: boolean }) {
  const lightAtoms = useAtomValue(lightAtomsAtom);

  return (
    <>
      <color attach="background" args={["black"]} />
      {lightAtoms.map((lightAtom, i) => (
        <LightRenderer
          key={lightAtom.toString()}
          index={i}
          lightAtom={lightAtom}
          enableEvents={enableEvents}
        />
      ))}
    </>
  );
}
