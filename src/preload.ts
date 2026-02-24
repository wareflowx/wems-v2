import { contextBridge, ipcRenderer, MessagePortMain } from "electron";
import { IPC_CHANNELS } from "./constants";

// Expose write mode to renderer
contextBridge.exposeInMainWorld("getWriteMode", () => ipcRenderer.invoke(IPC_CHANNELS.GET_WRITE_MODE));

// State to track if main is ready
let mainReady = false;
let mainReadyResolve: (() => void) | null = null;
let rendererReadyNotified = false;

// Store port received from main
let orpcPort: MessagePort | null = null;

// Callback that will be set by renderer when it's ready
let onPortReady: ((port: MessagePort) => void) | null = null;

// Listen for ORPC_READY from main and forward to renderer
ipcRenderer.on(IPC_CHANNELS.ORPC_READY, (event) => {
  console.log("[PRELOAD] ★★★ Received ORPC_READY via ipcRenderer! ★★★");

  const [port] = event.ports;
  if (port) {
    console.log("[PRELOAD] port.constructor:", port.constructor?.name);
    console.log("[PRELOAD] typeof port.addEventListener:", typeof port.addEventListener);

    // Store the port
    orpcPort = port;

    // If renderer has registered callback, call it now
    if (onPortReady) {
      console.log("[PRELOAD] Calling onPortReady callback...");
      onPortReady(port);
    } else {
      // No callback yet - wait for renderer to be ready via window event
      console.log("[PRELOAD] No callback, waiting for renderer...");

      // Poll until renderer is ready (callback is registered)
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (onPortReady && orpcPort) {
          clearInterval(checkInterval);
          console.log("[PRELOAD] Renderer ready, calling callback!");
          onPortReady(orpcPort);
        }
        if (attempts > 100) { // 10 seconds timeout
          clearInterval(checkInterval);
          console.log("[PRELOAD] Timeout waiting for renderer callback");
        }
      }, 100);
    }
  } else {
    console.log("[PRELOAD] ERROR: No port in event.ports!");
  }
});

// Expose function for renderer to register callback
contextBridge.exposeInMainWorld("onORPCPortReady", (callback: (port: MessagePort) => void) => {
  console.log("[PRELOAD] onORPCPortReady callback registered");
  onPortReady = callback;

  // If port already received, call immediately
  if (orpcPort) {
    console.log("[PRELOAD] Port already available, calling callback now...");
    callback(orpcPort);
  }
});

// Expose a function that returns a promise that resolves when main is ready
contextBridge.exposeInMainWorld("waitForMainReady", () => {
  console.log("[PRELOAD] waitForMainReady called, mainReady:", mainReady);
  if (mainReady) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    mainReadyResolve = resolve;
  });
});

// Expose a function to notify renderer is ready to receive ORPC
contextBridge.exposeInMainWorld("notifyRendererReady", () => {
  // Only send once - don't spam
  if (rendererReadyNotified) {
    console.log("[PRELOAD] notifyRendererReady: already notified, skipping");
    return;
  }
  rendererReadyNotified = true;
  console.log("[PRELOAD] notifyRendererReady called");
  ipcRenderer.send(IPC_CHANNELS.RENDERER_READY);
});

// Listen for MAIN_READY - this means main process is ready to receive ORPC setup
// Once received, we can safely send RENDERER_READY
ipcRenderer.on(IPC_CHANNELS.MAIN_READY, () => {
  console.log("[PRELOAD] Received MAIN_READY, resolving promise and triggering initialization");
  mainReady = true;
  if (mainReadyResolve) {
    mainReadyResolve();
    mainReadyResolve = null;
  }

  // NOW we can safely notify main that renderer is ready
  // (Listener is guaranteed to be set up now)
  if (!rendererReadyNotified) {
    rendererReadyNotified = true;
    console.log("[PRELOAD] Sending RENDERER_READY (main is ready)");
    ipcRenderer.send(IPC_CHANNELS.RENDERER_READY);
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

// CRITICAL: Wait for MAIN_READY before sending RENDERER_READY
// This ensures the main process has set up the listener before we notify
// The issue was that preload runs BEFORE setupORPC() in main.ts
console.log("[PRELOAD] Waiting for MAIN_READY before triggering initialization...");
