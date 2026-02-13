/**
 * Preload API Implementation
 *
 * This file creates the secure bridge between the main process and renderer process
 * using Electron's contextBridge and ipcRenderer
 *
 * SECURITY: Only the functions exposed here are accessible to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './types';

/**
 * Create the electronAPI object that will be exposed to the renderer
 *
 * This object maps each API method to its corresponding IPC handler
 * registered in the main process (src/ipc/handlers/posts.ts)
 */
const electronAPI: ElectronAPI = {
  posts: {
    /**
     * Get all posts
     * Maps to: ipcMain.handle('posts:getAll', ...)
     */
    getAll: () => ipcRenderer.invoke('posts:getAll'),

    /**
     * Get post by ID
     * Maps to: ipcMain.handle('posts:getById', ...)
     */
    getById: (id) => ipcRenderer.invoke('posts:getById', id),

    /**
     * Create new post
     * Maps to: ipcMain.handle('posts:create', ...)
     */
    create: (post) => ipcRenderer.invoke('posts:create', post),

    /**
     * Update post
     * Maps to: ipcMain.handle('posts:update', ...)
     */
    update: (id, post) => ipcRenderer.invoke('posts:update', id, post),

    /**
     * Delete post
     * Maps to: ipcMain.handle('posts:delete', ...)
     */
    delete: (id) => ipcRenderer.invoke('posts:delete', id),
  },
};

/**
 * Expose the API to the renderer process using contextBridge
 *
 * This makes the API available via: window.electronAPI.*
 *
 * SECURITY NOTES:
 * - Only what's explicitly exposed here is accessible
 * - Renderer cannot modify this API (read-only)
 * - Renderer cannot access Node.js modules directly
 * - All access goes through IPC for security
 */
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('✅ Preload API exposed to renderer process');
} catch (error) {
  console.error('❌ Failed to expose preload API:', error);
}

/**
 * Export the ElectronAPI type for use in TypeScript definitions
 */
export type { ElectronAPI };
