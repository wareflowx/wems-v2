import { registerPostHandlers } from './handlers';

/**
 * Register all IPC handlers for the application
 * This function should be called in the main process when the app is ready
 *
 * IPC Architecture:
 * Main Process (here) ←→ Renderer Process (React UI)
 *                    ↕ IPC (invoke)
 *                    ↕↕
 */
export function registerIpcHandlers() {
  console.log('🔌 Initializing IPC handlers...');

  // Register all post-related handlers
  registerPostHandlers();

  // Add more handler registrations here:
  // registerUserHandlers();
  // registerSettingsHandlers();
  // etc.

  console.log('✅ All IPC handlers registered');
}
