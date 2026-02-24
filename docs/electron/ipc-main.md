# ipcMain

Communicate asynchronously from the main process to renderer processes.

**Process**: Main

The ipcMain module is an Event Emitter. When used in the main process, it handles asynchronous and synchronous messages sent from a renderer process (web page).

## Methods

### ipcMain.on(channel, listener)

- `channel` string
- `listener` Function
  - `event` IpcMainEvent
  - `...args` any[]

Listens to channel, when a new message arrives listener would be called with listener(event, args...).

### ipcMain.off(channel, listener)

- `channel` string
- `listener` Function

Removes the specified listener from the listener array for the specified channel.

### ipcMain.once(channel, listener)

- `channel` string
- `listener` Function

Adds a one time listener function for the event. This listener is invoked only the next time a message is sent to channel, after which it is removed.

### ipcMain.addListener(channel, listener)

Alias for ipcMain.on.

### ipcMain.removeListener(channel, listener)

Alias for ipcMain.off.

### ipcMain.removeAllListeners([channel])

- `channel` string (optional)

Removes all listeners from the specified channel. Removes all listeners from all channels if no channel is specified.

### ipcMain.handle(channel, listener)

- `channel` string
- `listener` Function<Promise<any> | any>
  - `event` IpcMainInvokeEvent
  - `...args` any[]

Adds a handler for an invokeable IPC. This handler will be called whenever a renderer calls `ipcRenderer.invoke(channel, ...args)`.

If listener returns a Promise, the eventual result of the promise will be returned as a reply to the remote caller. Otherwise, the return value of the listener will be used as the value of the reply.

```javascript
// Main Process
ipcMain.handle('my-invokable-ipc', async (event, ...args) => {
  const result = await somePromise(...args)
  return result
})

// Renderer Process
async () => {
  const result = await ipcRenderer.invoke('my-invokable-ipc', arg1, arg2)
  // ...
}
```

### ipcMain.handleOnce(channel, listener)

- `channel` string
- `listener` Function

Handles a single invokeable IPC message, then removes the listener.

### ipcMain.removeHandler(channel)

- `channel` string

Removes any handler for channel, if present.

## Sending Messages to Renderer

It's also possible to send messages from the main process to the renderer process using webContents.send:

```javascript
// Main - send to renderer
mainWindow.webContents.send('channel', data)

// Preload - receive via ipcRenderer
ipcRenderer.on('channel', (event, data) => { ... })
```

## Receiving Transferred MessagePorts

When receiving a MessagePort transferred from renderer via ipcRenderer.postMessage:

```javascript
// Main process
ipcMain.on('port', (event, msg) => {
  const [port] = event.ports
  // port is a MessagePortMain here
})
```
