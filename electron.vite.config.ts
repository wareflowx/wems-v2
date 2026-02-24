import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Main process - auto-discovered at src/main/index.ts
  main: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      external: ['better-sqlite3', '@electron/rebuild']
    }
  },

  // Preload scripts - auto-discovered at src/preload/index.ts
  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      external: ['better-sqlite3']
    }
  },

  // Renderer process - auto-discovered at src/renderer/index.html
  renderer: {
    root: 'src/renderer',
    plugins: [
      tailwindcss()
    ],
    build: {
      target: 'chrome108' // Electron 40+ equivalent
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
