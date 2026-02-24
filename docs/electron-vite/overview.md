# Electron-Vite Best Practices

This guide covers best practices for using electron-vite in this Electron application.

## Overview

electron-vite is a build tool specifically designed for Electron applications. It provides:
- Fast HMR for development
- Optimized builds for production
- Proper handling of main, preload, and renderer processes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    electron-vite                             │
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │    Main     │   │   Preload   │   │  Renderer   │       │
│  │  Process   │   │   Script    │   │  Process    │       │
│  │             │   │             │   │             │       │
│  │  - Node.js │   │ - Context   │   │ - Browser   │       │
│  │  - Native  │   │   Bridge    │   │   APIs      │       │
│  │    APIs     │   │ - IPC       │   │ - React     │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           ▼                                 │
│                    Build Output                             │
│                    (out/ folder)                           │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── main.ts              # Main process entry
├── preload.ts          # Preload script
├── renderer/           # Renderer process
│   ├── index.html
│   ├── src/
│   │   ├── app.tsx
│   │   └── ...
│   └── ...
└── ...
```

## Preload Script Best Practices

### Context Isolation

Always use context isolation with preload scripts:

```typescript
// main.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    preload: path.join(__dirname, '../preload/preload.js'),
  },
});
```

### Exposing APIs

Use `contextBridge.exposeInMainWorld` to expose limited APIs:

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  sys: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    close: () => ipcRenderer.send('win:close'),
  },
  // Expose only what's needed, not full electron API
});
```

### MessagePort Transfer

When transferring MessagePorts (for ORPC), use `postMessage` not `send`:

```typescript
// preload.ts - WRONG ❌
ipcRenderer.send('channel', data);

// preload.ts - CORRECT ✅
ipcRenderer.postMessage('channel', null, [port]);
```

### Why postMessage?

- `ipcRenderer.send()`: Sends data but **loses** MessagePort functionality
- `ipcRenderer.postMessage()`: Preserves MessagePort objects through the transfer

## IPC Communication

### Main → Renderer

```typescript
// Main process
mainWindow.webContents.send('channel-name', data);
```

### Renderer → Main

```typescript
// Preload
ipcRenderer.invoke('channel-name', data);
```

### Preload → Main (with Port)

```typescript
// Preload - for MessagePort transfer
ipcRenderer.postMessage('channel-name', null, [port]);
```

## Build Configuration

### electron.vite.config.ts

```typescript
import { defineConfig } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main.ts'),
        external: ['better-sqlite3'],
      },
    },
  },

  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/preload.ts'),
        external: ['better-sqlite3'],
      },
    },
  },

  renderer: {
    root: '.',
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
  },
});
```

## Common Issues

### 1. Preload Not Loading

**Symptom**: `contextBridge is not defined`

**Solution**: Check that electron module is external in build config:

```typescript
// electron.vite.config.ts
preload: {
  build: {
    rollupOptions: {
      external: ['electron'],
    },
  },
},
```

### 2. MessagePort Not Working

**Symptom**: `port.addEventListener is undefined`

**Cause**: Using `ipcRenderer.send()` instead of `ipcRenderer.postMessage()`

**Solution**:
```typescript
// Wrong ❌
ipcRenderer.send('channel', data);

// Correct ✅
ipcRenderer.postMessage('channel', null, [port]);
```

### 3. Node.js APIs Not Available in Renderer

**Solution**: Always use preload to expose APIs, never enable nodeIntegration:

```typescript
// main.ts
webPreferences: {
  nodeIntegration: false,  // Always false
  contextIsolation: true,   // Always true
  preload: path.join(__dirname, '../preload/preload.js'),
}
```

## Development vs Production

### Development
```bash
npm run dev
```
- Starts Vite dev server
- Loads renderer from `http://127.0.0.1:5173`
- Hot module replacement enabled

### Production
```bash
npm run build
npm run preview
```
- Bundles all code
- Loads renderer from `file://` path
- Optimized for performance

## Related Documents

- [ORPC Overview](../orpc/overview.md)
- [Electron Integration](../orpc/electron-integration.md)
- [Troubleshooting](./troubleshooting.md)
