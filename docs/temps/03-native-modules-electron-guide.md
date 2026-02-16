# Native Modules in Electron: Complete Guide (2026)

**Last Updated:** February 16, 2026
**Electron Version:** 40.1.0
**better-sqlite3 Version:** 12.6.2
**Status:** Production Ready

---

## Table of Contents

1. [What Are Native Modules?](#what-are-native-modules)
2. [The ASAR Problem](#the-asar-problem)
3. [Solution Overview](#solution-overview)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Best Practices](#best-practices)
7. [Alternative Approaches](#alternative-approaches)

---

## What Are Native Modules?

Native modules are Node.js add-ons that contain compiled C++ code. They have the `.node` file extension.

### Examples

- **better-sqlite3** - SQLite database bindings
- **sqlite3** - SQLite database bindings (older)
- **sharp** - Image processing
- **node-gyp** - Native build tooling
- **usb** - USB device communication

### Why Use Them?

1. **Performance** - C++ is much faster than JavaScript
2. **System Access** - Direct hardware/OS access
3. **Existing Libraries** - Leverage native C++ libraries
4. **Database** - SQLite is the best local database

### The Challenge

Electron apps are packaged in **ASAR archives** for distribution, but ASAR **cannot execute native `.node` files**.

---

## The ASAR Problem

### What is ASAR?

**ASAR** is a tar-like archive format used by Electron to package applications:

```
my-electron-app/
├── resources/
│   └── app.asar  (563 MB archive)
└── electron-shadcn.exe
```

### The Problem

**Electron cannot execute native `.node` files from inside ASAR archives:**

```
❌ app.asar/
   └── node_modules/
       └── better-sqlite3/
           └── build/
               └── Release/
                   └── better_sqlite3.node  (1.9 MB)

Error: Cannot find module 'better-sqlite3'
```

**Why?** ASAR is a compressed archive. Node.js's `require()` cannot load binary files from it.

### The Solution: ASAR Unpacking

Extract native modules **outside** the ASAR archive:

```
✅ resources/
   ├── app.asar  (563 MB)
   └── app.asar.unpacked/  (extracted native modules)
       └── node_modules/
           └── better-sqlite3/
               └── build/
                   └── Release/
                       └── better_sqlite3.node  (1.9 MB)
```

Node.js can now find and load the native module!

---

## Solution Overview

### Three-Layer Approach

1. **Bundler Configuration** - Prevent bundling native modules
2. **Builder Configuration** - Extract native modules from ASAR
3. **Rebuild Configuration** - Compile for specific Electron version

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: Bundler (Vite/Rollup)                      │
│  Action: Externalize native modules                  │
│  Config: external: ['better-sqlite3']                │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Layer 2: Builder (electron-builder)                 │
│  Action: Unpack native modules from ASAR             │
│  Config: asarUnpack: ['node_modules/better-sqlite3'] │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Layer 3: Rebuilder (electron-rebuild)               │
│  Action: Compile native modules for Electron version │
│  Config: electron-rebuild -f -w better-sqlite3       │
└──────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### Step 1: Install Dependencies

```bash
# Install native module
npm install better-sqlite3

# Install rebuild tool
npm install -D @electron/rebuild
```

### Step 2: Configure Bundler

**electron-vite.config.ts:**

```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        // CRITICAL: Externalize native modules
        external: ['better-sqlite3', '@electron/rebuild']
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
    // Native modules NOT used in renderer
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108'
    }
  }
});
```

**Why `external`?**
- Prevents Vite from bundling native modules
- Leaves `require('better-sqlite3')` as-is in output
- Allows Node.js to load the `.node` file at runtime

**Common Error without `external`:**
```
Error: Cannot find module 'better-sqlite3'
```

### Step 3: Configure Builder

**electron-builder.json:**

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
    "perMachine": false
  }
}
```

**Key Configuration:**

1. **`"asar": true`** - Enable ASAR archiving
   ```json
   "asar": true
   ```

2. **`"asarUnpack"`** - Extract native modules
   ```json
   "asarUnpack": [
     "node_modules/better-sqlite3/**"  /** = recursive
   ]
   ```

3. **Pattern Matching:**
   ```json
   // Single module
   "asarUnpack": ["node_modules/better-sqlite3/**"]

   // Multiple modules
   "asarUnpack": [
     "node_modules/better-sqlite3/**",
     "node_modules/sharp/**",
     "node_modules/usb/**"
   ]

   // All native modules (not recommended)
   "asarUnpack": ["node_modules/**/*.node"]
   ```

### Step 4: Add Rebuild Script

**package.json:**

```json
{
  "scripts": {
    "rebuild": "electron-rebuild -f -w better-sqlite3",
    "dev": "npm run rebuild && electron-vite dev",
    "build": "electron-vite build",
    "package": "npm run rebuild && npm run build && electron-builder --win"
  }
}
```

**Script Breakdown:**
- `-f` - Force rebuild even if already built
- `-w better-sqlite3` - Rebuild this specific module
- Run rebuild BEFORE build and package

### Step 5: Lazy Loading (Recommended)

**Problem:** Importing native modules at top level can cause issues

**Solution:** Lazy load modules

```typescript
// ❌ DON'T DO THIS
import Database from 'better-sqlite3';
const db = new Database('db.sqlite');

// ✅ DO THIS
let db: Database.Database | null = null;

function getDB(): Database.Database {
  if (!db) {
    const Database = require('better-sqlite3');
    db = new Database('my-database.db');
  }
  return db;
}

// Use in functions
export function getUser(id: number) {
  const db = getDB();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}
```

**Benefits:**
- Avoids loading issues during import
- Module loaded only when needed
- Better error handling

### Step 6: Test in Development

```bash
npm run dev
```

**Verify:**
- ✅ App launches
- ✅ Database operations work
- ✅ No module loading errors

### Step 7: Build and Test Production

```bash
npm run package
```

**Verify Structure:**

```bash
# Check unpacked directory exists
ls dist/win-unpacked/resources/app.asar.unpacked/

# Verify native module is unpacked
ls dist/win-unpacked/resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/

# Should see: better_sqlite3.node (1.9 MB)
```

**Test Executable:**

```bash
cd dist/win-unpacked
./electron-shadcn.exe
```

**Verify:**
- ✅ App launches
- ✅ Database works
- ✅ No "Cannot find module" errors

---

## Common Issues & Solutions

### Issue 1: Module Not Found

**Error:**
```
Error: Cannot find module 'better-sqlite3'
```

**Possible Causes:**

1. **Not externalized in bundler**
   ```typescript
   // ❌ Missing external
   build: {
     rollupOptions: {}
   }

   // ✅ With external
   build: {
     rollupOptions: {
       external: ['better-sqlite3']
     }
   }
   ```

2. **Not unpacked in builder**
   ```json
   // ❌ Missing asarUnpack
   {
     "asar": true
   }

   // ✅ With asarUnpack
   {
     "asar": true,
     "asarUnpack": ["node_modules/better-sqlite3/**"]
   }
   ```

3. **Not rebuilt**
   ```bash
   # Rebuild for specific Electron version
   npm run rebuild
   ```

### Issue 2: Wrong Electron Version

**Error:**
```
Error: The module was compiled against a different Node.js version
```

**Solution:**
```bash
# Force rebuild for current Electron version
npm run rebuild

# Or manually
npx electron-rebuild -f -w better-sqlite3
```

**Why:** Native modules are compiled for specific Node.js/Electron versions. Electron 40 uses a different Node version than your system Node.

### Issue 3: Module Loads in Dev but Not Prod

**Symptom:** Works in `npm run dev`, fails in packaged app

**Cause:** Different loading mechanisms
- Dev: Files loaded from filesystem
- Prod: Files loaded from ASAR archive

**Solution:** Ensure all three layers configured:
1. ✅ `external` in bundler config
2. ✅ `asarUnpack` in builder config
3. ✅ `rebuild` script run before package

### Issue 4: Multiple Native Modules

**Challenge:** App uses multiple native modules

**Solution:**
```typescript
// electron.vite.config.ts
external: [
  'better-sqlite3',
  'sharp',
  'usb',
  '@electron/rebuild'
]
```

```json
// electron-builder.json
{
  "asarUnpack": [
    "node_modules/better-sqlite3/**",
    "node_modules/sharp/**",
    "node_modules/usb/**"
  ]
}
```

```json
// package.json
{
  "scripts": {
    "rebuild": "electron-rebuild -f -w better-sqlite3 -w sharp -w usb"
  }
}
```

### Issue 5: Large Package Size

**Symptom:** App is 500MB+ due to unpacked modules

**Solutions:**

1. **Unpack only what's needed**
   ```json
   {
     "asarUnpack": [
       "node_modules/better-sqlite3/build/Release/*.node"
     ]
   }
   ```

2. **Check module size**
   ```bash
   du -sh node_modules/better-sqlite3
   ```

3. **Consider alternatives** (see [Alternative Approaches](#alternative-approaches))

---

## Best Practices

### 1. Always Externalize Native Modules

```typescript
// electron.vite.config.ts
build: {
  rollupOptions: {
    external: [
      'better-sqlite3',
      // Add ALL native modules here
    ]
  }
}
```

**Why:** Bundling will break native modules.

### 2. Use Lazy Loading

```typescript
let db: Database.Database | null = null;

function getDB() {
  if (!db) {
    const Database = require('better-sqlite3');
    db = new Database('path/to/db.sqlite');
  }
  return db;
}
```

**Benefits:**
- Avoids top-level import issues
- Better error handling
- Module loaded only when needed

### 3. Keep Database in Main Process

```typescript
// ✅ GOOD - Database in main process
// src/main/ipc/database.ts
export function getPosts() {
  const db = getDB();
  return db.prepare('SELECT * FROM posts').all();
}

// ❌ BAD - Database in renderer
// src/renderer/db.ts
import Database from 'better-sqlite3';  // Don't do this!
const db = new Database('db.sqlite');
```

**Why:**
- Security (database in backend)
- No native module loading in renderer
- Better architecture

### 4. Rebuild Before Every Package

```json
{
  "scripts": {
    "package": "npm run rebuild && npm run build && electron-builder --win"
  }
}
```

**Why:** Ensures native modules are compiled for current Electron version.

### 5. Test Packaged App

```bash
# Always test the actual executable
cd dist/win-unpacked
./electron-shadcn.exe
```

**Don't rely solely on dev mode!**

### 6. Verify Unpacked Directory

```bash
# After packaging, verify structure
ls dist/win-unpacked/resources/app.asar.unpacked/node_modules/

# Should see your native modules
```

### 7. Use Type Definitions

```typescript
// @types/better-sqlite3
import type { Database } from 'better-sqlite3';

let db: Database.Database | null = null;
```

**Better IDE support and error checking.**

---

## Alternative Approaches

### Option 1: LibSQL / Turso

**What:** Fork of SQLite that works with WASM

**Pros:**
- No native modules
- Works in browsers
- Edge database via Turso

**Cons:**
- Different API from SQLite
- Network dependency for Turso
- May not need native module issues

**Migration:**
```typescript
// Instead of better-sqlite3
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:local.db'
});

const result = await client.execute('SELECT * FROM posts');
```

### Option 2: SQL.js

**What:** SQLite compiled to WebAssembly

**Pros:**
- Pure JavaScript (WASM)
- No native modules
- Works in browsers

**Cons:**
- Slower than native
- Larger bundle size
- In-memory only (by default)

**Example:**
```typescript
import initSqlJs from 'sql.js';

const SQL = await initSqlJs();
const db = new SQL.Database();
```

### Option 3: Prisma

**What:** Modern ORM with SQLite support

**Pros:**
- Type-safe
- Great migrations
- No native module handling needed

**Cons:**
- Heavier than better-sqlite3
- Different API
- Query builder overhead

**Setup:**
```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

### Option 4: Electron Userland Solutions

**Keep in main process only:**
- No renderer-side native modules
- Use IPC for communication
- Simpler packaging

**Architecture:**
```
┌─────────────────────────────────┐
│  Renderer Process (UI)          │
│  - Pure JavaScript              │
│  - No native modules            │
│  - IPC calls to main            │
└─────────────────────────────────┘
           ↓ IPC ↑
┌─────────────────────────────────┐
│  Main Process (Backend)         │
│  - Native modules live here     │
│  - Database operations          │
│  - File system access           │
└─────────────────────────────────┘
```

---

## Advanced Configuration

### Multiple Electron Versions

**If you need to support multiple Electron versions:**

```json
{
  "scripts": {
    "rebuild:electron40": "electron-rebuild -f -v 40.0.0 -w better-sqlite3",
    "rebuild:electron39": "electron-rebuild -f -v 39.0.0 -w better-sqlite3"
  }
}
```

### Custom Rebuild Options

```bash
# Rebuild for specific architecture
electron-rebuild -f -w better-sqlite3 -a x64

# Rebuild with custom build flags
electron-rebuild -f -w better-sqlite3 --force

# Rebuild from source
electron-rebuild -f -w better-sqlite3 --prebuild-tag-node
```

### Conditional Imports

```typescript
function getDatabase() {
  if (process.type === 'renderer') {
    throw new Error('Cannot use database in renderer');
  }

  const Database = require('better-sqlite3');
  return new Database('app.db');
}
```

---

## Performance Tips

### 1. Connection Pooling

```typescript
// Reuse database connections
let db: Database.Database | null = null;

function getDB() {
  if (!db) {
    const Database = require('better-sqlite3');
    db = new Database('app.db');
    db.pragma('journal_mode = WAL');  // Better performance
  }
  return db;
}
```

### 2. Prepared Statements

```typescript
// ✅ GOOD - Reuse prepared statements
const stmt = getDB().prepare('SELECT * FROM users WHERE id = ?');

export function getUser(id: number) {
  return stmt.get(id);
}

// ❌ BAD - Prepare every time
export function getUserBad(id: number) {
  const db = getDB();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}
```

### 3. WAL Mode

```typescript
db.pragma('journal_mode = WAL');
```

**Benefits:**
- Better concurrency
- Faster writes
- Still safe for local databases

---

## Troubleshooting Guide

### Diagnostic Steps

1. **Check if module is externalized**
   ```bash
   grep -r "better-sqlite3" out/main/main.js
   ```
   Should NOT see bundled code (just `require('better-sqlite3')`)

2. **Verify unpacked directory exists**
   ```bash
   ls dist/win-unpacked/resources/app.asar.unpacked/
   ```

3. **Check .node file exists**
   ```bash
   ls dist/win-unpacked/resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node
   ```

4. **Test rebuild**
   ```bash
   npm run rebuild
   ```

5. **Clean rebuild**
   ```bash
   rm -rf node_modules/better-sqlite3/build
   npm run rebuild
   ```

### Debug Mode

Run with debug output:

```bash
DEBUG=* npm run dev
```

### Verbose Rebuild

```bash
npx electron-rebuild -f -w better-sqlite3 --verbose
```

---

## Resources

### Official Documentation
- [Electron Native Modules Guide](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)
- [electron-builder Native Modules](https://www.electron.build/configuration/configuration#configuration)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)

### Tools
- [electron-rebuild](https://github.com/electron/electron-rebuild)
- [node-gyp](https://github.com/nodejs/node-gyp)

### Community
- [Electron Discord](https://discord.gg/electronjs)
- [Stack Overflow - Electron Tag](https://stackoverflow.com/questions/tagged/electron)

### Related Projects
- [sql.js](https://sql.js.org)
- [LibSQL](https://libsql.org)
- [Turso](https://turso.tech)

---

**Last Updated:** February 16, 2026
**Electron Version:** 40.1.0
**better-sqlite3 Version:** 12.6.2
**Document Version:** 1.0
