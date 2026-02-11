/**
 * Utility functions for Electron integration
 */

/**
 * Detects if the app is running in Electron
 */
export const isElectron = (): boolean => {
  return !!(window && window.process && window.process.type === 'renderer')
}

/**
 * Check if Electron APIs are available
 */
export const isElectronAPIAvailable = (): boolean => {
  return typeof window.electronAPI !== 'undefined'
}

/**
 * Get Electron version if running in Electron
 */
export const getElectronVersion = (): string | null => {
  if (!isElectron()) return null
  return (window.process as any).versions?.electron || null
}

/**
 * Get platform information
 */
export const getPlatform = (): string => {
  if (!isElectron()) return navigator.platform
  return (window.process as any).platform || navigator.platform
}
