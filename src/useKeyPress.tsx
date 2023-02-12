import { useEffect } from "react";

export function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    function keyDownHandler(event: KeyboardEvent) {
      if (event.key === targetKey) {
        handler();
      }
    }
    window.addEventListener("keypress", keyDownHandler);
    return () => {
      window.removeEventListener("keypress", keyDownHandler);
    };
  }, []);
}
