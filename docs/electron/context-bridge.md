# Electron Context Bridge & Preload

## Overview

Create a safe, bi-directional, synchronous bridge across isolated contexts.

Process: Renderer

## Glossary

### Main World

The "Main World" is the JavaScript context that your main renderer code runs in. By default, the page you load in your renderer executes code in this world.

### Isolated World

When `contextIsolation` is enabled in your webPreferences (this is the default behavior since Electron 12.0.0), your preload scripts run in an "Isolated World". You can read more about context isolation and what it affects in the security docs.

## Example: Exposing an API from Preload to Renderer

```javascript
// Preload (Isolated World)
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    doThing: () => ipcRenderer.send('do-a-thing')
  }
)

// Renderer (Main World)
window.electron.doThing()
```

## Methods

### contextBridge.exposeInMainWorld(apiKey, api)

- `apiKey` string - The key to inject the API onto window with. The API will be accessible on `window[apiKey]`.
- `api` any - Your API

### contextBridge.exposeInIsolatedWorld(worldId, apiKey, api)

- `worldId` Integer - The ID of the world to inject the API into. 0 is the default world, 999 is the world used by Electron's contextIsolation feature.
- `apiKey` string - The key to inject the API onto window with.
- `api` any - Your API

## API

The api provided to `exposeInMainWorld` must be a Function, string, number, Array, boolean, or an object whose keys are strings and values are a Function, string, number, Array, boolean, or another nested object.

Function values are proxied to the other context and all other values are copied and frozen. Any data / primitives sent in the API become immutable.

### Example of Complex API

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    doThing: () => ipcRenderer.send('do-a-thing'),
    myPromises: [Promise.resolve(), Promise.reject(new Error('whoops'))],
    anAsyncFunction: async () => 123,
    data: {
      myFlags: ['a', 'b', 'c'],
      bootTime: 1234
    },
    nestedAPI: {
      evenDeeper: {
        youCanDoThisAsMuchAsYouWant: {
          fn: () => ({
            returnData: 123
          })
        }
      }
    }
  }
)
```

## Type Support

| Type | Complexity | Parameter | Return | Limitations |
|------|------------|-----------|--------|-------------|
| string | Simple | ✅ | ✅ | N/A |
| number | Simple | ✅ | ✅ | N/A |
| boolean | Simple | ✅ | ✅ | N/A |
| Object | Complex | ✅ | ✅ | Keys must be supported types only |
| Array | Complex | ✅ | ✅ | Same as Object |
| Error | Complex | ✅ | ✅ | Custom properties lost |
| Promise | Complex | ✅ | ✅ | N/A |
| Function | Complex | ✅ | ✅ | Prototype modifications dropped |
| Symbol | N/A | ❌ | ❌ | Cannot be copied |

## Exposing ipcRenderer

> **Important**: Attempting to send the entire ipcRenderer module as an object over the contextBridge will result in an empty object on the receiving side. Sending over ipcRenderer in full can let any code send any message, which is a security footgun.

To interact through ipcRenderer, provide a safe wrapper:

```javascript
// Preload (Isolated World)
contextBridge.exposeInMainWorld('electron', {
  onMyEventName: (callback) => ipcRenderer.on('MyEventName', (e, ...args) => callback(args))
})

// Renderer (Main World)
window.electron.onMyEventName(data => { /* ... */ })
```

## webContents.postMessage vs ipcRenderer

### webContents.postMessage

Used to send messages directly to the renderer process, optionally transferring MessagePort objects:

```javascript
// Main process
const { port1, port2 } = new MessageChannelMain()
win.webContents.postMessage('port', { message: 'hello' }, [port1])
```

### ipcRenderer.on

Used in preload to receive messages and transferred ports:

```javascript
// Preload - receives the port via event.ports
ipcRenderer.on('port', (event, ...args) => {
  const [port] = event.ports
  // Use the port
})
```

### Key Insight

`webContents.postMessage` sends messages to the **renderer process**, not the preload. The preload runs in an Isolated World with its own `window` object.

To receive transferred MessagePorts in preload, you MUST use `ipcRenderer.on`, NOT `window.addEventListener("message")`.
