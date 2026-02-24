# ORPC MessagePort Transfer in Electron

## Problem Summary

Window controls (minimize, maximize, close) were not working because the ORPC MessagePort transfer between main process and renderer had multiple issues.

## Root Causes

### 1. Context Isolation Creates Separate Worlds

When `contextIsolation` is enabled (default since Electron 12), the preload script runs in an **Isolated World** with its own dedicated `window` and `document` globals. These are completely separate from the renderer's window.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN PROCESS                             │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐                         │
│  │   Browser    │     │   Message    │                         │
│  │   Window     │     │   Channel    │                         │
│  └──────┬───────┘     │   Main       │                         │
│         │             └──────┬───────┘                         │
│         │                    │                                  │
│         │ webContents        │                                  │
│         │ .postMessage()     │                                  │
│         │                    │                                  │
└─────────┼────────────────────┼──────────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRELOAD (Isolated World)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    window (preload)                      │  │
│  │                                                           │  │
│  │  ipcRenderer.on() ◄── receives port                     │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│         ✗ CANNOT pass MessagePort through contextBridge        │
│         ✗ Port loses all methods when serialized               │
└─────────────────────────────────────────────────────────────────┘
          │
          │ window.postMessage with transfer list
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RENDERER (Renderer World)                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    window (renderer)                      │  │
│  │                                                           │  │
│  │  window.addEventListener("message") ◄── receives port   │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Wrong Listener in Preload

The preload was using `window.addEventListener("message")` which listens on the preload's isolated `window`. However, `webContents.postMessage` delivers messages to the renderer's `window`, not the preload's.

**Solution**: Use `ipcRenderer.on` in preload to receive the port.

### 3. MessagePort Cannot Pass Through contextBridge

When a MessagePort is passed through `contextBridge.exposeInMainWorld`, it gets **serialized/cloned** and loses all its methods - it becomes an empty object `{}`.

```
In preload (correct):
  port.constructor: MessagePort
  typeof port.addEventListener: function  ✓

In renderer via contextBridge getter (broken):
  port.constructor: Object
  typeof port.addEventListener: undefined  ✗
```

**Solution**: Use `window.postMessage` with the port in the transfer list to forward it directly to the renderer's window.

## The Fix

### 1. preload.ts - Forward port via window.postMessage

```typescript
// Listen for ORPC_READY from main via ipcRenderer
ipcRenderer.on(IPC_CHANNELS.ORPC_READY, (event) => {
  const [port] = event.ports;
  if (port) {
    // Use window.postMessage to forward the port to the renderer
    // The port is transferred, so we can't use it after this
    window.postMessage({ type: "ORPC_PORT", port: null }, "*", [port]);
  }
});
```

### 2. ipc/manager.ts - Listen for port via window.addEventListener

```typescript
constructor() {
  // Listen for ORPC port from preload via window.postMessage
  window.addEventListener("message", (event) => {
    if (event.data?.type === "ORPC_PORT" && event.ports[0]) {
      const port = event.ports[0];
      // Port now has all valid methods!
      this.initWithPort(port);
    }
  });
}
```

### 3. main.ts - Setup ORPC AFTER window exists

The handlers need access to the window context. Setup ORPC after creating the window:

```typescript
// Order matters:
await getDb(canWrite);     // 1. Initialize database
createWindow();            // 2. Create window FIRST
await setupORPC();         // 3. Setup ORPC (handlers need window)
mainWindow?.webContents.send(IPC_CHANNELS.MAIN_READY);  // 4. Notify renderer
```

## Key Insight: Transfer vs Clone

The critical difference is using the **transfer list** in `postMessage`:

```typescript
// ✗ Wrong - port gets cloned, loses methods
window.postMessage({ type: "ORPC_PORT", port: port }, "*");

// ✓ Correct - port is transferred, keeps all methods
window.postMessage({ type: "ORPC_PORT", port: null }, "*", [port]);
```

When a port is in the transfer list, it's moved (not copied) to the receiver, preserving all its functionality.

## Files Changed

- `src/preload.ts` - Forward port via window.postMessage
- `src/ipc/manager.ts` - Receive port via window.addEventListener
- `src/main.ts` - Reorder initialization steps

## Related Issues

- Issue #37: Window controls not working
- Issue #39: ORPC MessagePort transfer analysis
