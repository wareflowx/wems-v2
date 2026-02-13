import { defineConfig } from 'vite';
import type { ConfigEnv, UserConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  return {
    // Rolldown is automatically used when importing from 'rolldown-vite'

    // Externalize native modules to prevent bundling issues
    // better-sqlite3 is a native Node.js addon that cannot be bundled
    external: [
      'better-sqlite3',
      'drizzle-orm',
      'drizzle-orm/better-sqlite3',
      'electron',
      'electron-squirrel-startup',
    ],

    build: {
      // Ensure native bindings are accessible at runtime
      target: 'node18',
      // Don't minify in development for better error messages
      minify: mode === 'production' ? 'esbuild' : false,
    },
  };
});
