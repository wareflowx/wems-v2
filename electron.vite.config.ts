import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  // Main process configuration
  main: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main.ts'),
        external: ['better-sqlite3', '@electron/rebuild']
      }
    }
  },

  // Preload scripts configuration
  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/preload.ts'),
        external: ['better-sqlite3']
      }
    }
  },

  // Renderer process configuration
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108' // Electron 40+ equivalent
    }
  }
});
