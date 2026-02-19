# Issue: Database Path Configuration for Network Shared Installation

## Problem Description

The application is intended to be installed on a shared network drive, allowing multiple users to access the same database. However, the current implementation has several issues that prevent this use case from working correctly.

### Current Issues

1. **Database Path Resolution**
   - In `src/db/index.ts`, the database path is calculated using `process.cwd()`
   - This returns the current working directory where the executable is launched, not the installation directory
   - On a shared network, different users may have different working directories

2. **Logs Location**
   - In `src/main.ts`, logs are written to `app.getPath('userData')` which points to `%APPDATA%` (user profile directory)
   - This creates logs in each user's local profile, not in the shared installation folder

3. **No User-selectable Database Location**
   - The NSIS installer already allows choosing the installation directory
   - But the application does not use this chosen path for storing data
   - Users cannot select where the database file should be stored

## Expected Behavior

- The database file should be stored in a `data/` folder relative to the executable location
- Logs should be stored in the same location as the executable or in the data folder
- All data should remain accessible when the application is installed on a network share

## Technical Analysis

### Current Configuration (electron-builder.json)

The NSIS configuration already supports custom installation directory:

```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "perMachine": false
}
```

### Database Path Logic (src/db/index.ts)

Current implementation:

```typescript
function getDbPath() {
  const dbFileName = process.env.DB_FILE_NAME || 'database.db';
  return path.join(process.cwd(), filePath);
}
```

### Recommended Solution

The database path should be calculated relative to the executable's location:

```typescript
path.join(path.dirname(app.getPath('exe')), 'data', 'database.db')
```

This ensures:
- The database stays with the application installation
- All users on the network share access the same database
- No data is stored in user-specific profile directories

## Files to Modify

1. `src/db/index.ts` - Update `getDbPath()` to use executable directory
2. `src/main.ts` - Update log path to use executable directory
3. Consider adding a configuration option for advanced users to customize the data directory

## Related Configuration

- `.env` file contains `DB_FILE_NAME=file:database.db` which should continue to work with the new path resolution
