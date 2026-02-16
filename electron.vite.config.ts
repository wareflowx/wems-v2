import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

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
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    plugins: [
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108' // Electron 40+ equivalent
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
