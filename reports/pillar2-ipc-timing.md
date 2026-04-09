# Pillar 2: IPC/ORPC Communication Timing - Race Condition Analysis

**Author:** Senior IPC & Context Bridge Sub-agent
**Date:** 2026-04-09
**Files Analyzed:**
- `src/main/index.ts` (FULL)
- `src/preload/index.ts` (FULL)
- `src/core/ipc/manager.ts` (FULL)
- `src/core/ipc/handler.ts` (FULL)
- `src/core/ipc/context.ts` (FULL)
- `src/renderer/src/app.tsx` (FULL)
- `src/renderer/src/actions/database.ts` (FULL)

---

## 1. Root Cause Hypothesis

### Primary Issue: Double Initialization Pattern in `app.tsx`

**File:** `src/renderer/src/app.tsx`

```typescript
// Lines 23-39: Event listener for MAIN_READY
window.addEventListener("message", async (event) => {
  if (event.data?.type === "main-ready") {
    if (!initialMigrationDone) {
      await migrateAddNotesTable();
    }
    ipc.init();  // FIRST ipc.init() call
  }
});

// Lines 42-54: initApp function
const initApp = async () => {
  if (!initialMigrationDone) {
    await migrateAddNotesTable();
  }
  ipc.init();  // SECOND ipc.init() call
};

// Line 56: IMMEDIATE module-level call
initApp();
```

**Problem:** `initApp()` is called at module level BEFORE React render begins. This calls `ipc.init()` first. Then if `MAIN_READY` arrives and the window message handler fires, it calls `ipc.init()` again. While `ipc.init()` has an `_initialized` guard, the order of operations is problematic.

### Secondary Issue: Migration Called Before IPC Ready

```typescript
// app.tsx lines 42-56
const initApp = async () => {
  if (!initialMigrationDone) {
    await migrateAddNotesTable();  // <-- Called BEFORE ipc.init()!
  }
  ipc.init();
};
initApp();
```

`migrateAddNotesTable()` calls `getClient()` which returns `null` (since `ipc.isReady()` returns `false`), and the migration silently skips.

### Tertiary Issue: No Timeout on IPC Initialization Promise

**File:** `src/core/ipc/manager.ts` lines 27-62

The `_readyPromise` has NO timeout. If the `MessagePort` transfer fails silently, the promise never resolves, and any code awaiting `ipc.waitForReady()` hangs indefinitely.

---

## 2. Web Research Findings

### MessageChannelMain

From Electron documentation:
- Ports must be **transferred** (included in the message ports array), not duplicated
- When transferred, sender **loses control** and receiver gains ownership
- `webContents.postMessage(channel, message, [transfer])` sends to **preload** context, not directly to renderer

### Context Bridge Limitations

From Electron documentation:
> "`ipcRenderer` can no longer be sent over the `contextBridge`" (introduced in v29.0.0)

This confirms `MessagePort` transfer via `contextBridge` is not supported - the current implementation correctly uses `window.postMessage` for direct port transfer.

---

## 3. Code Conflicts/Gaps

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| Double `ipc.init()` call | Medium | `app.tsx` lines 39, 56 | Fragile timing, potential double-notify |
| Migration called before IPC ready | Low | `app.tsx` line 47 | Migration silently skipped on first attempt |
| No timeout on init promise | High | `manager.ts` lines 36-38 | App can hang indefinitely if port transfer fails |
| Polling fallback (~50 timeouts) | Low | `manager.ts` lines 68-96 | Unnecessary overhead, symptom of unreliable event approach |
| Two-hop port transfer | Low | `preload/index.ts` + `main/index.ts` | Complexity, potential message loss window |
| `client` getter throws synchronously | Medium | `manager.ts` lines 130-138 | Crashes components that access before init |

---

## 4. Specific Fix Recommendations

### Fix 1: Remove Double Initialization

**File:** `src/renderer/src/app.tsx`

```typescript
// Single initialization triggered by MAIN_READY
window.addEventListener("message", async (event) => {
  if (event.data?.type === "main-ready") {
    console.log("[RENDERER] Received MAIN_READY, initializing IPC...");

    if (!initialMigrationDone) {
      try {
        await migrateAddNotesTable();
        initialMigrationDone = true;
      } catch (error) {
        console.error("[MIGRATIONS] Error:", error);
      }
    }

    ipc.init();
  }
});

// REMOVE: initApp() module-level call
```

### Fix 2: Add Timeout to IPC Initialization Promise

**File:** `src/core/ipc/manager.ts`

```typescript
const IPC_INIT_TIMEOUT_MS = 10000; // 10 second timeout

this._readyPromise = new Promise((resolve, reject) => {
  this._readyResolve = resolve;

  setTimeout(() => {
    if (!this._client) {
      const error = new Error("ORPC initialization timed out after 10s");
      console.error("[IPC]", error.message);
      reject(error);
    }
  }, IPC_INIT_TIMEOUT_MS);
});
```

### Fix 3: Replace Polling with Single Retry

Replace the 50-attempt polling with a single retry after 2 seconds.

---

## 5. Verification Plan

1. Add console logs at each step of the handshake
2. Add timeout verification test
3. Test cold vs warm start behavior
4. Verify double-init is harmless with logging
