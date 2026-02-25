import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../core/constants";

// ============================================
// MINIMAL BRIDGE - Only expose necessary APIs
// Security: Minimal attack surface - only tunnel, no direct DB access
// Following ORPC best practices
// ============================================

// Store for lock status
let lockCallbacks: ((writeMode: boolean) => void)[] = [];
let lastWriteMode: boolean | null = null;

// ============================================
// SYSTEM - Window Controls (always available)
// ============================================
contextBridge.exposeInMainWorld("electron", {
  sys: {
    minimize: () => ipcRenderer.send("win:minimize"),
    maximize: () => ipcRenderer.send("win:maximize"),
    close: () => ipcRenderer.send("win:close"),
    getWriteMode: () => ipcRenderer.invoke("get-write-mode"),
  },

  // ============================================
  // RPC TUNNEL - Main proactively sends port to renderer
  // ============================================
  rpc: {
    // Notify main that renderer is ready (kept for compatibility)
    notifyReady: () => {
      console.log("[PRELOAD] rpc.notifyReady called");
      ipcRenderer.send(IPC_CHANNELS.START_ORPC_SERVER);
    },
  },

  // ============================================
  // LOCK STATUS - Event-based updates
  // ============================================
  onLockStatusChanged: (callback: (writeMode: boolean) => void) => {
    lockCallbacks.push(callback);
    if (lastWriteMode !== null) {
      callback(lastWriteMode);
    }
  },
});

// Listen for lock status changes from main
ipcRenderer.on(IPC_CHANNELS.LOCK_STATUS_CHANGED, (_event, writeMode: boolean) => {
  lastWriteMode = writeMode;
  lockCallbacks.forEach((cb) => cb(writeMode));
});

// Listen for MAIN_READY and forward to renderer via postMessage
// This ensures renderer initializes IPC only after preload is ready
ipcRenderer.on(IPC_CHANNELS.MAIN_READY, () => {
  console.log("[PRELOAD] MAIN_READY received, forwarding to renderer");
  window.postMessage({ type: "main-ready" }, "*");
});

// ============================================
// ORPC PORT TRANSFER - Main sends port to renderer
// Best Practice: Main creates channel, sends port via postMessage
// Renderer receives port directly (not through contextBridge!)
// ============================================
// Flow:
// 1. Main creates MessageChannel with two ports
// 2. Main keeps serverPort, sends clientPort to preload via postMessage
// 3. Preload forwards to renderer via window.postMessage
// 4. Renderer receives port directly - this is the ONLY source of truth

ipcRenderer.on(IPC_CHANNELS.ORPC_READY, (_event) => {
  const ports = (_event as unknown as { ports?: MessagePort[] }).ports;
  if (ports && ports.length > 0) {
    const port = ports[0];
    console.log("[PRELOAD] ORPC port received, forwarding to renderer via postMessage");

    // Forward to renderer via window.postMessage (NOT through contextBridge!)
    // This is the only reliable way to transfer MessagePort
    window.postMessage({ type: "orpc-port-ready" }, "*", [port]);
  }
});

console.log("[PRELOAD] Minimal bridge initialized: sys + rpc tunnel + lockStatus");
