import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { ipcMain } from "electron/main";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { UpdateSourceType, updateElectronApp } from "update-electron-app";
import { ipcContext } from "@/ipc/context";
import { IPC_CHANNELS } from "./constants";
import fs from "fs";

// Logging system for production debugging
function logToFile(message: string, error?: any) {
  try {
    const userDataPath = app.getPath('userData');
    const logPath = path.join(userDataPath, 'app.log');
    const timestamp = new Date().toISOString();
    const logMessage = error
      ? `${timestamp} - ${message}: ${error.message}\n${error.stack}\n`
      : `${timestamp} - ${message}\n`;
    fs.appendFileSync(logPath, logMessage);
  } catch (e) {
    // Can't log if app.getPath fails
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,

      preload,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
  });
  ipcContext.setMainWindow(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

function checkForUpdates() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: "LuanRoger/electron-shadcn",
    },
  });
}

async function setupORPC() {
  const { rpcHandler } = await import("./ipc/handler");

  ipcMain.on(IPC_CHANNELS.START_ORPC_SERVER, (event) => {
    const [serverPort] = event.ports;

    serverPort.start();
    rpcHandler.upgrade(serverPort);
  });
}

app.whenReady().then(async () => {
  try {
    logToFile('App starting...');
    logToFile(`User data path: ${app.getPath('userData')}`);
    logToFile('Creating window...');
    createWindow();
    logToFile('Window created');
    await installExtensions();
    logToFile('Extensions installed');
    checkForUpdates();
    logToFile('Update check complete');
    await setupORPC();
    logToFile('ORPC setup complete');
    logToFile('App initialization complete');
  } catch (error) {
    logToFile('Error during app initialization', error);
    console.error("Error during app initialization:", error);
  }
});

// Catch unhandled errors
process.on('uncaughtException', (error) => {
  logToFile('Uncaught Exception', error);
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logToFile(`Unhandled Rejection at ${promise}`, reason);
  console.error('Unhandled Rejection:', reason);
});

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
