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

const UPDATE_IPC_CHANNELS = {
  CHECK: "update:check",
  DOWNLOAD: "update:download",
  INSTALL: "update:install",
} as const;

export class UpdateManager {
  private updater: NsisUpdater;
  private mainWindow: BrowserWindow | null = null;
  private state: UpdateState = { status: "idle" };

  constructor() {
    this.updater = new NsisUpdater();
    this.updater.autoDownload = false;
    this.updater.autoInstallOnAppQuit = true;

    this.setupLogger();
    this.setupEventHandlers();
    this.setupIpcHandlers();
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

  private setupIpcHandlers(): void {
    ipcMain.handle(UPDATE_IPC_CHANNELS.CHECK, async () => {
      await this.checkForUpdates();
      return this.getState();
    });

    ipcMain.handle(UPDATE_IPC_CHANNELS.DOWNLOAD, async () => {
      await this.downloadUpdate();
    });

    ipcMain.on(UPDATE_IPC_CHANNELS.INSTALL, () => {
      this.quitAndInstall();
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

    // Reset error state on new check
    if (this.state.status === "error") {
      this.updateState({ status: "idle", error: undefined });
    }

    try {
      await this.updater.checkForUpdates();
    } catch (error) {
      log.error("[UpdateManager] Check failed:", error);

      // Handle 404 (no update published yet) as "up-to-date" silently
      const errorMessage = (error as Error).message || "";
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        this.updateState({ status: "up-to-date" });
      } else {
        this.updateState({
          status: "error",
          error: (error as Error).message,
        });
      }
    }
  }

  async downloadUpdate(): Promise<void> {
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

    // Small delay to ensure status is sent to renderer before quit
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