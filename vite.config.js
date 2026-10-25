import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

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
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "logo-mark.png",
          "logo-horizontal.png",
          "logo-vertical.png",
          "icons/apple-touch-icon.png",
        ],
        manifest: {
          name: "SpendWise",
          short_name: "SpendWise",
          description: "Track expenses, income, and balances. Track • Plan • Save • Grow.",
          theme_color: "#1e3a8a",
          background_color: "#f8fafc",
          display: "standalone",
          orientation: "portrait-primary",
          start_url: "/",
          scope: "/",
          lang: "en",
          categories: ["finance", "productivity"],
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
          runtimeCaching: [
            {
              // Never cache authenticated API traffic
              urlPattern: ({ url }) =>
                url.pathname.startsWith("/api") ||
                /onrender\.com$/i.test(url.hostname),
              handler: "NetworkOnly",
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
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
