import { ipcMain } from 'electron'
import { db } from './db-setup'

export function setupDatabaseIPC() {
  // Handle Drizzle query API calls
  ipcMain.handle('db:query', async (_, table: string, method: string, args: unknown[]) => {
    try {
      // @ts-expect-error - Dynamic access to Drizzle query API
      return await db.query[table][method](...args)
    } catch (error) {
      console.error(`DB Query error [${table}.${method}]:`, error)
      throw error
    }
  })

  // Handle raw SQL execution
  ipcMain.handle('db:execute', async (_, sql: string, params: unknown[] = []) => {
    try {
      return await db.execute(sql, params)
    } catch (error) {
      console.error('DB Execute error:', error)
      throw error
    }
  })

  // Handle transaction operations
  ipcMain.handle('db:transaction', async (_, operations: Array<{ table: string; method: string; args: unknown[] }>) => {
    try {
      const results = []
      for (const op of operations) {
        // @ts-expect-error - Dynamic access to Drizzle query API
        const result = await db.query[op.table][op.method](...op.args)
        results.push(result)
      }
      return results
    } catch (error) {
      console.error('DB Transaction error:', error)
      throw error
    }
  })
}
