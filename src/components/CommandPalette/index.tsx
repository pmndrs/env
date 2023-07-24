import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  BoltIcon,
  ChartBarIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

export function CommandPalette() {
  const [value, setValue] = useState("softbox");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Command.Dialog
      loop
      value={value}
      onValueChange={(v) => setValue(v)}
      open={open}
      onOpenChange={setOpen}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-3 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl"
    >
      <div className="flex items-center gap-3 h-12 px-2 border-b border-neutral-800 mb-3 pb-2">
        <MagnifyingGlassIcon className="text-neutral-600 w-5 h-5 translate-y-[1px]" />
        <Command.Input
          autoFocus
          placeholder="Find lights, backgrounds, and flags..."
          className="border-none bg-transparent flex-1 outline-none text-neutral-100 placeholder:text-neutral-600"
        />
      </div>

      <Command.List>
        <div className="flex items-stretch min-h-[300px] overflow-hidden gap-3">
          <div className="flex-[2]">
            {loading && <Command.Loading>Hang on…</Command.Loading>}

            <Command.Empty className="flex items-center justify-center text-sm px-2 py-4 whitespace-pre-wrap text-neutral-600">
              No results found.
            </Command.Empty>

            <Command.Group
              heading={
                <h3 className="text-neutral-400 text-xs font-light select-none px-2 my-2">
                  Lights
                </h3>
              }
            >
              <Item
                label="Softbox"
                value="softbox"
                subtitle="Even, diffused light source"
                colorTheme="orange"
              >
                <LightBulbIcon className="w-5 h-5 text-white" />
              </Item>
              <Item
                label="Umbrella"
                value="umbrella"
                subtitle="Deflect light off umbrella"
                colorTheme="orange"
              >
                <BoltIcon className="w-5 h-5 text-white" />
              </Item>
              <Item
                label="Flood"
                value="flood"
                subtitle="High-intensity direct light"
                colorTheme="orange"
              >
                <SunIcon className="w-5 h-5 text-white" />
              </Item>
            </Command.Group>

            <Command.Group
              heading={
                <h3 className="text-neutral-400 text-xs font-light select-none px-2 my-2">
                  Backgrounds
                </h3>
              }
            >
              <Item
                label="Sky"
                value="sky"
                subtitle="Simulated physical sky"
                colorTheme="green"
              >
                <PhotoIcon className="w-5 h-5 text-white" />
              </Item>
              <Item
                label="Gradient"
                value="gradient"
                subtitle="Two-stop color ramp"
                colorTheme="green"
              >
                <ChartBarIcon className="w-5 h-5 text-white" />
              </Item>
            </Command.Group>
          </div>

          <div className="w-px h-auto block border-none bg-neutral-800" />

          <div className="flex-[3] flex items-center justify-center relative overflow-hidden">
            {value && (
              <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-16 h-16 rounded-full bg-white blur-3xl" />
            )}
            {value === "softbox" && <Softbox />}
            {value === "umbrella" && <Umbrella />}
            {value === "flood" && <Flood />}
            {value === "sky" && <Sky />}
            {value === "gradient" && <Gradient />}
          </div>
        </div>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({
  children,
  value,
  label = value,
  subtitle,
  colorTheme = "orange",
}: {
  children: React.ReactNode;
  label?: string;
  value: string;
  subtitle: string;
  colorTheme?: "orange" | "blue" | "green" | "red" | "purple";
}) {
  return (
    <Command.Item
      value={value}
      onSelect={() => {}}
      className="group cursor-pointer flex items-center rounded-lg text-sm gap-3 text-neutral-100 p-2 mr-2 font-medium transition-all transition-none data-[selected='true']:bg-blue-500 data-[selected='true']:text-white"
      style={{ contentVisibility: "auto" }}
    >
      <div
        className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-md",
          colorTheme === "orange" && "bg-orange-400",
          colorTheme === "blue" && "bg-blue-400",
          colorTheme === "green" && "bg-green-400",
          colorTheme === "red" && "bg-red-400",
          colorTheme === "purple" && "bg-purple-400"
        )}
      >
        {children}
      </div>
      <div className="flex flex-col">
        <span>{label}</span>
        <span className="text-xs font-normal text-neutral-500 group-data-[selected='true']:text-white md:inline hidden">
          {subtitle}
        </span>
      </div>
    </Command.Item>
  );
}

function Softbox() {
  return (
    <img
      src="https://cdn.shopify.com/s/files/1/0089/0093/5765/products/aputure-light-octadome-120-octagonal-softbox-vitopal-3.png?v=1681377047&width=1000"
      alt="Softbox"
      className="w-48 h-48"
      loading="lazy"
    />
  );
}

function Umbrella() {
  return (
    <img
      src="https://www.rogueflash.com/cdn/shop/files/38UmbrellawithDiffuser1_1000x.png?v=1687891262"
      alt="Umbrella"
      className="w-48 h-48"
      loading="lazy"
    />
  );
}

function Flood() {
  return (
    <img
      src="https://i.shgcdn.com/2f03bbfc-4f99-490b-a1d7-e5a7e2056731/-/format/auto/-/preview/3000x3000/-/quality/lighter/"
      alt="Flood"
      className="w-48 h-48"
      loading="lazy"
    />
  );
}

function Sky() {
  return (
    <img
      src="https://tr.rbxcdn.com/c6742afbb50ca048d1fa07b532ecffb5/420/420/Hat/Png"
      alt="Sky"
      className="w-48 h-48"
      loading="lazy"
    />
  );
}

function Gradient() {
  return (
    <img
      src="https://t4.ftcdn.net/jpg/05/24/17/45/360_F_524174530_5vVjWkJ4AHkWNUKt07DVd61ImlITjoi1.png"
      alt="Gradient"
      className="w-48 h-48"
      loading="lazy"
    />
  );
}
