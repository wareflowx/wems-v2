# Local Installation with Portable Data

## Overview

WEMS uses a **local installation with portable data** model. The application is installed on each workstation, but all data (database, logs) is stored directly next to the executable, not in the user's AppData folder.

## Why This Approach?

- **No Admin Required**: User-level installation doesn't require administrator privileges
- **Portable Data**: All data stays with the application installation
- **Easy Backup**: Simply copy the installation folder to backup or migrate
- **Transparency**: Users know exactly where their data is

## Architecture

```
C:\Program Files\WEMS\           # Or user's chosen location
├── WEMS.exe                     # Application
├── resources/                   # Bundled resources (migrations, etc.)
└── data/                        # Data directory (created on first run)
    ├── database.db             # SQLite database
    ├── .write.lock             # Lock file for multi-instance coordination
    └── debug.log               # Application logs
```

## Data Directory Resolution

The data directory is resolved relative to the executable:

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
- Data stays with the application installation
- No data stored in user profile directories
- Easy to find and backup

## Build Configuration

### NSIS Installer

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
- **User-level installation**: No admin rights required
- **Customizable directory**: Users choose where to install
- **Desktop/Start Menu shortcuts**: Quick access

## Multi-Instance Coordination

### File-Based Lock System

When multiple instances run on the same machine (or network share), only one can write:

```typescript
interface LockData {
  userId: string;
  hostname: string;
  timestamp: number;
  pid: number;
  lastHeartbeat: number;
}
```

### Lock Behavior

| Condition | Mode |
|-----------|------|
| No lock exists | Write mode |
| We own the lock | Write mode |
| Another instance holds fresh lock | Read-only mode |
| Lock is stale (>5 min) | Write mode (takes over) |

### Read-Only Mode

When another instance has write access:
- Database opened with `{ readonly: true }`
- UI shows indicator of who has write access
- Write operations are blocked

## Database

### SQLite with WAL Mode

```typescript
sqlite.pragma("journal_mode = WAL");
```

WAL mode enables better concurrency for multiple readers.

### Migrations

Migrations run automatically on first launch when database is empty. Only the first instance to start performs migration.

## Logging

All logs go to the data directory:

```typescript
const logPath = path.join(getDataDir(), "debug.log");
```

This includes database initialization, lock events, and errors.

## Backup and Migration

To backup or migrate:
1. Stop the application
2. Copy the entire installation folder
3. Restore to new location
4. Run the application from the new location

All data moves with the application automatically.
