# Electron App Launch Freeze - Deep Analysis Synthesis Report

**Date:** 2026-04-09
**Status:** Superseded by NSIS-only data storage plan
**Analysis:** 5 pillars completed, re-evaluated with shared network install constraint

---

> **NOTE (2026-04-21):** This report described a portable-first with EACCES fallback strategy. The current plan is **NSIS-only** - the data directory is always `app.getPath("userData")` which NSIS guarantees is writable. The portable target has been removed from electron-builder.json. See `src/core/db/index.ts` for the simplified implementation.

---

**ARCHIVED CONTENT - Describes the old portable-first strategy (now superseded):**

```typescript
export function getDataDir(): string {
  // Use directory next to executable for portable data storage
  // In development: use project root for easier debugging
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(process.execPath);

  return path.join(baseDir, "data");
}
```

The original design attempted to support **two deployment scenarios**:

| Scenario | Install Location | Data Location | `C:\Program Files\` UAC Issue? |
|----------|-----------------|---------------|-------------------------------|
| **Shared Network Install** | `\\server\share\WEMS\` | `\\server\share\WEMS\data\` | No (network share is writable) |
| **Local Windows Install** | `C:\Program Files\WEMS\` | `C:\Program Files\WEMS\data\` | **Yes — causes freeze** |
| Development | `C:\Users\dev\...\wems-v2\` | `C:\Users\dev\...\wems-v2\data\` | No (dev dir is writable) |

**Conclusion (old):** The current design is CORRECT for shared network installs but FAILS completely for local Windows installs. The fix must preserve shared network support while enabling local installs.

**The fix CANNOT be `app.getPath('userData')`** (old analysis) — that would break shared network installs by giving each user their own local AppData database instead of a shared database.

---

## Critical Root Causes (Revised)

### CRITICAL-1: Data Directory Creation Fails Silently on Local Install

**Pillar:** Pillar 4 (Database) & Pillar 3 (File Lock)

**Both** `src/core/db/index.ts` and `src/core/lib/lock/index.ts` independently call `ensureDataDir()` which tries `fs.mkdirSync("C:\Program Files\WEMS\data")` and **throws** on permission denied.

**Sequence of freeze (confirmed):**

1. `app.whenReady()` fires at `src/main/index.ts:182`
2. `Lock.acquire()` at line 189 → calls `ensureDataDir()` in lock module → tries to create `C:\Program Files\WEMS\data` → **fails with permission error** → `Lock.acquire()` returns failure
3. `canWrite = false` at line 190 (correctly determined from lock failure)
4. `getDb(false)` at line 206 → calls `ensureDataDir()` in db module → tries to create `C:\Program Files\WEMS\data` again → **fails again** → `ensureDataDir()` **throws** at `src/core/db/index.ts:29`
5. Error caught at `src/main/index.ts:245-248` — logs error but **does NOT call `createWindow()`**
6. The try block inside `app.whenReady()` at line 183 is where the freeze originates — the unhandled rejection prevents window creation

**Key insight:** The crash happens because `ensureDataDir()` **throws** instead of gracefully falling back. The window never appears because `createWindow()` is after the failing `getDb()` call.

### CRITICAL-2: Native Module ABI Mismatch (Contributing to Freeze)

**Pillar:** Pillar 1 (Native Modules)

**Even if the data directory issue were fixed**, `npmRebuild: false` means the `better-sqlite3` binary may be built for Node 22 (NAPI v9) while Electron 40 uses Node 20 (NAPI v8). This causes the native module to **hang indefinitely** instead of throwing a clear error.

**Evidence:** The packaged `.node` binary is **byte-identical** (1903104 bytes) to the development binary, strongly suggesting no rebuild occurred for Electron's ABI.

### CRITICAL-3: `module.require()` May Bypass Electron Module Resolution

**Pillar:** Pillar 1 (Native Modules) & Pillar 4 (Database)

**File:** `src/core/db/index.ts:138`

```typescript
const Database = module.require("better-sqlite3");
```

`module.require()` bypasses Electron's internal module resolution hooks that handle `asarUnpack` redirection. This could compound the ABI mismatch issue.

---

## High Priority Issues

### HIGH-1: Migration Path Mismatch

**Pillar:** Pillar 5 (ASAR/Paths)

Two migration directories with **different files**:

| Directory | Files |
|-----------|-------|
| `src/db/migrations/` | 0000, 0002, 0003, 0004, 0005 (5 files) |
| `src/core/db/migrations/` | 0000, 0001, 0002 (3 files) |

`electron-builder.json:12` copies from `src/core/db/migrations` but code at `src/core/db/index.ts:88` expects `src/db/migrations` in development. **Completely different migration sets.**

### HIGH-2: No Graceful Fallback for Data Directory

**Pillar:** Pillar 4 (Database) & Pillar 3 (File Lock)

Both `ensureDataDir()` implementations throw on failure. There is **no fallback** to an alternative writable location. This is the root cause of the freeze.

### HIGH-3: IPC Initialization Has No Timeout

**Pillar:** Pillar 2 (IPC/ORPC Timing)

**File:** `src/core/ipc/manager.ts` lines 36-38

If the `MessagePort` transfer fails silently, `_readyPromise` never resolves, causing indefinite hang.

---

## Medium Priority Issues

| Issue | Pillar | Impact |
|-------|--------|--------|
| Double `ipc.init()` in `app.tsx` | P2 | Fragile timing |
| Lock file TOCTOU race | P3 | Potential corruption |
| `SIGTERM` doesn't release lock | P3 | Stale locks after forced exit |
| Missing `build/icon.ico` | P5 | NSIS may fail or use default |
| No startup error dialog | P4 | User sees blank screen instead of error message |

---

## Corrected Fix Priority Map

| Priority | Fix | Files | Rationale |
|----------|-----|-------|-----------|
| **P0** | Add fallback data directory on `EACCES` | `src/core/db/index.ts`, `src/core/lib/lock/index.ts` | Fixes the freeze on local Windows install while preserving shared network install |
| **P0** | Enable `npmRebuild: true` | `electron-builder.json:9` | Rebuild native module for Electron ABI |
| **P0** | Change `module.require()` to `require()` | `src/core/db/index.ts:138` | Proper Electron module resolution |
| **P1** | Force rebuild with `--force` | `package.json:12` | Guarantees rebuild happens |
| **P1** | Align migration paths | `electron-builder.json:12` or `src/core/db/index.ts:88` | Correct migrations in prod |
| **P2** | Add IPC init timeout | `src/core/ipc/manager.ts` | Fail-fast instead of infinite hang |
| **P2** | Add startup error dialog | `src/main/index.ts` | User-visible error instead of blank screen |
| **P3** | Remove double `ipc.init()` | `src/renderer/src/app.tsx` | Cleaner initialization |
| **P3** | Atomic lock file writes | `src/core/lib/lock/index.ts` | Prevent TOCTOU races |
| **P3** | Create `build/icon.ico` | N/A (asset) | Proper installer branding |

---

## P0 Fix: Graceful Data Directory Fallback (THE KEY FIX)

The fix must:
1. **Try** the portable path (next to executable) first — for shared network installs
2. **On `EACCES` (permission denied)** — fall back to `app.getPath('userData')` — for local Windows installs
3. **Log** which path is being used — for debugging

### Fix for `src/core/db/index.ts`

```typescript
import { app } from "electron";
import fs from "node:fs";

export function getDataDir(): string {
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(process.execPath);

  return path.join(baseDir, "data");
}

export function getEffectiveDataDir(): string {
  // For shared network installs: data next to executable (portable)
  // For local Windows installs: fallback to AppData on EACCES
  const portableDataDir = getDataDir();

  try {
    fs.mkdirSync(portableDataDir, { recursive: true });
    return portableDataDir;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      // Permission denied — fall back to user data directory
      // This happens on local Windows installs (C:\Program Files\) where
      // standard users cannot write. Shared network installs (\\server\share\)
      // should work because network shares are typically writable.
      const fallbackDir = app.getPath("userData");
      console.log(`[DB] Cannot write to portable path ${portableDataDir} (EACCES), ` +
        `falling back to ${fallbackDir}`);
      try {
        fs.mkdirSync(fallbackDir, { recursive: true });
        return fallbackDir;
      } catch {
        // If even AppData fails, we're in serious trouble
        return fallbackDir;
      }
    }
    throw error;
  }
}

export function ensureDataDir(): void {
  // Use the fallback-aware version
  const dataDir = getEffectiveDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
```

**Important:** `app.getPath('userData')` returns `%APPDATA%\WEMS\` on Windows. For shared network installs, this is NOT what you want — but on local Windows installs where `C:\Program Files\` is not writable, it's the only option.

### Fix for `src/core/lib/lock/index.ts`

Apply the same fallback logic in the lock module's `ensureDataDir()`:

```typescript
function getEffectiveDataDir(): string {
  const portableDataDir = getDataDir();
  try {
    fs.mkdirSync(portableDataDir, { recursive: true });
    return portableDataDir;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      const fallbackDir = app.getPath("userData");
      console.log(`[LOCK] Cannot write to portable path, falling back to ${fallbackDir}`);
      fs.mkdirSync(fallbackDir, { recursive: true });
      return fallbackDir;
    }
    throw error;
  }
}
```

---

## Why `app.getPath('userData')` Alone is Wrong

If we simply replace the data directory with `app.getPath('userData')`:

| Scenario | Result | Desired? |
|----------|--------|----------|
| Shared network `\\server\apps\WEMS\` | Data at `%APPDATA%\WEMS\` (local to each user) | ❌ No — users need shared database |
| Local `C:\Program Files\WEMS\` | Data at `%APPDATA%\WEMS\` | ✅ Yes — works |

The **try portable → fallback on EACCES** approach is the **only solution** that supports both scenarios.

---

## Files Affected

| File | Changes |
|------|---------|
| `src/core/db/index.ts` | Add `getEffectiveDataDir()`, update `ensureDataDir()` to use fallback |
| `src/core/lib/lock/index.ts` | Add `getEffectiveDataDir()`, update `ensureDataDir()` to use fallback |
| `electron-builder.json` | `npmRebuild: true` (P0) |
| `package.json` | rebuild `--force` flag (P1) |
| `src/core/db/index.ts:138` | `module.require()` → `require()` (P0) |
| `src/core/db/index.ts:88` OR `electron-builder.json:12` | Align migration paths (P1) |
| `src/core/ipc/manager.ts` | Add timeout to `_readyPromise` (P2) |
| `src/main/index.ts` | Add error dialog on init failure (P2) |
| `src/renderer/src/app.tsx` | Remove double `ipc.init()` (P3) |

---

## Verification Plan

### Scenario 1: Local Windows Install (NSIS to `C:\Program Files\`)
1. Install with NSIS to default `C:\Program Files\WEMS\`
2. Launch as standard user (non-admin)
3. **Expected:** App starts, data at `%APPDATA%\WEMS\`, log shows `falling back to...`
4. **Expected:** Shared network users' database NOT affected

### Scenario 2: Shared Network Install (`\\server\share\WEMS\`)
1. Copy `WEMS\` folder to network share
2. Launch from share as any user
3. **Expected:** App starts, data at `\\server\share\WEMS\data\`, log shows NO fallback
4. Multiple users on different machines share the same database

### Scenario 3: Dev Mode (`npm run dev`)
1. Run `npm run dev`
2. **Expected:** Data at `process.cwd()/data` (project root), no fallback

### Regression: Native Module
1. Package with `npmRebuild: true` and `--force`
2. Verify packaged `.node` binary has NAPI v8 (Electron 40)
3. App should load `better-sqlite3` without hanging

---

## Phase 4: Implementation Readiness

**Awaiting your approval to proceed with Phase 4 implementation** of the P0 fixes first (graceful fallback + npmRebuild + module.require), followed by P1 and P2.

The critical path is: `getEffectiveDataDir()` → enables window to appear → enables all other debugging.
