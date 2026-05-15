# Recommended Architecture

## 2.1 High-Level Design

```
[Main Process]                    [Renderer Process]
     |                                   |
     |  +-----------------+              |
     |  | UpdateManager   |              |
     |  | - checkForUpdates()            |
     |  | - downloadUpdate()             |
     |  | - quitAndInstall()             |
     |  +--------+--------+              |
     |           |                       |
     |    [electron-updater]             |
     |           |                       |
     |  +--------+--------+              |
     |  | NsisUpdater     |              |
     |  | - autoDownload  |              |
     |  | - differential  |              |
     |  +-----------------+              |
     |           |                       |
     +-----------|-----------------------+
                 | IPC (UPDATE_STATUS)
                 v
[Preload Bridge] --> [UpdateStatusDialog]
```

### Components

1. **UpdateManager** (`src/main/update-manager.ts`) - Central state management
2. **NsisUpdater** (from `electron-updater`) - Handles download and installation
3. **UpdateStatusDialog** - Shows current update status in UI
4. **UpdateSplashScreen** - Full-screen overlay during critical phases

---

## 2.2 Update Stages State Machine

```
                    +--> checking
                    |
start --> idle -----+--> update-available --> downloading --> ready --> installing --> restarted
                    |         |                   |                            |
                    +--> up-to-date              +--> error --------------------+
                    |                                                            |
                    +<------------- user-dismissed <-----------------------------+
```

### State Descriptions

| State | Description |
|-------|-------------|
| `idle` | No update check in progress |
| `checking` | Checking GitHub for new release |
| `update-available` | New version found, user can download |
| `downloading` | Update package being downloaded |
| `ready` | Download complete, ready to install |
| `installing` | NSIS installer is running |
| `up-to-date` | No newer version available |
| `error` | An error occurred during the process |

---

## 2.3 Data Flow

1. **Startup**: `UpdateManager.setMainWindow()` called after window creation
2. **Auto-check**: After 5 seconds (non-dev mode), `checkForUpdates()` is called
3. **Events**: electron-updater emits events → UpdateManager updates state → broadcasts to renderer
4. **User Action**: User can trigger manual check via "Check for Updates" menu item
5. **Download**: When user accepts, `downloadUpdate()` is called
6. **Install**: After download, user clicks "Install Now" → `quitAndInstall()` is called

---

## 2.4 IPC Message Format

```typescript
// Main → Renderer (via IPC_CHANNELS.UPDATE_STATUS)
interface UpdateStatusMessage {
  status: UpdateStatus;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
  version?: string;
  error?: string;
}

// Renderer → Main (via IPC handlers)
interface UpdateIPC {
  check: () => Promise<UpdateState>;
  download: () => Promise<void>;
  install: () => void;
}
```