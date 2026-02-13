// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

/**
 * Preload Script Entry Point
 *
 * This file is loaded by Electron before the renderer process starts.
 * It acts as a secure bridge between the main process and renderer process.
 *
 * Import and execute the preload API implementation.
 */
export * from './preload-api';
