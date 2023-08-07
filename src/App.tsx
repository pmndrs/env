import { Toaster } from "sonner";
import { AppToolbar } from "./components/AppToolbar";
import { CommandPalette } from "./components/CommandPalette";
import { AppContent } from "./components/AppContent";
import { AppLayout } from "./components/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <AppToolbar />
      <AppContent />
      <Toaster theme="dark" />
      <CommandPalette />
    </AppLayout>
  );
}
