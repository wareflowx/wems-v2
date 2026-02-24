# BrowserWindow

Create and control browser windows.

**Process**: Main

This module cannot be used until the ready event of the app module is emitted.

```javascript
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ width: 800, height: 600 })
win.loadURL('https://github.com')
// or
win.loadFile('index.html')
```

## Creating a BrowserWindow

```javascript
const win = new BrowserWindow({
  width: 800,
  height: 600,
  show: false,  // Show after ready-to-show
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
})
```

### Key webPreferences Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `preload` | string | - | Path to preload script |
| `contextIsolation` | boolean | true | Run preload in isolated context |
| `nodeIntegration` | boolean | false | Enable Node in renderer |
| `sandbox` | boolean | true | Sandbox the renderer |
| `session` | Session | default | Session for the page |
| `partition` | string | - | Session partition string |
| `zoomFactor` | number | 1.0 | Default zoom factor |

### Important: contextIsolation

> When `contextIsolation` is enabled (default since Electron 12), the preload script runs in an "Isolated World". The preload has its own dedicated `document` and `window` globals.

This is why our IPC setup was problematic - preload and renderer have separate contexts.

## Window Relationships

### Parent and Child Windows

```javascript
const parent = new BrowserWindow()
const child = new BrowserWindow({ parent: parent })
```

### Modal Windows

```javascript
const modal = new BrowserWindow({
  parent: top,
  modal: true,
  show: false
})
```

## Instance Properties

### win.webContents

```javascript
// The key property - access to renderer
win.webContents.loadURL('https://github.com')
win.webContents.send('channel', data)
win.webContents.postMessage('port', null, [port])
```

### win.id

Unique ID of the window.

## Instance Methods

### win.loadURL(url[, options])

Loads the url in the window.

### win.loadFile(filePath[, options])

Loads the given file in the window.

### win.show()

Shows and gives focus to the window.

### win.hide()

Hides the window.

### win.close()

Closes the window.

### win.minimize()

Minimizes the window.

### win.maximize()

Maximizes the window.

### win.unmaximize()

Unmaximizes the window.

### win.isMaximized()

Returns boolean - Whether the window is maximized.

### win.setFullScreen(flag)

- `flag` boolean

Sets whether the window should be in fullscreen mode.

### win.setAlwaysOnTop(flag)

- `flag` boolean

Sets whether the window should show always on top of other windows.

### win.setMenu(menu)

- `menu` Menu | null

Sets the menu as the window's menu bar.

## Events

### Event: 'ready-to-show'

Emitted when the window can be displayed without visual flash.

```javascript
win.once('ready-to-show', () => {
  win.show()
})
```

### Event: 'closed'

Emitted when the window is closed.

### Event: 'focus'

Emitted when the window gains focus.

### Event: 'blur'

Emitted when the window loses focus.

### Event: 'maximize'

Emitted when window is maximized.

### Event: 'unmaximize'

Emitted when window exits maximized state.

### Event: 'minimize'

Emitted when window is minimized.

### Event: 'restore'

Emitted when window is restored from minimized state.

## Static Methods

### BrowserWindow.getAllWindows()

Returns all opened browser windows.

### BrowserWindow.getFocusedWindow()

Returns the focused window or null.

### BrowserWindow.fromWebContents(webContents)

Returns the window that owns the given webContents.

### BrowserWindow.fromId(id)

Returns the window with the given id.

## Usage in Our ORPC Setup

In our main.ts:

```javascript
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
})

// Send MessagePort to renderer
const { port1, port2 } = new MessageChannelMain()
win.webContents.postMessage(IPC_CHANNELS.ORPC_READY, null, [port2])
```
