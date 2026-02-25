import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "electron-vite";

export default defineConfig({
  // Main process configuration
  main: {
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      external: ["better-sqlite3", "@electron/rebuild"],
    },
  },

  // Preload scripts configuration
  preload: {
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    build: {
      external: ["better-sqlite3"],
    },
  },

  // Renderer process configuration
  renderer: {
    root: "src/renderer",
    server: {
      host: "127.0.0.1",
      port: 5173,
    },
    plugins: [tailwindcss()],
    build: {
      target: "chrome108", // Electron 40+ equivalent
    },
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src/renderer/src"),
        "@@": resolve(import.meta.dirname, "src/core"),
      },
    },
  },
});
