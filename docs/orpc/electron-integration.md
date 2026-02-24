# Electron Integration Guide

This guide covers the proper integration of ORPC with Electron, including context isolation, preload scripts, and MessagePort transfer.

## Understanding Electron Contexts

Electron has multiple isolated contexts:

```
┌─────────────────────────────────────────────┐
│              Main Process                    │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │         Main World                      │  │
│  │  - Node.js APIs                         │  │
│  │  - Native modules                       │  │
│  │  - File system                          │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
            webContents.send()
                    │
┌─────────────────────────────────────────────┐
│              Renderer Process                 │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │       Preload (Isolated World)        │  │
│  │  - contextBridge                       │  │
│  │  - Limited APIs                        │  │
│  └────────────────────────────────────────┘  │
│                    │                          │
│                    │ contextBridge           │
│                    ▼                          │
│  ┌────────────────────────────────────────┐  │
│  │      Renderer World                    │  │
│  │  - Browser APIs                        │  │
│  │  - React/Vue                           │  │
│  │  - No Node.js                          │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## The MessagePort Challenge

### Why MessagePort is Tricky

1. **contextBridge serialization**: When passing ports through `contextBridge`, they get serialized/cloned
2. **Separate contexts**: Preload and renderer are in different JavaScript contexts
3. **webContents.postMessage**: Sends to preload, not renderer

### The Correct Pattern

#### Main Process

```typescript
// main.ts
import { ipcMain, MessageChannelMain } from "electron/main";
import { rpcHandler } from "./ipc/handler";

ipcMain.on("start-orpc-server", (event) => {
  // Get the port from event.ports (array)
  const [serverPort] = event.ports;

  if (!serverPort) {
    console.error("[ORPC] No port received");
    return;
  }

  // Upgrade the handler with the port
  rpcHandler.upgrade(serverPort);
  serverPort.start();

  console.log("[ORPC] Server ready");
});
```

#### Preload Script

```typescript
// preload.ts
import { ipcRenderer } from "electron";

// The key: use window.addEventListener for message event
// NOT ipcRenderer.on for receiving the port

window.addEventListener("message", (event) => {
  if (event.data === "start-orpc-client") {
    // Extract port from event.ports
    const [serverPort] = event.ports;

    // Forward to main process via IPC
    ipcRenderer.postMessage("start-orpc-server", null, [serverPort]);
  }
});

// Alternative: Listen for port directly (if main sends it)
ipcRenderer.on("orpc-port-ready", (event) => {
  const [port] = event.ports;
  window.__ORPC_PORT__ = port;
});
```

#### Renderer Process

```typescript
// Create the channel
const { port1: clientPort, port2: serverPort } = new MessageChannel();

// Send one port to preload (which forwards to main)
window.postMessage("start-orpc-client", "*", [serverPort]);

// Use the other port for the client
const link = new RPCLink({ port: clientPort });
const client = createORPCClient(link);

clientPort.start();
```

## Common Mistakes

### ❌ Wrong: Using ipcRenderer.on for Port

```typescript
// This doesn't work - port gets serialized/cloned
ipcRenderer.on("orpc-ready", (event) => {
  const port = event.ports[0]; // Lost functionality!
  // port.addEventListener is undefined!
});
```

### ❌ Wrong: Polling for Port

```typescript
// Wasteful and unreliable
setInterval(() => {
  const port = window.getORPCPort?.();
  if (port) { /* use port */ }
}, 100);
```

### ✅ Correct: Event-Driven

```typescript
// Proper event-based approach
window.addEventListener("message", (event) => {
  if (event.data === "orpc-port") {
    const [port] = event.ports;
    // port.addEventListener is available!
  }
});
```

## Channel Naming Convention

Use consistent channel names:

```typescript
// constants.ts
export const IPC_CHANNELS = {
  ORPC_SERVER: "start-orpc-server",
  ORPC_CLIENT_READY: "start-orpc-client",
} as const;
```

## Complete Flow Diagram

```
Renderer                              Main
  │                                     │
  │  1. Create MessageChannel           │
  │     const { port1, port2 } =       │
  │        new MessageChannel()        │
  │                                     │
  │  2. postMessage to preload          │
  ├───────────────────────────────────► │
  │     window.postMessage(            │
  │       "start-orpc-client",          │
  │       "*",                         │
  │       [port2]                      │
  │     )                              │
  │                                     │
  │                              Preload│
  │  3. Receive in preload              │
  │     window.addEventListener(        │
  │       "message",                   │
  │       (e) => {                     │
  │         const [p] = e.ports;       │
  │         ipcRenderer.postMessage(   │
  │           "start-orpc-server",     │
  │           null,                    │
  │           [p]                      │
  │         )                          │
  │       }                            │
  │                                     │
  │                              Main   │
  │  4. Receive in main                 │
  │     ipcMain.on(                    │
  │       "start-orpc-server",         │
  │       (e) => {                     │
  │         const [sp] = e.ports;     │
  │         handler.upgrade(sp);       │
  │         sp.start();                │
  │       }                            │
  │                                     │
  │  5. Use clientPort locally          │
  │     const link = new RPCLink({    │
  │       port: port1                  │
  │     });                            │
  │     port1.start();                 │
  │                                     │
  ▼                                     ▼
```

## Debugging Tips

1. **Check port type**: `console.log(port.constructor.name)` should be `MessagePort`
2. **Verify addEventListener**: `console.log(typeof port.addEventListener)` should be `function`
3. **Console logs**: Add logs at each step of the flow

## Related Documents

- [Setup Guide](./setup.md) - Basic setup
- [Error Handling](./error-handling.md) - Add error interceptors
- [Troubleshooting](./troubleshooting.md) - Common issues
