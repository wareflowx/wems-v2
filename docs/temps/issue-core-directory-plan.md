# Plan: Create src/core/ Directory

## Overview

Move shared code directories (`constants`, `db`, `ipc`, `lib`) into a single `src/core/` directory for better organization.

## Current Structure

```
src/
├── main/index.ts       # Main process
├── preload/index.ts    # Preload script
├── renderer/
│   └── src/          # Renderer code
├── constants/         # Shared - main + renderer
├── db/              # Shared - main only
├── ipc/             # Shared - main + renderer (via @@)
├── lib/             # Shared - main + renderer (via @@)
├── types/           # Shared - main + renderer
├── mock-data/       # Renderer only
└── ...
```

## Target Structure

```
src/
├── main/index.ts
├── preload/index.ts
├── renderer/
│   └── src/
├── core/              # NEW: All shared code
│   ├── constants/
│   ├── db/
│   ├── ipc/
│   ├── lib/
│   ├── types/
│   └── mock-data/
└── ...
```

## Implementation Steps

### Step 1: Create core directory

```bash
mkdir -p src/core
```

### Step 2: Move directories to core

```bash
mv src/constants src/core/
mv src/db src/core/
mv src/ipc src/core/
mv src/lib src/core/
mv src/types src/core/
mv src/mock-data src/core/
```

### Step 3: Update main process imports

In `src/main/index.ts`:

| Old | New |
|-----|-----|
| `../constants` | `../core/constants` |
| `../db` | `../core/db` |
| `../ipc/handler` | `../core/ipc/handler` |
| `@/lib/lock` | `@/core/lib/lock` |
| `@/lib/logger` | `@/core/lib/logger` |

### Step 4: Update preload imports

In `src/preload/index.ts`:

| Old | New |
|-----|-----|
| `../constants` | `../core/constants` |

### Step 5: Update renderer imports

In all files under `src/renderer/src/`, update `@@` imports:

| Old | New |
|-----|-----|
| `@@/constants` | `@@/core/constants` |
| `@@/db` | `@@/core/db` |
| `@@/ipc/manager` | `@@/core/ipc/manager` |
| `@@/lib/query-client` | `@@/core/lib/query-client` |
| `@@/lib/query-keys` | `@@/core/lib/query-keys` |
| `@@/lib/utils` | `@@/core/lib/utils` |
| `@@/lib/result` | `@@/core/lib/result` |
| `@@/types/theme-mode` | `@@/core/types/theme-mode` |
| `@@/mock-data/*` | `@@/core/mock-data/*` |

### Step 6: Update electron.vite.config.ts

Update the `@@` alias from `src` to `src/core`:

```typescript
// Before
'@@': resolve(__dirname, 'src')

// After
'@@': resolve(__dirname, 'src/core')
```

### Step 7: Verify

```bash
npm run build
npm run dev
```

## Notes

- `types.d.ts` at src root should stay (it's a TypeScript global types file)
- Only directories used by both main and renderer go to core
- Some directories (like `layouts`, `routes`) stay at src level

## Risks

- Many import paths to update
- Easy to miss a file
- Test thoroughly after changes
