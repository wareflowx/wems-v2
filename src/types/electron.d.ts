/**
 * Electron API type definitions
 */

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
    }
  }
}

export {}
