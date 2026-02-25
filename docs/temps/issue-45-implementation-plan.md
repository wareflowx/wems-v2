# Issue #45 Implementation Plan: electron-vite Structure Alignment

## Overview

This document outlines the step-by-step implementation plan to refactor the WEMS v2 project from its current non-standard structure to the recommended electron-vite convention.

---

## Current vs. Target Structure

### Current Structure (Non-Standard)
```
src/
├── main.ts              # Main process entry (should be src/main/index.ts)
├── preload.ts          # Preload script (should be src/preload/index.ts)
├── renderer.ts         # Renderer entry
├── app.tsx             # React app
├── index.html          # At root instead of src/renderer/
├── actions/            # Main process actions
├── api/                # Shared API code
├── components/         # React components
├── constants/         # Shared constants
├── db/                # Database code
├── hooks/             # React hooks
├── ipc/               # IPC handlers
├── lib/               # Utilities
├── pages/             # Page components
└── types/             # TypeScript types
```

### Target Structure (electron-vite Convention)
```
src/
├── main/
│   └── index.ts       # Main process entry
├── preload/
│   └── index.ts       # Preload script
├── renderer/
│   ├── src/
│   │   ├── index.ts   # Renderer entry (was renderer.ts)
│   │   ├── app.tsx    # React app
│   │   ├── actions/
│   │   ├── api/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── ipc/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── index.html
```

---

## Implementation Steps

### Phase 1: Prepare and Backup

1. **Ensure all changes are committed** on current branch
2. **Verify build works** before starting refactor
3. **Create backup branch** (optional, for safety)

### Phase 2: Move Main Process Files

**Step 2.1: Create main directory and move main.ts**

```bash
mkdir -p src/main
mv src/main.ts src/main/index.ts
```

**Step 2.2: Update import paths in src/main/index.ts**

Update relative imports that point to sibling directories:
- `./constants` → `../constants`
- `./db` → `../db`
- `./ipc/` → `../ipc/`

**Step 2.3: Verify main process builds**

```bash
npm run build  # Check main process compiles
```

### Phase 3: Move Preload Script

**Step 3.1: Create preload directory and move preload.ts**

```bash
mkdir -p src/preload
mv src/preload.ts src/preload/index.ts
```

**Step 3.2: Update import paths in src/preload/index.ts**

- `./constants` → `../constants`

**Step 3.3: Update preload path reference in main**

In `src/main/index.ts`, update the preload path from:
```typescript
preload: join(__dirname, 'preload.js')
```
to:
```typescript
preload: join(__dirname, '../preload/index.js')
```

### Phase 4: Restructure Renderer

**Step 4.1: Create renderer directory structure**

```bash
mkdir -p src/renderer/src
```

**Step 4.2: Move renderer entry and app**

```bash
mv src/renderer.ts src/renderer/src/index.ts
mv src/app.tsx src/renderer/src/app.tsx
```

**Step 4.3: Move all renderer-specific directories**

```bash
mv src/actions src/renderer/src/
mv src/api src/renderer/src/
mv src/components src/renderer/src/
mv src/constants src/renderer/src/
mv src/hooks src/renderer/src/
mv src/lib src/renderer/src/
mv src/pages src/renderer/src/
mv src/types src/renderer/src/
```

**Step 4.4: Move index.html**

```bash
mv index.html src/renderer/index.html
```

**Step 4.5: Update renderer entry imports**

In `src/renderer/src/index.ts`, ensure imports work:
- Should import from `./app.tsx` (works as-is)
- No changes needed for app.tsx imports since `@` alias will be reconfigured

### Phase 5: Update Configuration Files

**Step 5.1: Simplify electron.vite.config.ts**

Replace custom rollupOptions.input with defaults:

```typescript
export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      external: ['better-sqlite3', '@electron/rebuild']
    }
  },

  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      external: ['better-sqlite3']
    }
  },

  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [tailwindcss()],
    build: {
      target: 'chrome108'
    }
  }
});
```

**Step 5.2: Update package.json main field**

Change from:
```json
"main": "out/main/main.js"
```

To:
```json
"main": "out/main/index.js"
```

### Phase 6: Testing and Verification

**Step 6.1: Test development mode**

```bash
npm run dev
```

Expected: App launches without errors

**Step 6.2: Test production build**

```bash
npm run build
npm run preview
```

Expected: Build completes and app runs correctly

**Step 6.3: Test package creation**

```bash
npm run package
```

Expected: Windows executable created successfully

---

## Import Path Changes Summary

| Old Import | New Import | Notes |
|------------|------------|-------|
| `import { x } from '@/constants'` | `import { x } from '@/constants'` | Works if alias updated correctly |
| `import { x } from '@/components/...'` | `import { x } from '@/components/...'` | Works if alias updated correctly |
| `import { x } from '@/hooks/...'` | `import { x } from '@/hooks/...'` | Works if alias updated correctly |
| `import { x } from '@/pages/...'` | `import { x } from '@/pages/...'` | Works if alias updated correctly |
| `import db from './db'` | `import db from '../db'` | Main process files |
| `import { x } from './constants'` | `import { x } from '../constants'` | Main/preload files |

---

## Key Decisions

### 1. Alias Strategy

**Option A: Update @ alias to point to src/renderer/src**
- Pros: No import changes needed in renderer code
- Cons: Main process loses @ alias access

**Option B: Keep @ alias at src level, add second alias**
- Pros: Both processes can use @
- Cons: More complex config

**Decision:** Option A - Update renderer alias to `src/renderer/src` and use relative paths in main process.

### 2. Configuration Cleanup

The refactor allows removing custom `rollupOptions.input` since electron-vite auto-discovers:
- `src/main/index.ts` → main entry
- `src/preload/index.ts` → preload entry
- `src/renderer/index.html` → renderer entry

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Import path errors | High | Test incrementally after each move |
| Dev server fails to start | High | Keep backup branch, revert if needed |
| Build fails | High | Test build after each phase |
| Mass import changes needed | Medium | Use alias to minimize changes |
| Missing files after move | Medium | Use git status to verify |

---

## Commit Strategy

Recommended atomic commits:

1. `refactor: create src/main directory and move main.ts`
2. `refactor: update import paths in main/index.ts`
3. `refactor: create src/preload directory and move preload.ts`
4. `refactor: update import paths in preload/index.ts`
5. `refactor: create src/renderer directory structure`
6. `refactor: move renderer source files to src/renderer/src`
7. `refactor: move index.html to src/renderer`
8. `refactor: simplify electron.vite.config.ts for electron-vite defaults`
9. `refactor: update package.json main field to out/main/index.js`
10. `fix: verify and fix any remaining import issues`

---

## Rollback Plan

If the refactor fails:

1. **Revert git changes**: `git reset --hard HEAD`
2. **Or restore specific files**: `git checkout main -- src/main.ts src/preload.ts`

---

## Success Criteria

- [ ] `npm run dev` launches app without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` shows correct app UI
- [ ] All pages load correctly (employees, settings, etc.)
- [ ] IPC communication works (database queries, window controls)
- [ ] No console errors in development mode

---

## References

- [electron-vite Official Documentation](https://electron-vite.dev/)
- [electron-vite Source Code](https://github.com/alex8088/electron-vite)
- Project current config: `electron.vite.config.ts`
