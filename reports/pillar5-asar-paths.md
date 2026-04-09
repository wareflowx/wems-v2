# Pillar 5: ASAR Packaging & Resource Path Resolution - Technical Analysis

**Author:** Senior Electron Packaging Sub-agent
**Date:** 2026-04-09
**Files Analyzed:**
- `electron-builder.json` (FULL)
- `src/main/index.ts` (FULL)
- `src/core/db/index.ts` (FULL)
- `package.json` (FULL)
- `electron.vite.config.ts` (FULL)

---

## 1. Root Cause Hypothesis

### Critical: Migration Path Mismatch

**Code expects:** `src/db/migrations` (development)
**Packaged from:** `src/core/db/migrations` (production via `extraResources`)

| Directory | Migration Files |
|-----------|-----------------|
| `src/db/migrations/` | 0000, 0002, 0003, 0004, 0005 (5 files) |
| `src/core/db/migrations/` | 0000, 0001, 0002 (3 files) |

The migration files are **completely different** between the two directories. Production app runs different migrations than development.

### High: Missing Icon File

**File:** `electron-builder.json` line 20

```json
"icon": "build/icon.ico"
```

The `build` directory **does not exist**. NSIS installer build may fail or use a default icon.

### Medium: `npmRebuild: false`

**File:** `electron-builder.json` line 9

With `asarUnpack: ["node_modules/better-sqlite3/**"]`, the native module is unpacked. However, `npmRebuild: false` means electron-builder does not rebuild better-sqlite3 against Electron 40's Node headers.

### Medium: Data Directory in Install Directory

**File:** `src/core/db/index.ts` lines 12-19

In production, data is stored next to executable (`path.dirname(process.execPath)`). For NSIS installs on Windows, this means `<InstallDir>\data\database.db`. If user lacks write access to `Program Files`, app fails.

---

## 2. Web Research Findings

1. **`process.resourcesPath`** in packaged Electron app points to:
   - Windows: `<installation dir>\resources\`
   - macOS/Linux: `<app>.app/Contents/Resources/`

2. **Files in `extraResources`** are copied to `process.resourcesPath` but **OUTSIDE the ASAR archive** - directly accessible on filesystem.

3. **`asarUnpack`** pattern causes matching files to be extracted to `<resourcesDir>/app.asar.unpacked/` - alongside `process.resourcesPath`, not inside it.

4. **`process.resourcesPath` + "migrations"** correctly resolves to `<resourcesDir>\migrations` when `extraResources` copies `src/core/db/migrations` to `migrations`.

---

## 3. Code Conflicts and Gaps

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| Migration path mismatch | **CRITICAL** | `src/core/db/index.ts:88` vs `electron-builder.json:12` | Wrong migrations in production |
| Missing icon file | **HIGH** | `electron-builder.json:20` | NSIS build may fail |
| npmRebuild disabled | **MEDIUM** | `electron-builder.json:9` | Native module crash risk |
| Data dir in install dir | **MEDIUM** | `src/core/db/index.ts:15-17` | App fails if no write access |

---

## 4. Specific Fix Recommendations

### Fix 1 (Critical): Align Migration Paths

**Option A** - Fix `electron-builder.json:12`:
```json
"extraResources": [
  {
-   "from": "src/core/db/migrations",
+   "from": "src/db/migrations",
    "to": "migrations"
  }
]
```

**Option B** - Fix `src/core/db/index.ts:88`:
```typescript
const migrationsPath = inDevelopment
- ? path.join(process.cwd(), "src/db/migrations")
+ ? path.join(process.cwd(), "src/core/db/migrations")
  : path.join(process.resourcesPath, "migrations");
```

**Recommendation:** Option A is preferred because `src/db/migrations` has more migration files (5 vs 3).

### Fix 2 (High): Create Build Directory with Icon

```json
"win": {
  "target": ["nsis"],
  "icon": "build/icon.ico"
}
```

Create the `build` directory with a valid `icon.ico` file before packaging.

### Fix 3 (Medium): Enable npmRebuild

```json
"npmRebuild": true,
```

### Fix 4 (Medium): Consider Using `app.getPath('userData')` for Data

See Pillar 4 for full recommendation.

---

## 5. Verification Plan

1. **List development migrations:** `ls -la src/db/migrations/`
2. **Verify production path:** Check `debug.log` for migrations path on first launch
3. **Verify resources packaged:** `npx asar list dist\win-unpacked\resources\app.asar | Select-String migrations`
4. **Verify icon exists:** `ls -la build/`
5. **Test on clean machine:** Fresh install without dev environment
