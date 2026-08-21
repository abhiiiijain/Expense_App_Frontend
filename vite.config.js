import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function requiredEnv(env, name) {
  const value = env[name];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // App code always needs the API URL (baked into the client bundle)
  requiredEnv(env, "VITE_API_BASE_URL");

  const config = {
    plugins: [react()],
    build: {
      outDir: "dist",
      // Hidden maps keep debugging possible without shipping sources publicly
      sourcemap: mode === "production" ? "hidden" : true,
    },
  };

  // Dev / preview server port comes strictly from .env (no default)
  if (command === "serve") {
    const port = Number(requiredEnv(env, "VITE_PORT"));
    if (Number.isNaN(port)) {
      throw new Error("VITE_PORT must be a valid number");
    }
    config.server = { port, strictPort: true };
    config.preview = { port };
  }

  return config;
});
