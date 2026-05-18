# Current Project Analysis

## 1.1 electron-builder.json Configuration

**Location:** `C:\Users\dpereira\Documents\github\wems-v2\electron-builder.json`

```json
{
  "appId": "com.wems",
  "productName": "WEMS",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": ["out/**/*", "package.json"],
  "npmRebuild": true,
  "extraResources": [
    {
      "from": "src/db/migrations",
      "to": "migrations"
    }
  ],
  "asar": true,
  "asarUnpack": ["node_modules/better-sqlite3/**"],
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "differentialPackage": false,
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": false,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

**Observations:**
- `differentialPackage: false` means full installer downloads every time (no delta updates)
- NSIS target is correctly configured for auto-update on Windows
- **No `publish` configuration** - electron-updater cannot determine where to check for updates

---

## 1.2 Main Process Entry Point

**Location:** `C:\Users\dpereira\Documents\github\wems-v2\src\main\index.ts`

Current `checkForUpdates()` function (lines 81-92):

```typescript
function checkForUpdates() {
  // Update check disabled for faster startup
  // TODO: Re-enable after optimizing update check
  console.log("[MAIN] Update check disabled");
  mainWindow?.webContents.send(IPC_CHANNELS.UPDATE_STATUS, {
    status: "up-to-date",
  });

  // Original code (disabled):
  // mainWindow?.webContents.send(IPC_CHANNELS.UPDATE_STATUS, { status: "checking" });
  // updateElectronApp({ ... })
}
```

**Issues identified:**
1. Update is completely disabled with no implementation
2. The disabled `update-electron-app` import exists but is commented out
3. No event listeners for update progress, download completion, or errors
4. No mechanism to show update availability to user before downloading

---

## 1.3 Existing Update Infrastructure

### IPC Channels

**File:** `src/core/constants/index.ts`

```typescript
UPDATE_STATUS: "update-status",
```

### Update Status Dialog

**File:** `src/renderer/src/components/update-status-dialog.tsx`

- Shows spinner during "checking" state
- Shows checkmark for "up-to-date" (auto-dismisses after 3s)
- Shows warning icon for "error"
- Only handles 3 states: `checking`, `up-to-date`, `error`
- **Missing**: `download-progress`, `update-available`, `update-downloaded`, `installing` states

### Preload Bridge

**File:** `src/preload/index.ts`

```typescript
onUpdateStatusChanged: (callback: (status: string) => void) => {
  updateCallbacks.push(callback);
},
// Listens on IPC_CHANNELS.UPDATE_STATUS
```

---

## 1.4 Key Files Reference

| File | Purpose |
|------|---------|
| `electron-builder.json` | Build configuration, NSIS settings |
| `src/main/index.ts` | Main process, update stubs at lines 81-92 |
| `src/core/constants/index.ts` | IPC_CHANNELS.UPDATE_STATUS definition |
| `src/preload/index.ts` | Preload bridge for update status callbacks |
| `src/renderer/src/components/update-status-dialog.tsx` | Current minimal update UI |
| `package.json` | Dependencies: `electron-builder@26.7.0`, `update-electron-app@3.1.2` |