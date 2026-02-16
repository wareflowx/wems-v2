# electron-vite 5.0: Complete Guide (2026)

**Last Updated:** February 16, 2026
**electron-vite Version:** 5.0.0
**Status:** Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [Why electron-vite in 2026?](#why-electron-vite-in-2026)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Best Practices](#best-practices)
7. [Migration from electron-forge](#migration-from-electron-forge)

---

## Introduction

**electron-vite** is a build tool specifically designed for Electron applications, built on top of Vite. It provides fast development experience and optimized production builds.

**Key Release:** electron-vite 5.0.0 (December 7, 2025)
- Major milestone with breaking changes
- Improved performance
- Better TypeScript support
- Enhanced plugin ecosystem

---

## Why electron-vite in 2026?

### Comparison Table

| Feature | electron-forge | electron-vite 5.0 |
|---------|---------------|-------------------|
| **Release Date** | 2022+ | December 2025 (2 months old) |
| **Build Speed** | Slow (5-10s) | Fast (1-2s) ⚡ |
| **HMR Speed** | 500ms+ | 10-20ms ⚡ |
| **Native Modules** | ⚠️ Known issues | ✅ Well-documented |
| **Config Complexity** | High | Low |
| **Documentation** | Average | Excellent |
| **Community** | Mature | Growing rapidly |
| **Future-Proof** | Uncertain | ✅ Active development |

### Key Advantages

1. **Lightning Fast HMR** - Updates reflect in 10-20ms
2. **First-Class Vite Integration** - Native Vite plugins work out of the box
3. **Simplified Configuration** - One config file for all processes
4. **Better TypeScript Support** - Full type checking
5. **Modern Build Pipeline** - Optimized for 2026+

---

## Architecture

### Three-Process Structure

electron-vite manages three separate processes:

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                         │
├─────────────┬──────────────┬───────────────────────────┤
│ Main Process│  Preload     │     Renderer Process       │
│ (Node.js)   │  Scripts     │     (Chromium)             │
│             │              │                           │
│ - Backend   │ - Bridge     │ - React/Vue/etc.          │
│ - IPC       │ - Context    │ - UI Layer                │
│ - File sys  │ - Security   │ - Vite Dev Server         │
└─────────────┴──────────────┴───────────────────────────┘
```

### Output Structure

After building, electron-vite creates:

```
out/
├── main/           # Main process bundle
│   ├── main.js     # Entry point
│   └── chunks/     # Code splitting chunks
├── preload/        # Preload scripts
│   └── preload.js
└── renderer/       # Renderer process
    ├── index.html
    └── assets/     # JS, CSS, fonts, images
        ├── index-abc123.js
        └── index-def456.css
```

---

## Configuration

### Basic Configuration

Create `electron.vite.config.ts` in project root:

```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  // Main process (Node.js backend)
  main: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main.ts'),
        // CRITICAL: Externalize native modules
        external: ['better-sqlite3', '@electron/rebuild']
      }
    }
  },

  // Preload scripts (secure bridge)
  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/preload.ts'),
        external: ['better-sqlite3']
      }
    }
  },

  // Renderer process (UI layer)
  renderer: {
    root: '.',
    server: {
      host: '127.0.0.1',  // Use 127.0.0.1 instead of localhost
      port: 5173,
      strictPort: true
    },
    plugins: [
      // Add Vite plugins here (Tailwind, React, etc.)
      tailwindcss(),
      react()
    ],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
      target: 'chrome108'  // Electron 40+ equivalent
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
});
```

### Critical Configuration Points

#### 1. Entry Points

Each process needs an explicit entry point:

```typescript
build: {
  rollupOptions: {
    input: resolve(__dirname, 'src/main.ts')  // ABSOLUTE path required
  }
}
```

**Common Error:** `An entry point is required in the electron vite main config`
**Solution:** Always use absolute paths with `resolve(__dirname, ...)`

#### 2. Path Aliases

Configure aliases for each process independently:

```typescript
main: {
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}
```

**Common Error:** `Rollup failed to resolve import "@/ipc/context"`
**Solution:** Add alias config to ALL processes that use it

#### 3. Native Modules

**CRITICAL:** Externalize native modules to prevent bundling:

```typescript
build: {
  rollupOptions: {
    external: ['better-sqlite3', '@electron/rebuild']
  }
}
```

**Why:** Native modules (`*.node`) are binary files that cannot be bundled.

**Common Error:** `Cannot find module 'better-sqlite3'` in production
**Solution:** Always externalize native modules in main and preload configs

#### 4. Renderer Root

Set the renderer root directory:

```typescript
renderer: {
  root: '.',  // Current directory
  // ...
}
```

**Common Error:** `Failed to resolve /src/renderer.ts from index.html`
**Solution:** Set `root: '.'` for renderer process

---

## Common Issues & Solutions

### Issue 1: Preload Script Not Found

**Error:**
```
Unable to load preload script: C:\path\to\out\main\preload.js
Error: Cannot find module 'C:\path\to\out\main\preload.js'
```

**Root Cause:** With electron-vite 5.0, preload scripts are in `out/preload/`, NOT `out/main/`

**Solution:**
```typescript
// In src/main.ts
const preload = path.join(__dirname, '../preload/preload.js');
// NOT: path.join(__dirname, 'preload.js')
```

### Issue 2: Dev Server Not Loading

**Error:**
```
Failed to load URL: file:///path/to/out/renderer/index.html with error: ERR_FILE_NOT_FOUND
```

**Root Cause:** In development, renderer is served by Vite dev server, not from file system

**Solution:**
```typescript
// In src/main.ts
const inDevelopment = process.env.NODE_ENV === 'development';

if (inDevelopment) {
  mainWindow.loadURL('http://127.0.0.1:5173/');
} else {
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadURL(`file://${rendererPath}`);
}
```

### Issue 3: MAIN_WINDOW_VITE_DEV_SERVER_URL Undefined

**Error:**
```
ReferenceError: MAIN_WINDOW_VITE_DEV_SERVER_URL is not defined
```

**Root Cause:** This variable is NOT automatically injected by electron-vite

**Solution:** Don't rely on this variable. Use `process.env.NODE_ENV` instead:

```typescript
const inDevelopment = process.env.NODE_ENV === 'development';

if (inDevelopment) {
  mainWindow.loadURL('http://127.0.0.1:5173/');
}
```

### Issue 4: CSS Not Loading

**Symptom:** App launches but interface is unstyled

**Root Cause 1:** CSS not imported in JavaScript
**Solution:**
```typescript
// In src/renderer.ts
import '@/styles/global.css';  // Vite needs JS import to process CSS
```

**Root Cause 2:** Tailwind plugin not configured
**Solution:**
```typescript
// In electron.vite.config.ts
import tailwindcss from '@tailwindcss/vite';

renderer: {
  plugins: [tailwindcss()]
}
```

### Issue 5: Imports Not Resolving

**Error:**
```
Cannot find module '@/components/Button'
```

**Root Cause:** Path alias not configured

**Solution:** Add alias to ALL processes:
```typescript
export default defineConfig({
  main: {
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    }
  },
  preload: {
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    }
  },
  renderer: {
    resolve: {
      alias: { '@': resolve(__dirname, 'src') }
    }
  }
});
```

---

## Best Practices

### 1. Use 127.0.0.1 Instead of localhost

```typescript
server: {
  host: '127.0.0.1',  // ✅ Preferred
  // NOT: host: 'localhost'
}
```

**Why:** More reliable across different network configurations

### 2. Always Externalize Native Modules

```typescript
build: {
  rollupOptions: {
    external: [
      'better-sqlite3',
      '@electron/rebuild',
      'sqlite3'
      // ... any native module
    ]
  }
}
```

### 3. Use Absolute Paths for Entry Points

```typescript
build: {
  rollupOptions: {
    input: resolve(__dirname, 'src/main.ts')  // ✅ Absolute
    // NOT: 'src/main.ts'  // ❌ Relative
  }
}
```

### 4. Configure All Three Processes

Even if you don't use preload initially, configure it:

```typescript
preload: {
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/preload.ts')
    }
  }
}
```

**Why:** Prevents confusion when you add preload later

### 5. Separate Dev and Production Logic

```typescript
const isDev = process.env.NODE_ENV === 'development';

// Use this flag throughout your code
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### 6. Use TypeScript

electron-vite has excellent TypeScript support:

```typescript
import { defineConfig } from 'electron-vite';
import type { ConfigEnv, UserConfig } from 'electron-vite';

export default defineConfig((env: ConfigEnv) => {
  const isDev = env.command === 'serve';

  return {
    // Type-safe configuration
  };
});
```

---

## Development Workflow

### Starting Development

```bash
npm run dev
```

**What happens:**
1. electron-vite builds main process (~1s)
2. electron-vite builds preload scripts (~10ms)
3. Vite dev server starts for renderer
4. Electron window opens
5. HMR enabled for renderer process

### Building for Production

```bash
npm run build
```

**What happens:**
1. Main process bundled → `out/main/`
2. Preload scripts bundled → `out/preload/`
3. Renderer built → `out/renderer/`
4. Assets optimized and hashed

**Output Structure:**
```
out/
├── main/main.js (332 KB)
├── preload/preload.js (0.36 KB)
└── renderer/
    ├── index.html
    └── assets/
        ├── index-abc123.js (1.2 MB)
        └── index-def456.css (50 KB)
```

---

## Migration from electron-forge

### Key Differences

| Aspect | electron-forge | electron-vite |
|--------|---------------|---------------|
| **Config File** | `forge.config.ts` | `electron.vite.config.ts` |
| **Main Entry** | Auto-detected | Explicit in config |
| **Output Dir** | `.vite/build/` | `out/` |
| **Plugins** | Forge plugins | Vite plugins |
| **Package.json Main** | `.vite/build/main.js` | `out/main/main.js` |

### Migration Steps

1. **Install electron-vite:**
   ```bash
   npm uninstall @electron-forge/cli @electron-forge/plugin-vite
   npm install -D electron-vite@latest
   ```

2. **Create electron.vite.config.ts:** (See [Configuration](#configuration))

3. **Update package.json:**
   ```json
   {
     "main": "out/main/main.js",
     "scripts": {
       "dev": "electron-vite dev",
       "build": "electron-vite build",
       "package": "electron-vite build && electron-builder"
     }
   }
   ```

4. **Delete old configs:**
   ```bash
   rm forge.config.ts
   rm vite.main.config.mts
   rm vite.preload.config.mts
   ```

5. **Test development:**
   ```bash
   npm run dev
   ```

---

## Advanced Configuration

### Environment Variables

**.env file:**
```env
VITE_APP_TITLE=My Electron App
VITE_API_URL=https://api.example.com
```

**Usage in code:**
```typescript
// In renderer process (client-side)
const apiUrl = import.meta.env.VITE_API_URL;

// In main/preload processes (Node.js)
const apiUrl = process.env.VITE_API_URL;
```

### Conditional Configuration

```typescript
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    main: {
      build: {
        sourcemap: isDev,  // Only in development
        minify: !isDev     // Only in production
      }
    }
  };
});
```

### Multiple Preload Scripts

```typescript
preload: {
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/preload/index.ts'),
        worker: resolve(__dirname, 'src/preload/worker.ts')
      }
    }
  }
}
```

---

## Performance Optimization

### Build Speed

**Optimized config:**
```typescript
build: {
  sourcemap: false,  // Disable in production
  minify: 'terser',  // Use terser for better minification
  rollupOptions: {
    output: {
      manualChunks: {  // Code splitting
        'react-vendor': ['react', 'react-dom'],
        'ui-library': ['@radix-ui/react-*']
      }
    }
  }
}
```

### HMR Speed

**Fast HMR tips:**
1. Use `127.0.0.1` instead of `localhost`
2. Disable unnecessary extensions in dev
3. Keep build output small
4. Use code splitting

---

## Troubleshooting

### Clean Build

If you encounter strange errors:

```bash
# Remove all build artifacts
rm -rf out/
rm -rf node_modules/.vite

# Rebuild
npm run build
```

### Check Configuration

Validate your config:

```bash
npx electron-vite inspect
```

### Debug Mode

Run with verbose output:

```bash
DEBUG=electron-vite:* npm run dev
```

---

## Resources

### Official Documentation
- [electron-vite Official Site](https://electron-vite.org)
- [electron-vite GitHub](https://github.com/electron-vite/electron-vite)
- [Release Notes v5.0.0](https://github.com/electron-vite/electron-vite/releases/tag/v5.0.0)

### Community
- [Discord Server](https://discord.gg/HnHzhYgEBY)
- [GitHub Discussions](https://github.com/electron-vite/electron-vite/discussions)

### Related Tools
- [Electron Official Docs](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [electron-builder](https://www.electron.build)

---

**Last Updated:** February 16, 2026
**electron-vite Version:** 5.0.0
**Document Version:** 1.0
