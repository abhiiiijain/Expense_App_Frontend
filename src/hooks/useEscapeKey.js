import { useEffect } from "react";

export function useEscapeKey(enabled, onEscape) {
  useEffect(() => {
    if (!enabled || !onEscape) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onEscape();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEscape]);
}
