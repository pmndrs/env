import { Perf } from "r3f-perf";

export function Debug() {
  return (
    <>
      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />
      <gridHelper args={[100, 100, 0x444444, 0x444444]} />
      <axesHelper args={[1]} />
    </>
  );
}
