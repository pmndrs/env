import { Toaster } from "sonner";
import { AppContent } from "./components/AppContent";
import { AppLayout } from "./components/AppLayout";
import { AppToolbar } from "./components/AppToolbar";
import { CommandPalette } from "./components/CommandPalette";

export default function App() {
  return (
    <>
      <Toaster theme="dark" richColors position="bottom-center" />
      <CommandPalette />
      <AppLayout>
        <AppToolbar />
        <AppContent />
      </AppLayout>
    </>
  );
}
