// Electron API for renderer process
export const electron = {
  isElectron: (): boolean => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined
  },

  window: {
    minimize: () => {
      if (electron.isElectron()) {
        window.electronAPI.window.minimize()
      }
    },
    maximize: () => {
      if (electron.isElectron()) {
        window.electronAPI.window.maximize()
      }
    },
    unmaximize: () => {
      if (electron.isElectron()) {
        window.electronAPI.window.unmaximize()
      }
    },
    close: () => {
      if (electron.isElectron()) {
        window.electronAPI.window.close()
      }
    },
    isMaximized: (): Promise<boolean> => {
      if (electron.isElectron()) {
        return window.electronAPI.window.isMaximized()
      }
      return Promise.resolve(false)
    }
  }
}

declare global {
  interface Window {
    electronAPI?: {
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
