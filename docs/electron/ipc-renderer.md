# ipcRenderer

Communicate asynchronously from a renderer process to the main process.

**Process**: Renderer

> If you want to call this API from a renderer process with context isolation enabled, place the API call in your preload script and expose it using the contextBridge API.

The ipcRenderer module is an EventEmitter. It provides a few methods so you can send synchronous and asynchronous messages from the render process (web page) to the main process. You can also receive replies from the main process.

## Methods

### ipcRenderer.on(channel, listener)

- `channel` string
- `listener` Function
  - `event` IpcRendererEvent
  - `...args` any[]

Listens to channel, when a new message arrives listener would be called with listener(event, args...).

> **Security Warning**: Do not expose the event argument to the renderer for security reasons! Wrap any callback that you receive from the renderer in another function like this: `ipcRenderer.on('my-channel', (event, ...args) => callback(...args))`.

### ipcRenderer.off(channel, listener)

- `channel` string
- `listener` Function

Removes the specified listener from the listener array for the specified channel.

### ipcRenderer.once(channel, listener)

- `channel` string
- `listener` Function

Adds a one time listener function for the event. This listener is invoked only the next time a message is sent to channel, after which it is removed.

### ipcRenderer.addListener(channel, listener)

Alias for ipcRenderer.on.

### ipcRenderer.removeListener(channel, listener)

Alias for ipcRenderer.off.

### ipcRenderer.removeAllListeners([channel])

- `channel` string (optional)

Removes all listeners from the specified channel. Removes all listeners from all channels if no channel is specified.

### ipcRenderer.send(channel, ...args)

- `channel` string
- `...args` any[]

Send an asynchronous message to the main process via channel, along with arguments. Arguments will be serialized with the Structured Clone Algorithm.

> **NOTE**: Sending non-standard JavaScript types such as DOM objects or special Electron objects will throw an exception.

The main process handles it by listening for channel with the ipcMain module.

### ipcRenderer.invoke(channel, ...args)

- `channel` string
- `...args` any[]

Returns `Promise<any>` - Resolves with the response from the main process.

Send a message to the main process via channel and expect a result asynchronously.

For example:

```javascript
// Renderer process
ipcRenderer.invoke('some-name', someArgument).then((result) => {
  // ...
})

// Main process
ipcMain.handle('some-name', async (event, someArgument) => {
  const result = await doSomeWork(someArgument)
  return result
})
```

### ipcRenderer.sendSync(channel, ...args)

- `channel` string
- `...args` any[]

Returns `any` - The value sent back by the ipcMain handler.

Send a message to the main process via channel and expect a result synchronously.

> **Warning**: Sending a synchronous message will block the whole renderer process until the reply is received, so use this method only as a last resort.

### ipcRenderer.postMessage(channel, message, [transfer])

- `channel` string
- `message` any
- `transfer` MessagePort[] (optional)

Send a message to the main process, optionally transferring ownership of zero or more MessagePort objects.

The transferred MessagePort objects will be available in the main process as MessagePortMain objects by accessing the ports property of the emitted event.

For example:

```javascript
// Renderer process
const { port1, port2 } = new MessageChannel()
ipcRenderer.postMessage('port', { message: 'hello' }, [port1])

// Main process
ipcMain.on('port', (e, msg) => {
  const [port] = e.ports
  // ...
})
```

### ipcRenderer.sendToHost(channel, ...args)

- `channel` string
- `...args` any[]

Like ipcRenderer.send but the event will be sent to the `<webview>` element in the host page instead of the main process.

## Receiving Transferred MessagePorts

When using `webContents.postMessage` in main to send a MessagePort:

```javascript
// Main process
const { port1, port2 } = new MessageChannelMain()
win.webContents.postMessage('port', { message: 'hello' }, [port1])
```

The preload can receive it via ipcRenderer.on:

```javascript
// Preload
ipcRenderer.on('port', (event, msg) => {
  const [port] = event.ports
  // port is a standard MessagePort here
})
```

The transferred port becomes a standard web MessagePort in the renderer/preload context.
