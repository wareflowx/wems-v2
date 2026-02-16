# Complete Migration Plan: Electron-Forge → electron-vite + electron-builder

## Overview

**Strategy: 1-phase migration**
- **Objective:** Migrate to stable future-proof stack (electron-vite + electron-builder)
- **Approach:** Progressive migration with testing at each step
- **Estimated Time:** ~4 hours
- **Risk Level:** Medium

---

## Current Stack Analysis

**Current Setup:**
- Electron + Vite + TypeScript
- electron-forge (plugins: vite, auto-unpack-natives, fuses)
- better-sqlite3 + drizzle-orm
- TanStack Router + shadcn/ui

**Problem:**
- Native modules (better-sqlite3) cannot be loaded from asar archive
- electron-forge + Vite plugin has known issues with native modules
- asarUnpack and AutoUnpackNativesPlugin not working correctly

---

## Why electron-vite + electron-builder?

**Not alternatives, but complementary tools:**
- **electron-builder** = Packaging/installer tool (creates .exe, .dmg, .deb)
- **electron-vite** = Build/dev tool (like @electron-forge/plugin-vite)
- **Both can be used together**

### Long-term Benefits

| Criterion | electron-forge | electron-vite + builder |
|-----------|----------------|-------------------------|
| **Maturity** | Recent (2022+) | Proven |
| **Native modules** | ⚠️ Known issues | ✅ Documented |
| **Flexibility** | ❌ Rigid | ✅ Modular |
| **Dev speed** | ✅ Fast | ✅ Very fast |
| **Documentation** | Average | Good |
| **Community** | Average | Growing |
| **Future** | Uncertain | Promising |

---

## Migration Steps

### Step 2.1: Preparation & Backup

**Actions:**
1. Already on branch `feature/electron-vite-migration`
2. Commit current state
3. Document current configuration

**Commands:**
```bash
git add .
git commit -m "backup: before electron-vite migration"
```

**Risk:** None
**Time:** 5 min

---

### Step 2.2: Install Dependencies

**Packages to uninstall:**
```bash
npm uninstall @electron-forge/cli
npm uninstall @electron-forge/plugin-vite
npm uninstall @electron-forge/plugin-fuses
npm uninstall @electron-forge/plugin-auto-unpack-natives
npm uninstall @electron/rebuild
```

**Packages to install:**
```bash
npm install -D electron-vite
npm install -D electron-builder
npm install -D electron-rebuild
```

**Why electron-rebuild:**
- Still required for better-sqlite3
- Not integrated into electron-vite

**Risk:** Low
**Time:** 10 min

---

### Step 2.3: Create electron-vite Configuration

**File to create:** `electron.vite.config.ts`

**Content:**
```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
});
```

**Key points:**
- `external: ['better-sqlite3']` = CRITICAL for native modules
- Similar structure to current vite configs

**Risk:** Medium
**Time:** 20 min

---

### Step 2.4: Create electron-builder Configuration

**File to create:** `electron-builder.json`

**Content:**
```json
{
  "appId": "com.electron-shadcn",
  "productName": "electron-shadcn",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": [
    "out/**/*",
    "package.json"
  ],
  "extraResources": [
    "src/db/migrations/**/*"
  ],
  "asar": true,
  "asarUnpack": [
    "node_modules/better-sqlite3/**"
  ],
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": true
  }
}
```

**Key points:**
- `files: "out/**/*"` = output from electron-vite
- `asarUnpack` for better-sqlite3 (CRITICAL)
- `extraResources` for DB migrations
- NSIS installer configuration for Windows

**Risk:** Medium
**Time:** 15 min

---

### Step 2.5: Update package.json Scripts

**Scripts to replace:**

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "rebuild": "electron-rebuild -f -w better-sqlite3",
    "preview": "electron-vite preview",
    "package": "npm run rebuild && npm run build && electron-builder --win",
    "dist": "npm run rebuild && npm run build && electron-builder"
  }
}
```

**Build order is IMPORTANT:**
1. rebuild (compile better-sqlite3)
2. build (vite bundle)
3. electron-builder (create installer)

**Risk:** Low
**Time:** 10 min

---

### Step 2.6: Cleanup

**Files to delete:**
- `forge.config.ts`
- `vite.main.config.mts`
- `vite.preload.config.mts`
- `vite.renderer.config.mts`
- Folder `.vite/` (if generated)

**Note:**
- The renderer vite config can be merged into `electron.vite.config.ts`
- Or use electron-vite's renderer config

**Risk:** Low
**Time:** 5 min

---

### Step 2.7: Development Tests

**Test 1: Launch in dev mode**
```bash
npm run dev
```

**Verifications:**
- ✅ App launches
- ✅ Hot reload works
- ✅ Routes work
- ✅ better-sqlite3 DB works
- ✅ Posts CRUD works

**If failure:**
- Read console logs
- Check `out/` structure
- Fix imports

**Risk:** Medium
**Time:** 30 min

---

### Step 2.8: Build Tests

**Test 2: Build without packaging**
```bash
npm run build
```

**Verifications:**
- ✅ `out/` folder created
- ✅ Correct structure:
  ```
  out/
  ├── main/
  ├── preload/
  └── renderer/
  ```

**If failure:**
- Read build logs
- Check `electron.vite.config.ts`
- Fix paths

**Risk:** Medium
**Time:** 20 min

---

### Step 2.9: Packaging Tests

**Test 3: Full package**
```bash
npm run package
```

**Verifications:**
- ✅ `dist/` folder created
- ✅ `dist/win-unpacked/` exists
- ✅ `electron-shadcn Setup 1.3.2.exe` exists

**Test 4: Launch the exe**
```bash
cd dist/win-unpacked
"electron-shadcn Template.exe"
```

**CRITICAL Verifications:**
- ✅ App launches
- ✅ **better-sqlite3 works**
- ✅ Posts CRUD works
- ✅ DB created in correct location
- ✅ No errors in logs

**Validate app.asar.unpacked:**
- Open `dist/win-unpacked/resources/`
- Check that `app.asar.unpacked/node_modules/better-sqlite3/` exists
- Check that `better_sqlite3.node` is present

**Risk:** High (moment of truth)
**Time:** 1 hour

---

### Step 2.10: Final Validation

**Test 5: Install the app**
```bash
cd dist
"electron-shadcn Setup 1.3.2.exe"
```

**Verifications:**
- ✅ Clean installation
- ✅ Shortcut created
- ✅ App works after installation
- ✅ DB initializes
- ✅ Posts CRUD works

**Test 6: Data persistence**
- Create posts
- Close app
- Relaunch
- ✅ Posts still exist

**Risk:** Medium
**Time:** 30 min

---

### Step 2.11: Final Cleanup

**Actions:**
1. Delete old `out/` folder (not new `dist/`)
2. Update documentation
3. Commit changes
4. Clean up old backup branch

**Commands:**
```bash
git add .
git commit -m "feat: migrate to electron-vite + electron-builder

- Replace electron-forge with electron-vite for dev
- Replace electron-forge makers with electron-builder
- Fix better-sqlite3 native module loading in production
- Add asarUnpack configuration for better-sqlite3
- Update all scripts for new build pipeline"
git push origin feature/electron-vite-migration
```

**Risk:** Low
**Time:** 15 min

---

## Timeline

| Step | Description | Time | Cumulative |
|------|-------------|-------|------------|
| 2.1 | Preparation | 5 min | 5 min |
| 2.2 | Dependencies | 10 min | 15 min |
| 2.3 | electron-vite config | 20 min | 35 min |
| 2.4 | electron-builder config | 15 min | 50 min |
| 2.5 | Update scripts | 10 min | 60 min |
| 2.6 | Cleanup | 5 min | 65 min |
| 2.7 | Dev tests | 30 min | 95 min |
| 2.8 | Build tests | 20 min | 115 min |
| 2.9 | Packaging tests | 60 min | 175 min |
| 2.10 | Final validation | 30 min | 205 min |
| 2.11 | Final cleanup | 15 min | 220 min |
| | **TOTAL** | | **~3.5 hours** |

---

## Potential Blocking Points

### 1. Vite Configuration
- **Problem:** electron-vite has different config structure
- **Solution:** Use official template as reference
- **Severity:** Medium

### 2. asarUnpack Pattern
- **Problem:** Incorrect unpack pattern
- **Solution:** Test unpacked folder manually
- **Severity:** High

### 3. Relative Paths
- **Problem:** Different paths in production
- **Solution:** Use `app.getPath('userData')` everywhere
- **Severity:** Medium

### 4. Build Order
- **Problem:** Wrong order = failure
- **Solution:** rebuild → build → package
- **Severity:** Low

### 5. Native Module Loading
- **Problem:** better-sqlite3 not found in production
- **Solution:** Ensure `external: ['better-sqlite3']` in vite config
- **Severity:** High

---

## Rollback Plan

**If migration fails:**
```bash
git checkout main
git branch -D feature/electron-vite-migration
```

**If partially committed:**
```bash
git reset --hard HEAD~1
```

---

## Key Resources

1. **electron-vite official docs:** https://electron-vite.org
2. **electron-builder docs:** https://www.electron.build
3. **Template with better-sqlite3:** https://github.com/renqiankun/electron-vite-template
4. **better-sqlite3 migration guide:** https://juejin.cn/post/7424425429699198991
5. **electron-vite configuration:** https://electron-vite.org/guide/cli.html

---

## Current Issues to Solve

1. **Native module loading in asar**
   - Issue: better-sqlite3 cannot be loaded from app.asar
   - Solution: asarUnpack + external in vite config

2. **Electron-forge + Vite incompatibility**
   - Issue: Known bugs with native modules
   - Solution: Switch to electron-vite

3. **Production testing**
   - Issue: Cannot test properly without packaging
   - Solution: electron-builder creates proper testable builds

---

## Success Criteria

Migration is successful when:
- ✅ Development mode works (`npm run dev`)
- ✅ Build works (`npm run build`)
- ✅ Package works (`npm run package`)
- ✅ Installed app works completely
- ✅ better-sqlite3 works in production
- ✅ All features functional (posts CRUD, DB, routing)
- ✅ Data persists between launches

---

## Notes

- This migration focuses on long-term stability
- electron-vite + electron-builder is a proven stack
- Better community support for native modules
- More flexible for future changes
- Separates concerns (dev vs packaging)
