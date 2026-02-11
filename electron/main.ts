import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let win: BrowserWindow | null = null

const preload = path.join(__dirname, './preload.js')
// Check if running in development by checking if dev server dependency exists
const isDev = process.env.NODE_ENV === 'development'
const devUrl = 'http://127.0.0.1:5555'
const indexHtml = path.join(__dirname, '../dist/index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'TanStack Start + Electron',
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Open DevTools
  win.webContents.openDevTools()

  // Development: load from dev server
  // Production: load from built files
  if (isDev) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(indexHtml)
  }

  win.on('closed', () => {
    win = null
  })
}

// When the app is ready, create the window
app.on('ready', createWindow)

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null && app.isReady()) {
    createWindow()
  }
})
