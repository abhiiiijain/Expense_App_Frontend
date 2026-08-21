import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Use development env files during tests (VITE_* from .env.development)
  mode: "development",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    globals: true,
  },
});
