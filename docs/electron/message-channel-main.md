# MessageChannelMain

MessageChannelMain is the main-process-side equivalent of the DOM MessageChannel object. Its singular function is to create a pair of connected MessagePortMain objects.

**Process**: Main

See the Channel Messaging API documentation for more information on using channel messaging.

## Class: MessageChannelMain

Channel interface for channel messaging in the main process.

## Example

```javascript
// Main process
const { BrowserWindow, MessageChannelMain } = require('electron')

const w = new BrowserWindow()
const { port1, port2 } = new MessageChannelMain()

w.webContents.postMessage('port', null, [port2])

port1.postMessage({ some: 'message' })

// Renderer process
const { ipcRenderer } = require('electron')

ipcRenderer.on('port', (e) => {
  // e.ports is a list of ports sent along with this message
  e.ports[0].onmessage = (messageEvent) => {
    console.log(messageEvent.data)
  }
})
```

## Instance Properties

### channel.port1

A MessagePortMain property.

### channel.port2

A MessagePortMain property.

## Usage with ORPC

In our ORPC setup:

```javascript
// Main process
const { MessageChannelMain } = require('electron')

// Create a pair of connected ports
const { port1: serverPort, port2: clientPort } = new MessageChannelMain()

// serverPort stays in main - connects to RPC handler
serverPort.start()
rpcHandler.upgrade(serverPort)

// clientPort is sent to renderer via webContents.postMessage
mainWindow.webContents.postMessage(IPC_CHANNELS.ORPC_READY, null, [clientPort])
```

The transferred `clientPort` becomes a standard web `MessagePort` in the renderer/preload context.
