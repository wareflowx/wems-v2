import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./constants";

// Expose write mode to renderer
contextBridge.exposeInMainWorld("getWriteMode", () => ipcRenderer.invoke(IPC_CHANNELS.GET_WRITE_MODE));

// Store the onMainReady callback from renderer
let onMainReadyCallback: (() => void) | null = null;

// Expose a function for renderer to register callback for main ready
contextBridge.exposeInMainWorld("onMainReady", (callback: () => void) => {
  console.log("[PRELOAD] onMainReady callback registered");
  onMainReadyCallback = callback;
});

// Expose a function to notify renderer is ready to receive ORPC
contextBridge.exposeInMainWorld("notifyRendererReady", () => {
  console.log("[PRELOAD] notifyRendererReady called");
  ipcRenderer.send(IPC_CHANNELS.RENDERER_READY);
});

// Listen for MAIN_READY and call the callback
ipcRenderer.on(IPC_CHANNELS.MAIN_READY, () => {
  console.log("[PRELOAD] Received MAIN_READY, calling renderer callback");
  if (onMainReadyCallback) {
    onMainReadyCallback();
  }
});

// Listen for lock status changes and expose via callback
let lockCallbacks: ((writeMode: boolean) => void)[] = [];
let lastWriteMode: boolean | null = null;

ipcRenderer.on(IPC_CHANNELS.LOCK_STATUS_CHANGED, (_event, writeMode: boolean) => {
  lastWriteMode = writeMode;
  lockCallbacks.forEach((cb) => cb(writeMode));
});

// Expose lock status change listener to renderer
contextBridge.exposeInMainWorld("onLockStatusChanged", (callback: (writeMode: boolean) => void) => {
  lockCallbacks.push(callback);
  // If we already have a known value, send it immediately
  if (lastWriteMode !== null) {
    callback(lastWriteMode);
  }
});
