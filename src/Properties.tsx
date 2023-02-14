import { Leva } from "leva";

export function Properties() {
  return (
    <>
      <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
        Properties
      </h2>
      <div className="p-2">
        <Leva
          neverHide
          fill
          flat
          titleBar={false}
          theme={{
            colors: {
              elevation1: "transparent",
              elevation2: "transparent",
              elevation3: "rgba(255, 255, 255, 0.1)",
            },
            sizes: {
              rootWidth: "100%",
            },
          }}
        />
      </div>
    </>
  );
}
