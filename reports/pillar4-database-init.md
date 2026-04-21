# Pillar 4: Database Initialization & Migration - Freeze on Packaged App Launch

**Author:** Senior Database & SQLite Sub-agent
**Date:** 2026-04-09
**Status:** Superseded - NSIS-only data storage plan adopted 2026-04-21
**Files Analyzed:**
- `src/main/index.ts` (FULL)
- `src/core/db/index.ts` (FULL)
- `src/core/lib/lock/index.ts` (FULL)
- `electron-builder.json` (FULL)
- `package.json` (FULL)

---

## 1. Root Cause Hypothesis

### Critical: Data Directory Points to UAC-Protected Location (PRIMARY CAUSE)

**File:** `src/core/db/index.ts` lines 12-20

```typescript
export function getDataDir(): string {
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(process.execPath);  // <-- PROBLEM

  return path.join(baseDir, "data");
}
```

**The Bug:** In the packaged Windows NSIS app, `process.execPath` resolves to `C:\Program Files\WEMS\WEMS.exe`. Therefore `getDataDir()` returns `C:\Program Files\WEMS\data`.

`C:\Program Files\` is a **UAC-protected system directory** that requires administrator privileges. The call to `fs.mkdirSync(dataDir, { recursive: true })` **will fail** on standard user accounts.

**Sequence of freeze:**

1. `app.whenReady()` fires at `src/main/index.ts:182`
2. `getDb(canWrite)` called at line 206, **before** `createWindow()` at line 211
3. `ensureDataDir()` attempts `fs.mkdirSync("C:\Program Files\WEMS\data", { recursive: true })`
4. This fails, throws, and `createWindow()` is **never reached**
5. Renderer starts but `mainWindow` is `null` -- no `MAIN_READY` ever sent
6. User sees frozen/blank window

### Critical: Non-Standard Native Module Loading via `module.require`

**File:** `src/core/db/index.ts` line 138

```typescript
const Database = module.require("better-sqlite3");
```

`module.require()` bypasses Electron's asar-aware module resolution hooks. If the binary was built for wrong ABI, loading it would hang indefinitely.

### High: `npmRebuild: false` Skips Native Binary Compilation

**File:** `electron-builder.json` line 9

With `npmRebuild: false`, electron-builder does **not** rebuild native modules for Electron's Node version. The packaged binary was built for system Node (potentially Node 22, NAPI v9), but Electron 40 uses Node 20 (NAPI v8).

---

## 2. Web Research Findings

### Known Issue: Database Locked / Freeze on Packaged App

When `better-sqlite3` is used in a packaged Electron app with `asar: true` and the native module is not properly unpacked, attempting to open the SQLite database causes the **entire main process to hang**.

SQLite's default locking protocol requires exclusive file locks. `better-sqlite3` calls `sqlite3_open()` which tries to acquire a SHARED lock immediately. If the binary is loaded from inside an asar archive (when `asarUnpack` is missing), file system operations cause the native call to block indefinitely.

### Known Issue: `module.require` vs Standard `require`

Using `module.require()` directly bypasses Electron's internal module resolution hooks (`Module._resolveFilename`), which are responsible for redirecting `require('native-module')` calls to the unpacked version when `asarUnpack` is used.

---

## 3. Code Conflicts and Gaps

| Environment | `getDataDir()` returns | Writable? |
|-------------|----------------------|-----------|
| Development | `process.cwd() + "/data"` | Yes |
| Packaged (Windows NSIS) | `path.dirname(process.execPath) + "/data"` = `C:\Program Files\WEMS\data` | **No** |

**Gap:** No use of `app.getPath('userData')` which returns `%APPDATA%\WEMS\` on Windows (correct, writable location).

**Gap:** No graceful degradation when data directory creation fails -- entire app startup is aborted.

**Gap:** Drizzle migrator needs `meta/_journal.json` in migrations folder. In packaged app, `extraResources` copies `src/core/db/migrations` which has this file. This is correct.

---

## 4. Specific Fix Recommendations

### Fix 1 (Critical): Use `app.getPath('userData')` for Data Directory

**File:** `src/core/db/index.ts` lines 12-20

```typescript
import { app } from "electron";

export function getDataDir(): string {
  // Use app.getPath('userData') which is:
  // - Development: process.cwd() or OS-appropriate tmp dir
  // - Packaged Windows: %APPDATA%\WEMS\ (writable)
  // - Packaged macOS: ~/Library/Application Support/WEMS/ (writable)
  return app.getPath("userData");
}
```

### Fix 2 (Critical): Replace `module.require()` with Standard `require()`

**File:** `src/core/db/index.ts` line 138

```typescript
const Database = require("better-sqlite3");
```

### Fix 3 (High): Enable `npmRebuild: true`

**File:** `electron-builder.json` line 9

```json
"npmRebuild": true,
```

### Fix 4 (Medium): Add Graceful Fallback in `ensureDataDir()`

Add fallback to `os.tmpdir()` if primary data directory creation fails.

### Fix 5 (Medium): Add Error Dialog on Startup Failure

**File:** `src/main/index.ts` lines 245-248

Wrap initialization in try/catch that shows `dialog.showErrorBox()` before `app.quit()` so user understands why the app didn't open.

---

## 5. Verification Plan

1. **Check packaged app's data directory:** `dir "C:\Program Files\WEMS\data"`
2. **Check debug log:** `Get-Content "$env:APPDATA\WEMS\debug.log" -Tail 50`
3. **Verify migrations packaged:** `npx asar list dist\win-unpacked\resources\app.asar | Select-String migrations`
4. **After Fix 1:** Verify database appears at `%APPDATA%\WEMS\database.db`
5. **Check NAPI version:** `strings ...better_sqlite3.node | grep -i "napi_version"` should return "8"
