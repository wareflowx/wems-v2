# Complete Migration Plan: Electron-Forge → electron-vite 5.0 + electron-builder

**Last Updated:** February 2026
**electron-vite Version:** 5.0.0 (Released December 7, 2025)

## Overview

**Strategy: 1-phase migration to future-proof stack (2026)**
- **Objective:** Migrate to electron-vite 5.0 + electron-builder (latest stable versions)
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

**Problems Identified (February 2026):**
- Native modules (better-sqlite3) cannot be loaded from asar archive
- electron-forge + Vite plugin has known issues with native modules (GitHub issues #3738, #3934, #3573)
- AutoUnpackNativesPlugin not unpacking correctly (plugin exists since April 2025 but not working in our case)
- Node.js 22 compatibility concerns with electron-forge

---

## Why electron-vite 5.0 + electron-builder in 2026?

**Latest Versions (February 2026):**
- **electron-vite 5.0** - Released December 7, 2025 (major milestone)
- **electron-builder** - Stable, mature, excellent native module support

**Not alternatives, but complementary tools:**
- **electron-builder** = Packaging/installer tool (creates .exe, .dmg, .deb)
- **electron-vite 5.0** = Build/dev tool (next-generation replacement for @electron-forge/plugin-vite)
- **Both can be used together** ✅

### 2026 State of the Union

| Aspect | electron-forge | electron-vite 5.0 + builder |
|-----------|----------------|-------------------------|
| **Release Date** | 2022+ | December 2025 (2 months ago) |
| **Native modules** | ⚠️ Known issues (GitHub #3738) | ✅ Documented, proven |
| **Node.js 22 support** | ⚠️ Issues reported | ✅ Full support |
| **Flexibility** | ❌ Rigid, monolithic | ✅ Modular, separated concerns |
| **Dev speed** | ✅ Fast | ✅ Very fast (10-20ms HMR) |
| **Documentation** | Average | Excellent (updated Dec 2025) |
| **Community** | Medium | Growing rapidly |
| **Future (2026+)** | Uncertain | ✅ Promising, active development |

---

## Quick Alternative (30 min) - Try First!

**Before full migration, try this quick fix:**

The **@electron-forge/plugin-auto-unpack-natives** exists since April 2025 but didn't work for us. Try:

1. Check plugin configuration in `forge.config.ts`
2. Verify pattern: `'node_modules/better-sqlite3'` (without /**)
3. Run `npm run package` and check if `app.asar.unpacked/` is created

**If it works:** No migration needed! Keep current stack.

**If it fails:** Proceed with full migration below.

**Time:** 30 min | **Risk:** Low

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

### Step 2.3: Create electron-vite 5.0 Configuration

**File to create:** `electron.vite.config.ts`

**Content (electron-vite 5.0 compatible):**
```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  // Main process configuration
  main: {
    build: {
      rollupOptions: {
        // CRITICAL: Externalize better-sqlite3 to prevent bundling
        external: ['better-sqlite3', '@electron/rebuild']
      }
    }
  },

  // Preload scripts configuration
  preload: {
    build: {
      rollupOptions: {
        // CRITICAL: Externalize better-sqlite3
        external: ['better-sqlite3']
      }
    }
  },

  // Renderer process configuration
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    // Optional: Optimize for production
    build: {
      target: 'chrome108' // Electron 40+ equivalent
    }
  }
});
```

**electron-vite 5.0 Key Points:**
- `external: ['better-sqlite3']` = **CRITICAL** for native modules (2025 best practice)
- Compatible with Electron 40+ (February 2026)
- Same structure as current vite configs (easy migration)

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

## Key Resources (Updated February 2026)

### Official Documentation
1. **[electron-vite 5.0 Official Site](https://electron-vite.org)** - Latest docs (updated December 2025)
2. **[electron-vite 5.0 Blog Announcement](https://electron-vite.org/blog/)** - v5.0 release (December 7, 2025)
3. **[electron-vite Getting Started Guide](https://electron-vite.org/guide/)** - Updated guide (December 6, 2025)
4. **[electron-builder Documentation](https://www.electron.build)** - Comprehensive build tool docs

### Templates & Examples
5. **[electron-vite-template with Drizzle + better-sqlite3](https://github.com/renqiankun/electron-vite-template)** - Production-ready template
6. **[NPM - electron-vite 5.0.0](https://www.npmjs.com/package/electron-vite)** - Package details and version history

### Native Modules (2025 Best Practices)
7. **[Electron Official - Native Modules Guide](https://electronjs.org/docs/latest/tutorial/using-native-node-modules)** - Official best practices
8. **[Stack Overflow - Electron native modules 2025](https://stackoverflow.com/questions/)** - Latest solutions and discussions
9. **[Reddit - Electron + better-sqlite3 + Vite (December 2025)](https://www.reddit.com/r/electronjs/comments/1ovwqby/)** - Community solutions

### Migration Guides
10. **[Juejin - electron-builder + better-sqlite3 (2024)](https://juejin.cn/post/7424425429699198991)** - Chinese guide with steps
11. **[CSDN - electron.vite + better-sqlite3 (March 2025)](https://blog.csdn.net/weixin_44402520/article/details/145907685)** - Complete tutorial

### Known Issues & Solutions
12. **[GitHub #3738 - Forge + Vite incomplete asar](https://github.com/electron/forge/issues/3738)** (October 2024)
13. **[GitHub #3934 - Auto-unpack not working](https://github.com/electron/forge/issues/3934)** (April 2025)
14. **[Stack Overflow - Cannot find module better-sqlite3 (March 2025)](https://stackoverflow.com/questions/79544832/cannot-find-module-better-sqlite3-after-building-electron-forge-vite-app-on-l)**

---

## Current Issues to Solve (February 2026)

### 1. Native Module Loading in asar
- **Issue:** better-sqlite3 cannot be loaded from app.asar
- **Root Cause:** Electron cannot execute native `.node` files from compressed asar archives
- **2025 Solution:** Use `asarUnpack` in electron-builder config + `external` in vite config
- **Best Practice:** Keep DB operations in main process only, communicate via IPC (we already do this ✅)

### 2. electron-forge + Vite Known Bugs
- **Issues:**
  - GitHub #3738: Incomplete asar with Vite plugin (October 2024)
  - GitHub #3573: Native dependency packaging issues (April 2024)
  - AutoUnpackNativesPlugin exists (April 2025) but not unpacking in our case
- **Solution:** Switch to electron-vite 5.0 (purpose-built for Electron + Vite)

### 3. Production Testing & Validation
- **Issue:** Cannot properly test packaged app with current setup
- **Solution:** electron-builder creates clean testable builds with proper unpacking

### 4. Node.js 22 Compatibility
- **Issue:** electron-forge moving to Node.js 22 with compatibility concerns
- **Solution:** electron-vite 5.0 + electron-builder fully support Node.js 22

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

### Why This Migration in 2026?

1. **electron-vite 5.0 is the latest stable** (Released December 2025)
   - Major milestone with significant improvements
   - Active development and community growth
   - Better Electron + Vite integration than electron-forge plugin

2. **Proven Native Module Support**
   - electron-builder has years of production use with better-sqlite3
   - Used by major apps (VS Code, Slack, Discord)
   - Well-documented patterns for native modules

3. **Future-Proof Stack**
   - Separation of concerns: dev (electron-vite) vs packaging (electron-builder)
   - Each tool can be updated independently
   - Community moving toward this pattern in 2025-2026

4. **2025/2026 Best Practices**
   - Externalize native modules in bundler config (`external: ['better-sqlite3']`)
   - Use asarUnpack for native modules
   - Keep DB in main process, communicate via IPC (already implemented ✅)

### What We're Gaining

- ✅ **Faster Development:** electron-vite 5.0 has optimized HMR (10-20ms vs 500ms+)
- ✅ **Better Production Builds:** electron-builder creates clean, tested packages
- ✅ **Native Module Support:** Proven patterns that work
- ✅ **Modern Stack:** Latest versions with active maintenance
- ✅ **Flexibility:** Can swap/build tools independently in future

### What We're Leaving Behind

- ❌ electron-forge (known issues with Vite + native modules)
- ❌ @electron-forge/plugin-vite (buggy asar creation)
- ❌ Configuration complexity (monolithic vs modular)

---

## Success Criteria

Migration is successful when:
- ✅ Development mode works (`npm run dev`)
- ✅ Build works (`npm run build`)
- ✅ Package works (`npm run package`)
- ✅ Installed app works completely
- ✅ better-sqlite3 works in production
- ✅ All features functional (posts CRUD, DB, routing, IPC)
- ✅ Data persists between launches
- ✅ No regressions from current functionality

---

## Next Steps After Migration

Once migration is complete:

1. **Update Documentation**
   - Update README with new build commands
   - Document electron-vite 5.0 configuration
   - Add native module troubleshooting guide

2. **Clean Up Git History**
   - Merge feature branch to main
   - Delete old backup branches
   - Tag release as v2.0.0 (major version bump)

3. **Team Onboarding**
   - Document new development workflow
   - Create troubleshooting guide
   - Update CI/CD pipelines if needed

4. **Monitor**
   - Watch for electron-vite 5.x updates
   - Track Electron 40+ changes
   - Update better-sqlite3 as needed

---
