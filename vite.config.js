import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    // Add Sentry plugin for source map upload (production only)
    process.env.NODE_ENV === 'production' && sentryVitePlugin({
      org: process.env.SENTRY_ORG || "lokus",
      project: process.env.SENTRY_PROJECT || "lokus-app",
      authToken: process.env.SENTRY_AUTH_TOKEN,

      // Source maps configuration
      sourcemaps: {
        assets: "./dist/**",
        ignore: ["node_modules"],
        filesToDeleteAfterUpload: ["**/*.map"],  // Clean up source maps after upload
      },

      // Release configuration
      release: {
        name: process.env.npm_package_version || "1.3.3",
        cleanArtifacts: true,
        setCommits: {
          auto: true,
        },
      },

      // Telemetry
      telemetry: false,

      // Only upload if auth token is provided
      enabled: !!process.env.SENTRY_AUTH_TOKEN,
    }),
  ].filter(Boolean),  // Filter out false values
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build configuration
  build: {
    sourcemap: true,  // Generate source maps for Sentry
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
