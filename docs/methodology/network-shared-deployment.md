# Network Shared Deployment Architecture

## Overview

WEMS v2 is designed to be deployed in a shared network environment where the application is installed locally on each workstation, while the data (database, logs) is stored on a shared network drive. This document describes the architectural decisions and mechanisms that enable this deployment model.

## Deployment Model

### Architecture

```
\\server\shared\
├── wems-data/              # Shared data directory
│   ├── database.db        # SQLite database
│   ├── .write.lock        # Lock file for multi-instance coordination
│   └── debug.log          # Application logs
│
C:\Program Files\WEMS\     # Local installation (per workstation)
└── WEMS.exe               # Application installed locally
```

### Why Local Installation?

Running the application from a shared network drive (portable executable) causes performance issues due to:
- Network latency on every file access
- Slow application startup
- Poor reactivity during database operations

By installing the application locally on each workstation, users get:
- Fast application startup
- Responsive database operations
- Better overall user experience

While still sharing:
- Single source of truth (database on network)
- Centralized data and backups

## Data Directory Resolution

### Current Implementation

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

### Required Change

The data directory should be configurable to point to a network share:

```typescript
export function getDataDir(): string {
  // Option 1: Network share path (configurable)
  const networkPath = process.env.WEMS_DATA_PATH;
  if (networkPath) {
    return networkPath;
  }

  // Option 2: Default to local data directory
  const baseDir = inDevelopment
    ? process.cwd()
    : path.dirname(process.execPath);

  return path.join(baseDir, "data");
}
```

Configuration methods:
1. **Environment variable**: `WEMS_DATA_PATH=\\server\shared\wems-data`
2. **Configuration file**: `config.json` in the data directory
3. **First-run wizard**: Prompt user to select data location

## First-Run Setup

### Welcome Dialog

On first launch, show a dialog asking the user to configure the data location:

```
┌─────────────────────────────────────────┐
│  Welcome to WEMS                        │
│                                         │
│  Select data location:                  │
│  ┌─────────────────────────────────┐   │
│  │ \\server\shared\wems-data     │   │
│  └─────────────────────────────────┘   │
│  [ ] Use default (local)                │
│                                         │
│  [Cancel]                     [Continue]│
└─────────────────────────────────────────┘
```

This ensures:
- First user creates the data directory
- Subsequent users connect to existing data
- No manual configuration required

## Multi-Instance Coordination

### Problem

SQLite does not support true concurrent writes from multiple processes. When multiple users run the application simultaneously, only one instance should have write access.

### Solution: File-Based Lock System

WEMS implements a custom file-based lock system with the following characteristics:

#### Lock File Structure

The lock file (`.write.lock`) is stored in the shared data directory:

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
2. Connect to shared data directory
3. Check if lock file exists in shared data
4. If lock exists:
   a. If lock is stale (>5 min), remove it and acquire
   b. If lock is fresh and belongs to us, enable write mode
   c. If lock is fresh and belongs to another user, enable read-only mode
5. If no lock exists, create lock and enable write mode
6. Start heartbeat (update every 30 seconds)
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
    // Try to acquire write lock in shared data directory
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
1. Load configuration (data path from env/config)
2. Connect to shared data directory
3. Try to acquire write lock
4. If lock acquired:
   - Open database in read-write mode
   - Run pending migrations (if any)
5. If lock not acquired:
   - Open database in read-only mode
   - Skip migrations
6. Initialize IPC handlers
7. Show main window with appropriate UI state
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

### User Notification

When another user has write access, show a clear message:

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Read-Only Mode                                     │
│                                                         │
│  User: john.doe                                         │
│  Computer: WORKSTATION-01                               │
│                                                         │
│  You can view data but cannot make changes.             │
│  Waiting for write access...                            │
│                                                         │
│                              [Switch to Read-Only View] │
└─────────────────────────────────────────────────────────┘
```

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

All application logs are written to the shared data directory:

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

## Build Configuration

### NSIS Installer (Instead of Portable)

```json
// electron-builder.json
{
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": false,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

Key points:
- **NSIS target**: Creates a standard Windows installer
- **User-level installation**: No admin rights required
- **Customizable install directory**: Users can choose where to install

## Configuration Management

### Environment Variable

Set the data path via environment variable:

```batch
:: Batch script to launch WEMS
set WEMS_DATA_PATH=\\server\shared\wems-data
"C:\Program Files\WEMS\WEMS.exe"
```

### Configuration File

Store in user's app data directory:

```json
// %APPDATA%\wems\config.json
{
  "dataPath": "\\\\server\\shared\\wems-data"
}
```

### First-Run Wizard

On first launch, prompt user to:
1. Select data location (default: next to executable for backward compatibility)
2. Test connection to shared path
3. Create data directory if needed

## Limitations and Considerations

### SQLite Concurrency

- Only one writer at a time
- Multiple readers are supported but may experience contention
- Large writes may cause temporary read blocking

### Network Latency

- Lock file operations depend on network speed
- High latency may cause delayed lock detection
- Consider local caching for frequently accessed data

### User Permissions

- All users need write access to the shared data directory
- This includes creating the lock file and database
- Network administrators must configure appropriate share permissions

### Backup Strategy

Since the database is on a network share:
- Schedule backups during off-peak hours
- Ensure no users are writing during backup
- Consider using SQLITE backup API for consistent backups

## Best Practices

1. **Initial Setup**: First user to run the application should be available for a few minutes to complete migrations
2. **Network Speed**: Ensure adequate network bandwidth (minimum 100Mbps recommended)
3. **Backup**: Regular backups of the database file (copy while no one is writing)
4. **Monitoring**: Check debug.log if users report issues
5. **Single Writer**: Encourage users to coordinate so only one person writes at a time for complex operations
6. **Firewall**: Ensure Windows Firewall allows the application through for network share access

## Migration from Portable Version

If migrating from the portable version:

1. **Backup existing data**: Copy the `data/` folder from the portable version to the new shared location
2. **Update configuration**: Set the `WEMS_DATA_PATH` environment variable or use the first-run wizard
3. **Install locally**: Deploy the NSIS installer to all workstations
4. **Test**: Verify write access and data synchronization

## Future Improvements

Potential enhancements for network deployment:
- Configuration UI in settings page to change data path
- Connection status indicator (online/offline to shared drive)
- Conflict resolution UI for simultaneous edits
- Activity log showing recent changes by all users
