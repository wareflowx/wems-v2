# ORPC Setup Guide

This guide covers the proper setup of ORPC in an Electron application.

## Installation

```bash
npm install @orpc/server @orpc/client @orpc/contract
```

## Project Structure

```
src/
├── ipc/
│   ├── router.ts          # Main router definition
│   ├── handler.ts         # RPCHandler configuration
│   ├── manager.ts         # Client-side manager
│   ├── database/
│   │   ├── handlers.ts    # Database procedures
│   │   ├── schemas.ts     # Zod input/output schemas
│   │   └── index.ts      # Database router
│   └── ...
├── actions/
│   └── database.ts       # Renderer-side DB actions
└── preload.ts            # Minimal bridge
```

## Server-Side Setup

### 1. Define Router

Create procedures in `src/ipc/database/handlers.ts`:

```typescript
import { os } from "@orpc/server";
import { getDb } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getEmployees = os.handler(async () => {
  const db = await getDb();
  return db.select().from(employees).orderBy(employees.id);
});
```

### 2. Create Handler with Interceptors

In `src/ipc/handler.ts`:

```typescript
import { RPCHandler } from "@orpc/server/message-port";
import { onError } from "@orpc/server";
import { router } from "./router";

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error, { path, input }) => {
      console.error(`[ORPC Error] ${path}:`, error);
    }),
  ],
});
```

### 3. Main Process Integration

In `src/main.ts`:

```typescript
import { ipcMain, MessageChannelMain } from "electron/main";
import { rpcHandler } from "./ipc/handler";

ipcMain.on("start-orpc-server", (event) => {
  const [serverPort] = event.ports;

  if (!serverPort) {
    console.error("[ORPC] No port received");
    return;
  }

  rpcHandler.upgrade(serverPort);
  serverPort.start();

  console.log("[ORPC] Server upgraded and started");
});
```

## Client-Side Setup

### 1. Minimal Preload

In `src/preload.ts`:

```typescript
contextBridge.exposeInMainWorld("electron", {
  rpc: {
    notifyReady: () => {
      ipcRenderer.send("start-orpc-server");
    },
  },
});

// Listen for port from main
window.addEventListener("message", (event) => {
  if (event.data === "orpc-port-ready") {
    const [port] = event.ports;
    window.__ORPC_PORT__ = port;
  }
});
```

### 2. Client Manager

In `src/ipc/manager.ts`:

```typescript
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";

class IPCManager {
  private client: ReturnType<typeof createORPCClient> | null = null;

  init() {
    const port = window.__ORPC_PORT__;
    if (!port) return;

    const link = new RPCLink({ port });
    this.client = createORPCClient(link);
    port.start();
  }

  get client() {
    if (!this.client) {
      throw new Error("ORPC not initialized");
    }
    return this.client;
  }
}

export const ipc = new IPCManager();
```

### 3. Initialize at App Startup

In `src/app.tsx`:

```typescript
import { ipc } from "./ipc/manager";

ipc.init();
```

## Best Practices Summary

| Practice | Do | Don't |
|----------|-----|-------|
| Preload | Expose minimal API | Expose database functions |
| Port Transfer | Event-driven | Polling |
| Error Handling | Centralized interceptors | Try-catch everywhere |
| Validation | Zod schemas | Manual validation |
| Router | Single source of truth | Duplicate handlers |

## Next Steps

- [Electron Integration](./electron-integration.md) - Detailed Electron setup
- [Error Handling](./error-handling.md) - Add error interceptors
- [Contracts](./contracts.md) - Contract-first development
