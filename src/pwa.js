import { registerSW } from "virtual:pwa-register";

/** Registers the service worker and applies updates automatically. */
export function setupPwa() {
  if (typeof window === "undefined") return;

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          registration.update().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", onVisible);
    },
  });
}
