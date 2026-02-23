import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./constants";

// Expose write mode to renderer
contextBridge.exposeInMainWorld("getWriteMode", () => ipcRenderer.invoke(IPC_CHANNELS.GET_WRITE_MODE));

// Expose a function to notify renderer is ready to receive ORPC
contextBridge.exposeInMainWorld("notifyRendererReady", () => {
  console.log("[PRELOAD] notifyRendererReady called");
  ipcRenderer.send(IPC_CHANNELS.RENDERER_READY);
});

// Listen for MAIN_READY and notify renderer via callback
ipcRenderer.on(IPC_CHANNELS.MAIN_READY, () => {
  console.log("[PRELOAD] Received MAIN_READY, notifying renderer");
  // Dispatch event directly on window
  window.dispatchEvent(new Event("main-ready"));
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
