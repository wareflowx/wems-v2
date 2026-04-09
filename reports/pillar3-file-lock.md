# Pillar 3: File Lock and Single Instance Behavior - Technical Analysis

**Author:** Senior Electron Process Management Sub-agent
**Date:** 2026-04-09
**Files Analyzed:**
- `src/main/index.ts` (FULL)
- `src/core/lib/lock/index.ts` (FULL)
- `src/core/lib/lock/errors.ts` (FULL)
- `src/core/db/index.ts` (FULL)
- `src/preload/index.ts` (FULL)
- `src/core/constants/index.ts` (FULL)

---

## 1. Root Cause Hypothesis

### Issue A: `second-instance` Event Handler Race Condition

**Location:** `src/main/index.ts` lines 159-177

```typescript
function setupSingleInstance(): void {
  const gotTheLock = app.requestSingleInstanceLock();  // Line 160

  if (gotTheLock) {
    app.on("second-instance", () => {  // Line 164 - registered AFTER lock acquired
      if (mainWindow) {  // Line 165 - can be null if app still starting
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  } else {
    app.quit();
  }
}

setupSingleInstance();  // Line 180 - called BEFORE app.whenReady()
```

**Problem:** The `second-instance` event is registered before `app.whenReady()` completes. If a second instance launches while the primary is still initializing, `mainWindow` exists but may not be fully initialized. `mainWindow.focus()` may not bring the window to the foreground properly.

### Issue B: File Lock TOCTOU Race Condition

**Location:** `src/core/lib/lock/index.ts` lines 177-232

Between `readLockFile()` (line 179) and `writeLockFile()` (line 217), another process can read the stale lock, delete it, and write its own lock. This creates a window where two processes think they have write access.

### Issue C: Heartbeat vs Timestamp Staleness Inconsistency

```typescript
// In acquire() - Line 182
const age = Date.now() - existingLock.timestamp;  // Uses CREATION time

// In isStale() - Line 355
const inactiveTime = Date.now() - existingLock.lastHeartbeat;  // Uses HEARTBEAT time
```

`acquire()` considers a lock stale based on creation time, not activity time. `isStale()` correctly uses `lastHeartbeat`, but `acquire()` does not.

---

## 2. Web Research Findings

From Electron API documentation:

1. **`requestSingleInstanceLock()` Guarantees:**
   - Returns `true` if the process is the primary instance
   - Returns `false` if another instance already holds the lock
   - The `second-instance` event is **guaranteed to fire after the `ready` event**
   - **The lock is automatically released when the app exits**

2. **Freeze/Crash Recovery Best Practices:**
   - If the primary instance hangs during initialization, `second-instance` events queue up but cannot wake the primary
   - Use `hasSingleInstanceLock()` to check current lock status
   - Use `releaseSingleInstanceLock()` to voluntarily release the lock

---

## 3. Code Conflicts and Gaps

| Issue | Severity | File | Lines |
|-------|----------|------|-------|
| `second-instance` race condition | High | `src/main/index.ts` | 164-171 |
| TOCTOU file lock race | High | `src/core/lib/lock/index.ts` | 179-217 |
| Timestamp vs heartbeat inconsistency | Medium | `src/core/lib/lock/index.ts` | 182 |
| Lock released on macOS window close | Medium | `src/main/index.ts` | 275-280 |
| Lock not released on SIGTERM | Medium | `src/core/lib/lock/index.ts` | 130-138 |
| No atomic file operations | Medium | `src/core/lib/lock/index.ts` | 88-92 |
| Renderer doesn't get immediate lock status | Low | `src/main/index.ts` | 231-236 |

---

## 4. Specific Fix Recommendations

### Fix 1: Guard `second-instance` with Window Readiness Check

**File:** `src/main/index.ts` lines 159-177

Add an `isAppReady` flag that is set after `app.whenReady()` completes. Retry focusing window with delay if app not yet ready.

### Fix 2: Use Atomic Lock File Operations

**File:** `src/core/lib/lock/index.ts` lines 88-92

Use atomic write pattern: write to temp file, then rename.

### Fix 3: Fix Staleness Check in `acquire()` to Use `lastHeartbeat`

**File:** `src/core/lib/lock/index.ts` line 182

Replace `Date.now() - existingLock.timestamp` with `Date.now() - existingLock.lastHeartbeat`.

### Fix 4: Send Initial Lock Status Immediately to Renderer

**File:** `src/main/index.ts` lines 231-236

Send lock status immediately on startup, not after first 5-second interval.

---

## 5. Verification Plan

1. **Single Instance Lock Race:** Start app, launch second instance during first's initialization
2. **File Lock TOCTOU:** Simulate slow filesystem with delays between read/write
3. **Crash Recovery:** Kill process with SIGKILL, wait 1 minute, restart
4. **Heartbeat Staleness:** Wait 6 minutes, start second instance
5. **Lock Status Communication:** Check `window.getWriteMode()` immediately on launch
6. **Proper Lock Release on Quit:** Verify `.write.lock` file is deleted after normal quit
