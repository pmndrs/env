import { Perf } from "r3f-perf";

export function Debug() {
  return (
    <Perf minimal position="bottom-right" style={{ position: "absolute" }} />
  );
}
