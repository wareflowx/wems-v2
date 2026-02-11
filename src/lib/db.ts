/**
 * Database client for renderer process
 * Communicates with main process via IPC
 */

// Type-safe query builder
export const db = {
  query: {
    users: createQueryProxy('users'),
    posts: createQueryProxy('posts'),
  },
  insert: (table: string, values: any) => {
    if (!window.electronAPI?.db?.execute) {
      throw new Error('Database API not available. Make sure you are running in Electron.')
    }
    return window.electronAPI.db.query(table, 'insert', [values])
  },
  update: (table: string, values: any) => {
    if (!window.electronAPI?.db?.execute) {
      throw new Error('Database API not available. Make sure you are running in Electron.')
    }
    return window.electronAPI.db.query(table, 'update', [values])
  },
  delete: (table: string, where: any) => {
    if (!window.electronAPI?.db?.execute) {
      throw new Error('Database API not available. Make sure you are running in Electron.')
    }
    return window.electronAPI.db.query(table, 'delete', [where])
  },
  execute: (sql: string, params?: unknown[]) => {
    if (!window.electronAPI?.db?.execute) {
      throw new Error('Database API not available. Make sure you are running in Electron.')
    }
    return window.electronAPI.db.execute(sql, params)
  },
  transaction: (operations: Array<{ table: string; method: string; args: unknown[] }>) => {
    if (!window.electronAPI?.db?.transaction) {
      throw new Error('Database API not available. Make sure you are running in Electron.')
    }
    return window.electronAPI.db.transaction(operations)
  },
}

// Helper to create query proxies for each table
function createQueryProxy(table: string) {
  return new Proxy({} as any, {
    get(_target, method: string) {
      return (...args: unknown[]) => {
        if (!window.electronAPI?.db?.query) {
          throw new Error('Database API not available. Make sure you are running in Electron.')
        }
        return window.electronAPI.db.query(table, method, args)
      }
    },
  })
}
