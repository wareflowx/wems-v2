# Electron-Vite Troubleshooting Guide

This guide covers common issues with electron-vite and how to fix them.

## Common Issues

### 1. Preload Script Not Loading

**Symptom**:
```
Unable to load preload script: /path/to/preload.js
ReferenceError: contextBridge is not defined
```

**Cause**: The preload script is not properly built or bundled.

**Solutions**:

A) Check that electron is marked as external in config:
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

B) Verify preload path in main.ts:
```typescript
const preload = path.join(__dirname, '../preload/preload.js');
```

C) Clean and rebuild:
```bash
rm -rf out
npm run build
```

---

### 2. MessagePort Transfer Failure

**Symptom**:
```
TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
```

**Cause**: Using `ipcRenderer.send()` instead of `ipcRenderer.postMessage()`.

**Solution**:

```typescript
// WRONG ❌
ipcRenderer.send('start-orpc-server');

// CORRECT ✅
ipcRenderer.postMessage('start-orpc-server', null, [port]);
```

---

### 3. Module Not Found in Preload

**Symptom**:
```
Error: Unable to load preload script
Error: module not found: 'some-module'
```

**Cause**: Dependencies not properly bundled for sandboxed preload.

**Solutions**:

A) Add to external list:
```typescript
preload: {
  build: {
    rollupOptions: {
      external: ['electron', 'better-sqlite3', 'some-other-module'],
    },
  },
},
```

B) Or disable sandbox (not recommended for security):
```typescript
webPreferences: {
  sandbox: false,
}
```

---

### 4. Context Isolation Issues

**Symptom**: `window.electron` is undefined in renderer

**Cause**: Preload not properly exposing APIs.

**Solution**:
```typescript
// preload.ts
contextBridge.exposeInMainWorld('electron', {
  sys: {
    minimize: () => ipcRenderer.send('win:minimize'),
  },
});
```

---

### 5. Hot Reload Not Working

**Symptom**: Changes to renderer not reflected

**Solutions**:

A) Use proper dev server URL in main.ts:
```typescript
if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
  mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
} else {
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}
```

B) Ensure renderer has proper script tag:
```html
<script type="module" src="/src/app.tsx"></script>
```

---

### 6. Build Output Path Issues

**Symptom**: Can't find built files

**Solution**: Check output directory structure:
```
out/
├── main/
│   └── main.js
├── preload/
│   └── preload.js
└── renderer/
    └── index.html
```

Update preload path accordingly:
```typescript
const preload = path.join(__dirname, '../preload/preload.js');
```

---

## Debug Checklist

- [ ] Run `rm -rf out && npm run build`
- [ ] Check console for preload errors
- [ ] Verify contextBridge is used (not window directly)
- [ ] Check electron is in external list
- [ ] Verify IPC channel names match

## Logging Patterns

### Main Process
```typescript
console.log('[MAIN] Starting app...');
console.log('[MAIN] Creating window');
```

### Preload
```typescript
console.log('[PRELOAD] Initializing bridge');
console.log('[PRELOAD] Exposed APIs:', Object.keys(window.electron));
```

### Renderer
```typescript
console.log('[RENDERER] window.electron:', window.electron);
```

## Related Documents

- [Overview](./overview.md)
- [ORPC Integration](../orpc/electron-integration.md)
