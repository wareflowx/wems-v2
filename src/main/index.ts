import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { ipcMain, MessageChannelMain } from "electron/main";
import { UpdateSourceType, updateElectronApp } from "update-electron-app";
import { ipcContext } from "@/ipc/context";
import { IPC_CHANNELS } from "../constants";
import { releaseWriteLock, isWriteMode, startLockWatcher, getDb } from "../db";
import { Lock } from "@/lib/lock";
import { logger, configure } from "@/lib/logger";

const inDevelopment = process.env.NODE_ENV === 'development';

// Configure logger
configure({
  default: inDevelopment ? 'debug' : 'info',
  lock: 'debug',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // electron-vite 5.0: preload is in out/preload/, main is in out/main/
  const preload = path.join(__dirname, "../preload/preload.js");
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,

      preload,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });
  ipcContext.setMainWindow(mainWindow);

  // Development: load from dev server
  // Production: load from built files
  if (inDevelopment) {
    mainWindow.loadURL('http://127.0.0.1:5173/');
  } else {
    // In production, load from the built renderer files
    // The main process is in out/main/, renderer in out/renderer/
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    const rendererUrl = `file://${rendererPath}`;
    mainWindow.loadURL(rendererUrl);
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function installExtensions() {
  // Skip extension installation - electron-devtools-installer uses deprecated APIs
  // Extensions can be installed manually in Chrome://extensions if needed
  return;
}

function checkForUpdates() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "wareflowx/wems-v2",
    },
  });
}

async function setupORPC() {
  const { rpcHandler } = await import("../ipc/handler");

  console.log("[MAIN] setupORPC: setting up handlers");

  // 1. Direct window controls (always available, no ORPC dependency)
  ipcMain.on("win:minimize", (event) => {
    console.log("[MAIN] win:minimize received");
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on("win:maximize", (event) => {
    console.log("[MAIN] win:maximize received");
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on("win:close", (event) => {
    console.log("[MAIN] win:close received");
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  // 2. ORPC handshake - Main creates channel and sends port to preload
  // This is the reliable pattern: main creates MessageChannel, sends port to preload
  // NOTE: On page refresh (Ctrl+R), webContents changes, so we always create new channel

  ipcMain.on(IPC_CHANNELS.START_ORPC_SERVER, (event) => {
    console.log("[MAIN] START_ORPC_SERVER received from:", event.sender.id);

    console.log("[MAIN] Creating MessageChannel...");

    // Create MessageChannel - main process creates both ports
    const { port1: serverPort, port2: clientPort } = new MessageChannelMain();

    // Start server port in main
    serverPort.start();

    // Upgrade RPC handler with server port
    rpcHandler.upgrade(serverPort);

    console.log("[MAIN] Sending client port to preload via webContents.postMessage...");

    // IMPORTANT: Use postMessage (not send) for port transfer!
    // postMessage allows transferring MessagePorts, send does not
    event.sender.postMessage(IPC_CHANNELS.ORPC_READY, null, [clientPort]);

    console.log("[MAIN] ORPC server ready, port sent to preload");
  });

  // Expose write mode status to renderer
  ipcMain.handle(IPC_CHANNELS.GET_WRITE_MODE, () => {
    const result = isWriteMode();
    logger.debug('[DEBUG] getWriteMode called, result: ' + result, 'main');
    return result;
  });

  // Database operations are handled via ORPC - no separate handlers needed
}

function setupSingleInstance(): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    // Another instance is already running, quit this one
    logger.warn('Another instance is already running, quitting...', 'main');
    app.quit();
  } else {
    // Handle second instance - focus existing window
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  }
}

// Setup single instance lock before app is ready
setupSingleInstance();

app.whenReady().then(async () => {
  try {
    console.log("[MAIN] app.whenReady fired!");
    logger.info('App starting...', 'main');

    // 1. Acquire lock first (doesn't need window)
    logger.info('Acquiring lock...', 'main');
    const lockResult = Lock.acquire();
    const canWrite = lockResult._tag === 'Success' && lockResult.value;
    if (lockResult._tag === 'Failure') {
      logger.error('Failed to acquire lock: ' + lockResult.error.message, lockResult.error, 'main');
    } else {
      logger.info(canWrite ? 'Write mode enabled' : 'Read-only mode enabled', 'main');
    }

    // 2. Initialize database with lock status
    logger.info('Initializing database...', 'main');
    await getDb(canWrite);
    logger.info('Database initialized', 'main');

    // 3. Create window FIRST (so window exists for ORPC context)
    logger.info('Creating window...', 'main');
    createWindow();
    logger.info('Window created', 'main');

    // 4. Setup ORPC AFTER window exists (handlers need window context)
    console.log("[MAIN] About to call setupORPC...");
    logger.info('Setting up ORPC...', 'main');
    try {
      await setupORPC();
      console.log("[MAIN] setupORPC completed successfully");
    } catch (error) {
      console.error("[MAIN] setupORPC FAILED:", error);
      throw error;
    }
    logger.info('ORPC setup complete', 'main');

    // Notify renderer that main is ready to receive ORPC requests
    console.log("[MAIN] Sending MAIN_READY to renderer...");
    mainWindow?.webContents.send(IPC_CHANNELS.MAIN_READY);
    console.log("[MAIN] MAIN_READY sent");

    // 5. Start lock watcher
    logger.info('Starting lock watcher...', 'main');
    startLockWatcher((writeMode) => {
      mainWindow?.webContents.send(IPC_CHANNELS.LOCK_STATUS_CHANGED, writeMode);
    }, 2000);
    logger.info('Lock watcher started', 'main');

    await installExtensions();
    logger.info('Extensions installed', 'main');

    checkForUpdates();
    logger.info('Update check complete', 'main');

    logger.info('App initialization complete', 'main');
  } catch (error) {
    logger.error('Error during app initialization', error as Error, 'main');
    console.error("Error during app initialization:", error);
  }
});

// Handle before-quit to release lock
app.on('before-quit', () => {
  logger.info('App before-quit, releasing lock...', 'main');
  releaseWriteLock();
});

// Handle will-quit as backup
app.on('will-quit', () => {
  logger.info('App will-quit', 'main');
  releaseWriteLock();
});

// Catch unhandled errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error, 'main');
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at ' + promise, reason as Error, 'main');
  console.error('Unhandled Rejection:', reason);
});

// macOS only
app.on("window-all-closed", () => {
  releaseWriteLock();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
