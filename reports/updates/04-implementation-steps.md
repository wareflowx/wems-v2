# Implementation Steps

## Step 1: Add Publish Configuration to electron-builder.json

**Required for electron-updater to function:**

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
    "differentialPackage": true,
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": false,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  },
  "publish": {
    "provider": "github",
    "owner": "wareflowx",
    "repo": "wems-v2"
  }
}
```

**Key changes:**
- `differentialPackage`: `false` → `true` (enables delta updates)
- Added `publish` configuration for GitHub releases

---

## Step 2: Create UpdateManager Module

**Create:** `src/main/update-manager.ts`

```typescript
import { NsisUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../core/constants";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "update-available"
  | "downloading"
  | "ready"
  | "installing"
  | "up-to-date"
  | "error";

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface UpdateState {
  status: UpdateStatus;
  progress?: UpdateProgress;
  version?: string;
  error?: string;
}

export class UpdateManager {
  private updater: NsisUpdater;
  private mainWindow: BrowserWindow | null = null;
  private state: UpdateState = { status: "idle" };

  constructor() {
    this.updater = new NsisUpdater();
    this.setupLogger();
    this.setupEventHandlers();
  }

  private setupLogger(): void {
    this.updater.logger = log;
    log.transports.file.level = "debug";
    log.transports.console.level = "debug";
  }

  private setupEventHandlers(): void {
    this.updater.on("checking-for-update", () => {
      this.updateState({ status: "checking" });
    });

    this.updater.on("update-available", (info) => {
      this.updateState({
        status: "update-available",
        version: info.version,
      });
    });

    this.updater.on("update-not-available", () => {
      this.updateState({ status: "up-to-date" });
    });

    this.updater.on("download-progress", (progress) => {
      this.updateState({
        status: "downloading",
        progress: {
          percent: progress.percent,
          bytesPerSecond: progress.bytesPerSecond,
          transferred: progress.transferred,
          total: progress.total,
        },
      });
    });

    this.updater.on("update-downloaded", (info) => {
      this.updateState({
        status: "ready",
        version: info.version,
      });
    });

    this.updater.on("error", (error) => {
      log.error("[UpdateManager] Error:", error);
      this.updateState({
        status: "error",
        error: error.message || "Unknown update error",
      });
    });

    this.updater.on("update-cancelled", () => {
      this.updateState({ status: "idle" });
    });
  }

  private updateState(newState: Partial<UpdateState>): void {
    this.state = { ...this.state, ...newState };
    this.broadcastState();
  }

  private broadcastState(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.mainWindow.webContents.send(IPC_CHANNELS.UPDATE_STATUS, {
      status: this.state.status,
      progress: this.state.progress,
      version: this.state.version,
      error: this.state.error,
    });
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  async checkForUpdates(): Promise<void> {
    if (this.state.status === "downloading" || this.state.status === "installing") {
      log.info("[UpdateManager] Update already in progress, skipping");
      return;
    }

    try {
      this.updater.disableDifferentialDownload = false;
      await this.updater.checkForUpdates();
    } catch (error) {
      log.error("[UpdateManager] Check failed:", error);
      this.updateState({
        status: "error",
        error: (error as Error).message,
      });
    }
  }

  async downloadAndInstall(): Promise<void> {
    if (this.state.status !== "update-available") {
      log.warn("[UpdateManager] No update available to download");
      return;
    }

    try {
      await this.updater.downloadUpdate();
    } catch (error) {
      log.error("[UpdateManager] Download failed:", error);
      this.updateState({
        status: "error",
        error: (error as Error).message,
      });
    }
  }

  quitAndInstall(): void {
    if (this.state.status !== "ready") {
      log.warn("[UpdateManager] Update not ready for installation");
      return;
    }

    this.updateState({ status: "installing" });

    setTimeout(() => {
      this.updater.quitAndInstall(false, true);
    }, 1000);
  }

  getState(): UpdateState {
    return { ...this.state };
  }

  isUpdateAvailable(): boolean {
    return this.state.status === "update-available";
  }

  isUpdateReady(): boolean {
    return this.state.status === "ready";
  }
}

// Singleton instance
let updateManager: UpdateManager | null = null;

export function getUpdateManager(): UpdateManager {
  if (!updateManager) {
    updateManager = new UpdateManager();
  }
  return updateManager;
}
```

---

## Step 3: Create UpdateSidebarBanner Component

**Create:** `src/renderer/src/components/update-sidebar-banner.tsx`

```typescript
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type UpdatePhase = "checking" | "available" | "downloading" | "ready" | "installing" | "error";

interface UpdateState {
  status: UpdatePhase;
  version?: string;
  error?: string;
  progress?: {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
  };
}

export function UpdateSplashScreen() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdateState | null>(null);
  const [autoClose, setAutoClose] = useState(false);

  useEffect(() => {
    const electron = (window as Window & {
      electron?: {
        onUpdateStatusChanged?: (callback: (data: UpdateState) => void) => void;
      };
    }).electron;

    if (!electron?.onUpdateStatusChanged) return;

    const unsubscribe = electron.onUpdateStatusChanged((data) => {
      setState(data);

      if (data.status === "up-to-date" || data.status === "error") {
        setTimeout(() => setAutoClose(true), 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!state || autoClose) {
    return null;
  }

  const showSplash = ["checking", "download-progress", "downloading", "ready", "installing"].includes(
    state.status
  );

  if (!showSplash && state.status !== "update-available") {
    return null;
  }

  const progressPercent = state.progress?.percent ?? 0;
  const downloadSpeed = formatBytes(state.progress?.bytesPerSecond ?? 0) + "/s";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-slate-800 p-8 shadow-2xl">
        <div className="size-16 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">W</span>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">
            {state.status === "checking" && t("update.checking", "Checking for Updates")}
            {state.status === "update-available" && t("update.available", "Update Available")}
            {state.status === "downloading" && t("update.downloading", "Downloading Update")}
            {state.status === "ready" && t("update.ready", "Update Ready")}
            {state.status === "installing" && t("update.installing", "Installing Update")}
            {state.status === "error" && t("update.error", "Update Error")}
          </h2>

          {state.version && (
            <p className="mt-1 text-sm text-slate-400">
              {t("update.version", "Version")} {state.version}
            </p>
          )}
        </div>

        {(state.status === "downloading" || state.status === "download-progress") && (
          <div className="w-72">
            <div className="mb-2 flex justify-between text-sm text-slate-400">
              <span>{progressPercent.toFixed(1)}%</span>
              <span>{downloadSpeed}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              {formatBytes(state.progress?.transferred ?? 0)} / {formatBytes(state.progress?.total ?? 0)}
            </p>
          </div>
        )}

        {state.status === "error" && state.error && (
          <p className="text-sm text-red-400 text-center max-w-xs">{state.error}</p>
        )}

        {state.status === "ready" && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                const electron = (window as any).electron;
                electron?.sys?.installUpdate?.();
              }}
              className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("update.installNow", "Install Now")}
            </button>
            <button
              onClick={() => setAutoClose(true)}
              className="rounded-lg bg-slate-700 px-6 py-2 font-medium text-slate-300 hover:bg-slate-600"
            >
              {t("update.later", "Later")}
            </button>
          </div>
        )}

        {state.status === "installing" && (
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
```

---

## Step 4: Update Main Process Entry Point

Modify `src/main/index.ts` to integrate the UpdateManager:

```typescript
import { ipcContext } from "@@/ipc/context";
import { Lock } from "@@/lib/lock";
import { configure, logger } from "@@/lib/logger";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog } from "electron";
import { ipcMain, MessageChannelMain } from "electron/main";
import { IPC_CHANNELS, TIMING, WINDOW } from "../core/constants";
import { getUpdateManager } from "./update-manager";
import {
  getDb,
  isWriteMode,
  releaseWriteLock,
  startLockWatcher,
} from "../core/db";

// In createWindow(), after mainWindow is created:
const updateManager = getUpdateManager();
updateManager.setMainWindow(mainWindow);

// IPC handler for manual update check
ipcMain.handle("update:check", async () => {
  const manager = getUpdateManager();
  await manager.checkForUpdates();
  return manager.getState();
});

ipcMain.handle("update:download", async () => {
  const manager = getUpdateManager();
  await manager.downloadAndInstall();
});

ipcMain.on("update:install", () => {
  const manager = getUpdateManager();
  manager.quitAndInstall();
});

// In app.whenReady(), after logger setup:
const updateManager = getUpdateManager();
updateManager.setMainWindow(mainWindow);

// Auto-check for updates after app is ready (with delay to not block startup)
setTimeout(() => {
  if (!inDevelopment) {
    updateManager.checkForUpdates();
  }
}, 5000);
```

---

## Step 5: Update Preload Bridge

Add IPC handlers for update operations in `src/preload/index.ts`:

```typescript
contextBridge.exposeInMainWorld("electron", {
  // ... existing code ...
  update: {
    check: () => ipcRenderer.invoke("update:check"),
    download: () => ipcRenderer.invoke("update:download"),
    install: () => ipcRenderer.send("update:install"),
  },
});
```