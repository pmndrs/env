import { useAtom } from "jotai";
import { Perf } from "r3f-perf";
import { debugAtom } from "../../store";
import { useKeyPress } from "../../hooks/useKeyPress";

export function Debug() {
  const [debug, setDebug] = useAtom(debugAtom);

  useKeyPress("]", () => {
    setDebug((old) => !old);
  });

  if (!debug) {
    return null;
  }

  return (
    <>
      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />
      <gridHelper args={[100, 100, 0x444444, 0x444444]} />
      <axesHelper args={[1]} />
    </>
  );
}
