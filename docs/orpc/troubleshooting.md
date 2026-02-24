# Troubleshooting Guide

This guide covers common issues with ORPC in Electron and how to fix them.

## Common Issues

### 1. Port Transfer Failure

**Symptom**: `port.addEventListener` is undefined

**Cause**: Port gets serialized/cloned through contextBridge, losing functionality

**Solution**:
```typescript
// ❌ Wrong - using ipcRenderer.on
ipcRenderer.on("orpc-ready", (event) => {
  const port = event.ports[0]; // Loses functionality!
});

// ✅ Correct - use window.addEventListener
window.addEventListener("message", (event) => {
  const [port] = event.ports;
  // port.addEventListener is available!
});
```

---

### 2. Infinite Loading / Timeout

**Symptom**: Data never loads, spinner keeps spinning

**Cause**: ORPC not properly connected, or handlers not registered

**Debug Steps**:
1. Check console for `[ORPC]` logs
2. Verify port transfer completed
3. Check if handlers are registered

**Solution**:
```typescript
// Add logging to verify connection
console.log("[IPC] Initializing ORPC...");

// In handler
export const getEmployees = os.handler(async () => {
  console.log("[DB] getEmployees called");
  const db = await getDb();
  console.log("[DB] got db, querying...");
  const result = await db.select().from(employees);
  console.log("[DB] got", result.length, "employees");
  return result;
});
```

---

### 3. "ORPC client not initialized" Error

**Symptom**: `Error: ORPC client not initialized. Call ipc.init() first`

**Cause**: Using client before initialization

**Solution**:
```typescript
// src/app.tsx
import { ipc } from "./ipc/manager";

// Initialize at app startup
ipc.init();

// Wait for ready in components
useEffect(() => {
  ipc.waitForReady().then(() => {
    // Now safe to use client
  });
}, []);
```

---

### 4. Context Isolation Issues

**Symptom**: Cannot access `window.electron` in renderer

**Cause**: Preload not properly configured

**Solution**:
```typescript
// preload.ts
contextBridge.exposeInMainWorld("electron", {
  rpc: {
    notifyReady: () => ipcRenderer.send("start-orpc-server"),
  },
});
```

---

### 5. Type Errors

**Symptom**: TypeScript errors like "Property not on type"

**Cause**: Missing type imports or incorrect client type

**Solution**:
```typescript
// Import types correctly
import type { RouterClient } from "@orpc/server";
import type { router } from "./ipc/router";

type Client = RouterClient<typeof router>;

// Use properly typed client
const client = ipc.client as Client;
```

---

### 6. Database Errors in Handlers

**Symptom**: "Table not found" or "Database locked"

**Cause**: Database not initialized or multiple connections

**Solution**:
```typescript
// Ensure getDb is called with proper parameters
export const getEmployees = os.handler(async () => {
  const db = await getDb(true); // true = writable
  return db.select().from(employees);
});
```

---

## Debug Checklist

- [ ] Main process logs show "Server upgraded and started"
- [ ] Preload logs show "Port received"
- [ ] Renderer logs show "ORPC Client created"
- [ ] No CORS errors in console
- [ ] Database is initialized before handlers run

## Logging Pattern

### Main Process
```typescript
console.log("[MAIN] Setting up ORPC handlers");
console.log("[MAIN] RENDERER_READY received");
console.log("[MAIN] Port upgraded");
```

### Preload
```typescript
console.log("[PRELOAD] Port received, type:", port?.constructor?.name);
console.log("[PRELOAD] addEventListener:", typeof port?.addEventListener);
```

### Renderer
```typescript
console.log("[IPC] Initializing...");
console.log("[IPC] Port available:", !!port);
console.log("[IPC] Client created:", !!client);
```

## Network Tab Debugging

In Chrome DevTools:

1. **Main Process**: Check if IPC messages sent
2. **Renderer**: Look for `postMessage` calls

## Related Documents

- [Setup Guide](./setup.md) - Proper setup
- [Electron Integration](./electron-integration.md) - Electron-specific details
- [Error Handling](./error-handling.md) - Error handling
