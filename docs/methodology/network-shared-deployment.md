# Network Shared Deployment Architecture

## Overview

WEMS v2 is designed to be deployed on a shared network drive, allowing multiple users to access the same application and database simultaneously. This document describes the architectural decisions and mechanisms that enable this deployment model.

## Deployment Model

### Portable Executable

The application is built as a **portable Windows executable** (`.exe`) that does not require installation. Users can run the application directly from a shared network drive.

```
\\server\shared\wems\
├── WEMS.exe          # Main application
└── data/             # Data directory (created on first run)
    ├── database.db   # SQLite database
    ├── .write.lock   # Lock file for multi-instance coordination
    └── debug.log     # Application logs
```

### Data Directory Resolution

The data directory is resolved relative to the executable location:

```typescript
// src/core/db/index.ts
export function getDataDir(): string {
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(process.execPath);

  return path.join(baseDir, "data");
}
```

This ensures:
- All users access the same data directory
- No data is stored in user-specific profile directories
- The database stays with the application installation

## Multi-Instance Coordination

### Problem

SQLite does not support true concurrent writes from multiple processes. When multiple users run the application simultaneously, only one instance should have write access.

### Solution: File-Based Lock System

WEMS implements a custom file-based lock system with the following characteristics:

#### Lock File Structure

The lock file (`.write.lock`) contains:

```typescript
interface LockData {
  userId: string;        // Windows username
  hostname: string;      // Machine hostname
  timestamp: number;     // Lock acquisition time
  pid: number;           // Process ID
  lastHeartbeat: number; // Last activity timestamp
}
```

#### Lock Acquisition Flow

```
1. Application starts
2. Check if lock file exists
3. If lock exists:
   a. If lock is stale (>5 min), remove it and acquire
   b. If lock is fresh and belongs to us, enable write mode
   c. If lock is fresh and belongs to another user, enable read-only mode
4. If no lock exists, create lock and enable write mode
5. Start heartbeat (update every 30 seconds)
```

#### Write Mode vs Read-Only Mode

| Mode | Capabilities | Trigger Condition |
|------|--------------|-------------------|
| **Write Mode** | Full CRUD operations, migrations | No lock exists, or we own the lock |
| **Read-Only Mode** | Read-only queries, exports | Another user holds the active lock |

#### Stale Lock Detection

A lock is considered stale when:
- No heartbeat received for **5 minutes**
- The holding process is no longer running (detected via heartbeat)

This ensures locks are automatically released if a user closes the application unexpectedly or their computer crashes.

### Lock Implementation

```typescript
// src/core/lib/lock/index.ts
export const Lock = {
  acquire: (): Result<boolean, LockAlreadyExistsError | LockFileError> => {
    // Try to acquire write lock
    // Return failure if another instance holds the lock
  },

  release: (): Result<void, LockFileError> => {
    // Release write lock on application exit
  },

  isWriteMode: (): Result<boolean, LockFileError> => {
    // Check current write/read-only status
  },

  watch: (callback: (isWrite: boolean) => void, intervalMs = 2000) => {
    // Watch for lock changes and notify renderer
  },
};
```

## Database Configuration

### SQLite with WAL Mode

The database uses **WAL (Write-Ahead Logging)** mode for better concurrency:

```typescript
sqlite.pragma("journal_mode = WAL");
```

WAL mode allows:
- Concurrent reads while a write is in progress
- Better performance in multi-user scenarios
- Reduced lock contention

### Read-Only Database Access

When in read-only mode, the database is opened with:

```typescript
new Database(getDbPath(), { readonly: true });
```

This prevents any accidental writes and ensures data consistency.

## Application Flow

### Startup Sequence

```
1. Determine data directory (next to executable)
2. Try to acquire write lock
3. If lock acquired:
   - Open database in read-write mode
   - Run pending migrations (if any)
4. If lock not acquired:
   - Open database in read-only mode
   - Skip migrations
5. Initialize IPC handlers
6. Show main window with appropriate UI state
```

### Lock Status Synchronization

The renderer process subscribes to lock status changes:

```typescript
// src/renderer/src/pages/root-page.tsx
window.onLockStatusChanged?.((writeMode: boolean) => {
  setCanWrite(writeMode);
});
```

When another user acquires or releases the lock, all instances are notified and can update their UI accordingly.

### User Interface Indicators

- **Write Mode**: Full application functionality
- **Read-Only Mode**: Visual indicator showing who has write access, limited functionality for write operations

## Migrations in Multi-Instance Environment

### Challenge

When multiple instances exist, migrations should only run once from the write-enabled instance.

### Solution

Migrations are conditional:

```typescript
async function runMigrations(sqlite, canWrite: boolean): Promise<void> {
  // Only run migrations if in write mode
  if (!canWrite) {
    logToFile("Read-only mode: skipping migrations");
    return;
  }

  // Check if tables already exist
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

  if (tables.length === 0) {
    // Run migrations
    migrate(dbInstance, { migrationsFolder: migrationsPath });
  }
}
```

This ensures:
- Migrations only run once (when database is first created)
- Read-only instances don't attempt migrations
- The first user to access a new database triggers migration

## Logging

### Debug Log Location

All application logs are written to the data directory:

```typescript
const logPath = path.join(getDataDir(), "debug.log");
```

This includes:
- Database initialization messages
- Lock acquisition/release events
- Migration execution
- Error traces

### Benefits for Network Deployment

- Logs are visible to all users (same directory)
- Easier troubleshooting when multiple users experience issues

## Configuration Files

### Build Configuration (electron-builder.json)

```json
{
  "target": ["portable"],
  "extraResources": [
    {
      "from": "src/core/db/migrations",
      "to": "migrations"
    }
  ],
  "asarUnpack": ["node_modules/better-sqlite3/**"]
}
```

Key points:
- **portable target**: Creates a single executable
- **extraResources**: Includes migrations in the build
- **asarUnpack**: Unpacks native modules to avoid ASAR issues

## Limitations and Considerations

### SQLite Concurrency

- Only one writer at a time
- Multiple readers are supported but may experience contention
- Large writes may cause temporary read blocking

### Network Latency

- Lock file operations depend on network speed
- High latency may cause delayed lock detection
- Consider local caching for frequently accessed data

### File Locking on Network Shares

- Some network file systems may have issues with file locking
- Test thoroughly on the target network infrastructure
- Consider SMB caching settings on the server

### User Permissions

- All users need write access to the data directory
- This includes creating the lock file and database
- Network administrators must configure appropriate share permissions

## Best Practices

1. **Initial Setup**: First user to run the application should be available for a few minutes to complete migrations
2. **Network Speed**: Ensure adequate network bandwidth for acceptable performance
3. **Backup**: Regular backups of the database file (copy while no one is writing)
4. **Monitoring**: Check debug.log if users report issues
5. **Single Writer**: Encourage users to coordinate so only one person writes at a time for complex operations

## Future Improvements

Potential enhancements for network deployment:
- Redis-based locking for more robust coordination
- WebSocket-based real-time sync between instances
- Conflict resolution for simultaneous edits
