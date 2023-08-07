export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex flex-col from-neutral-900 to-neutral-800 bg-gradient-to-t overflow-hidden text-white">
      {children}
    </div>
  );
}
