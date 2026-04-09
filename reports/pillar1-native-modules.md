# Pillar 1: Native Module Compatibility - `better-sqlite3` Freeze on Launch

**Author:** Senior Native Module & Electron ABI Sub-agent
**Date:** 2026-04-09
**Files Analyzed:**
- `src/main/index.ts` (FULL)
- `src/core/db/index.ts` (FULL)
- `src/core/lib/lock/index.ts` (FULL)
- `electron-builder.json` (FULL)
- `package.json` (scripts section)
- `electron.vite.config.ts` (FULL)
- Packaged binary: `dist/win-unpacked/resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node`

---

## 1. Root Cause Hypothesis (with Code Evidence)

### Primary: NODE_MODULE_VERSION ABI Mismatch

The freeze is most likely caused by a **Node.js ABI (Application Binary Interface) version mismatch** between the `better-sqlite3` native binary and Electron 40's embedded Node.js runtime.

**Version Matrix:**

| Component | Version | Node.js Version | NAPI/ABI Version |
|-----------|---------|-----------------|------------------|
| Electron | `^40.1.0` | Node 20.x (~20.14.0) | NAPI v8 |
| better-sqlite3 | `^12.6.2` | Node 22.x (targets Node 22) | NAPI v9 |
| @electron/rebuild | `^4.0.3` | Used for rebuild | - |

**Evidence:** The packaged `.node` binary is **byte-identical** (1903104 bytes) to the development binary. This strongly suggests the rebuild either used the wrong Node.js version (system Node instead of Electron's Node) or silently failed.

**Freeze Mechanism:** When `module.require("better-sqlite3")` is called at `src/core/db/index.ts:138`, Node.js loads the `.node` binary. If NAPI version in the binary (v9, for Node 22) does not match runtime NAPI version (v8, for Node 20 in Electron 40), the load can **hang indefinitely** rather than throwing a clear error.

### Secondary: Circular Module Initialization Order

`src/core/db/index.ts` (lines 1-5) imports from `drizzle-orm/better-sqlite3` at module evaluation time:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
```

electron-vite's externalization (`electron.vite.config.ts` lines 15, 28) means these will be `require()`-ed at runtime. If the externalization is not correctly resolving to the unpacked `better-sqlite3` in the packaged app, this could fail.

### Freeze Location

The freeze occurs in `src/main/index.ts` at line 206:
```typescript
await getDb(canWrite);  // Line 206 - this calls module.require("better-sqlite3")
```

This is called **before** `createWindow()` (line 211), meaning if `getDb()` hangs, the window never appears.

---

## 2. Web Research Findings

### Known Issues with Native Modules in Packaged Electron Apps

1. **ASAR Archive and Native Modules**: Native `.node` binaries cannot be loaded from inside an ASAR archive because they use `dlopen()` internally. `asarUnpack` is correctly configured (`electron-builder.json` line 17).

2. **`electron-rebuild` and Electron Version Detection**: When run via `electron-rebuild -f -w better-sqlite3`, it uses the Electron version from the installed `electron` package. If headers are incorrect, rebuild may fail or use wrong headers.

3. **`npmRebuild: false` risk**: electron-builder skips its own native module rebuild entirely. All rebuild responsibility falls on the pre-package `npm run rebuild` step.

4. **`better-sqlite3` NAPI Requirements**: `better-sqlite3` version 12.x uses NAPI version 9 (for Node 22+). Electron 40 ships with Node 20 which uses NAPI v8. **A binary built for NAPI v9 is not forward-compatible with NAPI v8.**

---

## 3. Code Conflicts/Gaps

| Gap | File:Line | Issue | Severity |
|-----|-----------|-------|----------|
| `npmRebuild: false` | `electron-builder.json:9` | electron-builder skips native rebuild | **Critical** |
| No `--force` or `--electron-version` in rebuild | `package.json:12` | Rebuild may not use Electron's Node headers | **Critical** |
| `module.require("better-sqlite3")` | `src/core/db/index.ts:138` | Non-standard require, unclear if needed | Medium |
| `NODE_ENV` check for `inDevelopment` | `src/core/db/index.ts:10` | May be unreliable in packaged app | Medium |
| No `afterPack` verification | `electron-builder.json` | Failed rebuild goes undetected | Medium |
| Identical `.node` in dev and packaged | Both 1903104 bytes | Strongly suggests no rebuild occurred | **Critical** |

---

## 4. Specific Fix Recommendations

### Fix 1 (Critical): Enable `npmRebuild`

**File:** `electron-builder.json:9`

```json
// Change from:
"npmRebuild": false,
// To:
"npmRebuild": true,
```

**Rationale:** `npmRebuild: true` is the standard recommendation for projects with native modules. It ensures electron-builder itself rebuilds native modules using Electron's headers at packaging time.

### Fix 2 (Critical): Verify and Force Rebuild

**File:** `package.json:12`

```json
// Change from:
"rebuild": "electron-rebuild -f -w better-sqlite3",
// To:
"rebuild": "electron-rebuild -f -w better-sqlite3 --force",
```

Or use explicit electron version targeting:
```json
"rebuild": "electron-rebuild -f -w better-sqlite3 --electron-version=40",
```

### Fix 3 (Medium): Use Standard `require()` Instead of `module.require()`

**File:** `src/core/db/index.ts:138`

```typescript
// Change from:
const Database = module.require("better-sqlite3");
// To:
const Database = require("better-sqlite3");
```

### Fix 4 (Medium): Ensure `process.resourcesPath` for Migrations is Correct

**File:** `src/core/db/index.ts:87-89`

```typescript
const migrationsPath = inDevelopment
  ? path.join(process.cwd(), "src/db/migrations")
  : path.join(process.resourcesPath, "migrations");
```

---

## 5. Verification Plan

1. **Check NAPI version of packaged binary:**
   ```bash
   strings dist/win-unpacked/resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node | grep -i "napi_version"
   # Should return "8" for Electron 40 (Node 20), not "9" (Node 22)
   ```

2. **Run packaged app with remote debugging:**
   ```bash
   "C:\path\to\WEMS.exe" --disable-gpu --no-sandbox --remote-debugging-port=9222
   ```

3. **Add startup timing logs:**
   ```typescript
   fs.writeFileSync(logPath, `START: ${Date.now()}\n`, { flag: "a" });
   await getDb(canWrite);
   fs.writeFileSync(logPath, `AFTER_GETDB: ${Date.now()}\n`, { flag: "a" });
   ```
