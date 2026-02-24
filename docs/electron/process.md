# process

Extensions to process object.

**Process**: Main, Renderer

Electron's process object is extended from the Node.js process object. It adds the following events, properties, and methods.

## Sandbox

In sandboxed renderers the process object contains only a subset of the APIs:
- crash()
- hang()
- getCreationTime()
- getHeapStatistics()
- getBlinkMemoryInfo()
- getProcessMemoryInfo()
- getSystemMemoryInfo()
- getSystemVersion()
- getCPUUsage()
- uptime()
- argv
- execPath
- env
- pid
- arch
- platform
- sandboxed
- contextIsolated
- type
- version
- versions
- mas
- windowsStore
- contextId

## Events

### Event: 'loaded'

Emitted when Electron has loaded its internal initialization script and is beginning to load the web page or the main script.

## Properties

### process.defaultApp (Readonly)

A boolean. When the app is started by being passed as parameter to the default Electron executable, this property is true in the main process, otherwise it is undefined.

### process.isMainFrame (Readonly)

A boolean, true when the current renderer context is the "main" renderer frame.

### process.mas (Readonly)

A boolean. For Mac App Store build, this property is true, for other builds it is undefined.

### process.noAsar

A boolean that controls ASAR support inside your application. Setting this to true will disable the support for asar archives in Node's built-in modules.

### process.resourcesPath (Readonly)

A string representing the path to the resources directory.

### process.sandboxed (Readonly)

A boolean. When the renderer process is sandboxed, this property is true, otherwise it is undefined.

### process.contextIsolated (Readonly)

A boolean that indicates whether the current renderer context has contextIsolation enabled. It is undefined in the main process.

### process.type (Readonly)

A string representing the current process's type:
- `browser` - The main process
- `renderer` - A renderer process
- `service-worker` - In a service worker
- `worker` - In a web worker
- `utility` - In a node process launched as a service

### process.versions.chrome (Readonly)

A string representing Chrome's version string.

### process.versions.electron (Readonly)

A string representing Electron's version string.

### process.windowsStore (Readonly)

A boolean. If the app is running as an MSIX package, this property is true, otherwise it is undefined.

## Methods

### process.crash()

Causes the main thread of the current process crash.

### process.getCreationTime()

Returns `number | null` - The number of milliseconds since epoch, or null if the information is unavailable.

### process.getCPUUsage()

Returns CPUUsage

### process.getHeapStatistics()

Returns Object:
- `totalHeapSize` Integer
- `totalHeapSizeExecutable` Integer
- `totalPhysicalSize` Integer
- `totalAvailableSize` Integer
- `usedHeapSize` Integer
- `heapSizeLimit` Integer
- `mallocedMemory` Integer
- `peakMallocedMemory` Integer
- `doesZapGarbage` boolean

Returns an object with V8 heap statistics. Note that all statistics are reported in Kilobytes.

### process.getBlinkMemoryInfo()

Returns Object:
- `allocated` Integer - Size of all allocated objects in Kilobytes.
- `total` Integer - Total allocated space in Kilobytes.

### process.getProcessMemoryInfo()

Returns `Promise<ProcessMemoryInfo>` - Resolves with memory usage statistics.

### process.getSystemMemoryInfo()

Returns Object:
- `total` Integer - The total amount of physical memory in Kilobytes.
- `free` Integer - The total amount of memory not being used.
- `swapTotal` Integer (Windows/Linux) - The total amount of swap memory.
- `swapFree` Integer (Windows/Linux) - The free amount of swap memory.

### process.getSystemVersion()

Returns string - The version of the host operating system.

### process.takeHeapSnapshot(filePath)

- `filePath` string - Path to the output file.

Returns boolean - Indicates whether the snapshot has been created successfully.

### process.hang()

Causes the main thread of the current process hang.

### process.setFdLimit(maxDescriptors)

- `maxDescriptors` Integer

Sets the file descriptor soft limit.
