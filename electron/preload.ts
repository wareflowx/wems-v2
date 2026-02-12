import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC communication methods
  sendMessage: (channel: string, data: unknown) => {
    const validChannels = ['example-channel']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['example-channel']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      const subscription = (_event: unknown, ...args: unknown[]) => callback(...args)
      ipcRenderer.on(channel, subscription)

      // Return unsubscribe function
      return () => ipcRenderer.removeListener(channel, subscription as any)
    }
    return () => {}
  },
  invoke: async (channel: string, ...args: unknown[]) => {
    const validChannels = ['example-channel']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    throw new Error(`Invalid channel: ${channel}`)
  },

  // Database API
  db: {
    query: (table: string, method: string, args: unknown[]) =>
      ipcRenderer.invoke('db:query', table, method, args),
    execute: (sql: string, params?: unknown[]) =>
      ipcRenderer.invoke('db:execute', sql, params),
    transaction: (operations: Array<{ table: string; method: string; args: unknown[] }>) =>
      ipcRenderer.invoke('db:transaction', operations),
  },

  // Window API
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    unmaximize: () => ipcRenderer.send('window-unmaximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  },
})

// Type declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (channel: string, data: unknown) => void
      on: (channel: string, callback: (...args: unknown[]) => void) => (() => void) | undefined
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      db: {
        query: (table: string, method: string, args: unknown[]) => Promise<unknown>
        execute: (sql: string, params?: unknown[]) => Promise<unknown>
        transaction: (operations: Array<{ table: string; method: string; args: unknown[] }>) => Promise<unknown[]>
      }
      window: {
        minimize: () => void
        maximize: () => void
        unmaximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
      }
    }
  }
}
