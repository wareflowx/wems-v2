# webContents

Render and control web pages.

**Process**: Main

webContents is an EventEmitter. It is responsible for rendering and controlling a web page and is a property of the BrowserWindow object.

```javascript
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ width: 800, height: 1500 })
win.loadURL('https://github.com')

const contents = win.webContents
console.log(contents)
```

## Methods

### webContents.getAllWebContents()

Returns `WebContents[]` - An array of all WebContents instances.

### webContents.getFocusedWebContents()

Returns `WebContents | null` - The web contents that is focused in this application.

### webContents.fromId(id)

- `id` Integer

Returns `WebContents | undefined` - A WebContents instance with the given ID.

### webContents.fromFrame(frame)

- `frame` WebFrameMain

Returns `WebContents` associated with the given WebFrameMain.

## Navigation Events

### Document Navigations

When a webContents navigates to another page:
- `did-start-navigation`
- `will-frame-navigate`
- `will-navigate` (only main frame)
- `will-redirect`
- `did-redirect-navigation`
- `did-frame-navigate`
- `did-navigate` (only main frame)

### In-page Navigation

- `did-start-navigation`
- `did-navigate-in-page`

## Instance Events

### Event: 'did-finish-load'

Emitted when the navigation is done.

### Event: 'did-fail-load'

Returns:
- `event` Event
- `errorCode` Integer
- `errorDescription` string
- `validatedURL` string
- `isMainFrame` boolean

### Event: 'did-start-loading'

Corresponds to when the spinner started spinning.

### Event: 'did-stop-loading'

Corresponds to when the spinner stopped spinning.

### Event: 'dom-ready'

Emitted when the document in the top-level frame is loaded.

### Event: 'will-navigate'

Returns:
- `url` string - The URL the frame is navigating to
- `isMainFrame` boolean
- `frame` WebFrameMain

Emitted when navigation starts. Calling `event.preventDefault()` will prevent the navigation.

### Event: 'did-navigate'

Returns:
- `url` string
- `httpResponseCode` Integer

Emitted when main frame navigation is done.

### Event: 'render-process-gone'

Emitted when the renderer process unexpectedly disappears.

### Event: 'unresponsive'

Emitted when the web page becomes unresponsive.

### Event: 'responsive'

Emitted when the unresponsive web page becomes responsive again.

### Event: 'devtools-opened'

Emitted when DevTools is opened.

### Event: 'devtools-closed'

Emitted when DevTools is closed.

## Instance Methods

### contents.loadURL(url[, options])

- `url` string
- `options` Object
  - `httpReferrer` string
  - `userAgent` string
  - `extraHeaders` string
  - `postData` Array

Returns `Promise<void>`

Loads the url in the window.

### contents.loadFile(filePath[, options])

- `filePath` string
- `options` Object
  - `query` Record<string, string>
  - `search` string
  - `hash` string

Returns `Promise<void>`

Loads the given file in the window.

### contents.getURL()

Returns `string` - The URL of the current web page.

### contents.getTitle()

Returns `string` - The title of the current web page.

### contents.isDestroyed()

Returns `boolean` - Whether the web page is destroyed.

### contents.close()

Closes the page.

### contents.focus()

Focuses the web page.

### contents.isLoading()

Returns `boolean` - Whether web page is still loading.

### contents.stop()

Stops any pending navigation.

### contents.reload()

Reloads the current web page.

### contents.reloadIgnoringCache()

Reloads current page and ignores cache.

### contents.isCrashed()

Returns `boolean` - Whether the renderer process has crashed.

### contents.forcefullyCrashRenderer()

Forcefully terminates the renderer process.

### contents.setUserAgent(userAgent)

- `userAgent` string

Overrides the user agent for this web page.

### contents.getUserAgent()

Returns `string` - The user agent for this web page.

### contents.insertCSS(css[, options])

- `css` string
- `options` Object
  - `cssOrigin` string - 'user' or 'author'

Returns `Promise<string>` - A key for the inserted CSS.

### contents.executeJavaScript(code[, userGesture])

- `code` string
- `userGesture` boolean (optional)

Returns `Promise<any>` - Resolves with the result of the executed code.

### contents.setAudioMuted(muted)

- `muted` boolean

Mute the audio on the current web page.

### contents.isAudioMuted()

Returns `boolean` - Whether this page has been muted.

### contents.setZoomFactor(factor)

- `factor` Double - Zoom factor (1.0 = 100%)

### contents.getZoomFactor()

Returns `number` - The current zoom factor.

### contents.setZoomLevel(level)

- `level` number

### contents.getZoomLevel()

Returns `number` - The current zoom level.

### contents.print([options], [callback])

Prints window's web page.

### contents.printToPDF(options)

Prints the window's web page as PDF.

### contents.send(channel, ...args)

- `channel` string
- `...args` any[]

Send an asynchronous message to the renderer process.

### contents.openDevTools([options])

Opens the DevTools.

### contents.closeDevTools()

Closes the DevTools view.

### contents.isDevToolsOpened()

Returns `boolean` - Whether DevTools is opened.

### contents.toggleDevTools()

Toggles the developer tools.

### contents.inspectElement(x, y)

- `x` Integer
- `y` Integer

Starts inspecting element at position.

## Important: webContents.postMessage

This is the key method for our ORPC setup:

```javascript
// Main process
const { port1, port2 } = new MessageChannelMain()
win.webContents.postMessage('port', { message: 'hello' }, [port1])
```

Sends a message to the renderer process, optionally transferring ownership of zero or more MessagePortMain objects.

- `channel` string
- `message` any
- `transfer` MessagePortMain[] (optional)

The transferred MessagePortMain objects become native DOM MessagePort objects in the renderer.

## Instance Properties

### contents.id (Readonly)

A Integer representing the unique ID of this WebContents.

### contents.session (Readonly)

A Session used by this webContents.

### contents.audioMuted

A boolean property that determines whether this page is muted.

### contents.userAgent

A string property that determines the user agent for this web page.

### contents.zoomLevel

A number property that determines the zoom level.

### contents.zoomFactor

A number property that determines the zoom factor.
