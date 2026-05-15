# Shared Network Drive Deployment Analysis

**Project:** WEMS v2 (Workforce/Employee Management System)
**Date:** 2026-04-20
**Type:** Architecture Analysis

---

## Executive Summary

WEMS v2 was designed with a shared network drive deployment model in mind, where a single installation on a shared folder would serve multiple users with write/read access patterns similar to Microsoft Excel (one writer, multiple readers). This report analyzes the current implementation's approach to shared deployment and identifies architectural concerns.

**Key Finding:** The current architecture relies on file-based locking mechanisms that are fundamentally unreliable on SMB/CIFS network shares. SQLite's embedded database design also conflicts with multi-user network access patterns.

---

## 1. Current Shared App Architecture

### 1.1 Lock File System

**Location:** `src/core/lib/lock/index.ts`

The app implements a custom file-based lock system using `.write.lock`:

```typescript
export interface LockData {
  userId: string;
  hostname: string;
  timestamp: number;
  pid: number;
  lastHeartbeat: number;
}
```

**Configuration:**
- Lock timeout: 5 minutes
- Heartbeat interval: 30 seconds
- Lock file location: `{dataDir}/.write.lock`

**How it works:**
1. First user creates lock file with PID, hostname, timestamp
2. Subsequent users read lock file to detect existing writer
3. Heartbeat updates `lastHeartbeat` to detect crashed writers
4. Stale locks (>5min without heartbeat) are considered expired

### 1.2 Database Access Mode

**Location:** `src/core/db/index.ts:164-167`

```typescript
const sqlite = canWrite
  ? new Database(getDbPath())
  : new Database(getDbPath(), { readonly: true });
```

- **Write mode:** Full SQLite access with WAL journal mode
- **Read mode:** SQLite opened with `readonly: true` flag (not `immutable=1`)

WAL mode is enabled by default for better concurrency, but this creates issues on network drives.

### 1.3 Portable Data Directory

**Location:** `src/core/db/index.ts:14-21`

```typescript
const baseDir = inDevelopment
  ? process.cwd()
  : path.dirname(process.execPath);  // Next to executable

return path.join(baseDir, "data");
```

The data directory is placed next to the executable, meaning:
- If app is on `\\server\share\wems\`, data goes to `\\server\share\wems\data\`
- Lock file and database both live on the network share

### 1.4 Single Instance Lock

**Location:** `src/main/index.ts:159-177`

```typescript
function setupSingleInstance(): void {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  }
  // ...
}
```

Electron's `requestSingleInstanceLock()` prevents multiple instances on the same machine, but does not coordinate across different machines on the network. The file-based lock is the cross-machine coordination mechanism.

---

## 2. Technical Issues

### 2.1 SQLite on Network Drives - Unsupported

SQLite documentation explicitly states:

> **Do not use SQLite for shared network drives.** SQLite is designed to be an embedded database that runs on the same machine as the application. Using SQLite on a network file system (NFS, SMB, etc.) is a recipe for corruption and data loss.

**Why:**
- SQLite uses advisory file locks designed for POSIX/local filesystems
- SMB/CIFS implements locking differently with client-side caching
- WAL mode's checkpoint operations require atomic file rename (not guaranteed on SMB)
- Multiple writers can corrupt the database

### 2.2 Lock File Reliability on SMB

The `.write.lock` mechanism has several vulnerabilities on SMB shares:

| Issue | Impact |
|-------|--------|
| `fs.writeFileSync` not atomic on SMB | Lock file can be partially written or corrupted |
| SMB client-side caching | Lock state may not be visible to other clients in real-time |
| No atomic "test and set" | Race condition between reading and writing lock file |
| Lock holder crash | 5-minute timeout is arbitrary; may be too short or too long |

### 2.3 WAL Mode on Network Drives

When WAL mode is enabled on a network database:

- **WAL file** (`database.db-wal`) accumulates writes
- **Checkpoint** operation needs to rename files atomically
- SMB does not guarantee atomic rename across clients
- Reader may see incomplete frames of WAL data

### 2.4 Read-Only Mode Limitation

The current implementation uses `readonly: true` flag instead of `immutable=1`:

```typescript
// Current (line 167)
: new Database(getDbPath(), { readonly: true });

// More robust for network shares would be
: new Database(`file:${getDbPath()}?mode=ro&immutable=1`, { readonly: true });
```

The `immutable` flag tells SQLite the database file never changes, allowing optimizations that avoid extra file system checks.

---

## 3. Comparison: Excel vs. WEMS

| Aspect | Excel File | WEMS App |
|--------|-----------|----------|
| **Sharing model** | File copied/downloaded per user | Single app installation, shared data |
| **Write access** | Exclusive file lock | Lock file + SQLite (unreliable on SMB) |
| **Read access** | Always available | Depends on lock file visibility |
| **Conflict handling** | User manages manually | Automatic but broken on network drives |
| **Data integrity** | Excel handles via OS file locks | SQLite corrupted by multi-user writes |

The Excel analogy breaks down because:
1. Excel locks the entire file exclusively
2. SQLite uses granular internal locking that SMB cannot properly enforce
3. Excel has 40+ years of network file handling refinement

---

## 4. Architecture Options Analysis

### Option A: Current Implementation (File Lock + SQLite)

**Pros:**
- Single installation point
- No server infrastructure required
- Simple deployment

**Cons:**
- SQLite corruption risk on network drives
- Lock file unreliable on SMB
- WAL checkpoint issues
- No true concurrent write support

**Verdict:** NOT RECOMMENDED for production

### Option B: Local Database Per User + Sync Server

```
\\server\wems\     (read-only installation)
     ↓
C:\Users\$USER\.wems\data.db  (local per user)
     ↓
Sync server (PostgreSQL or SQLite server)
```

**Pros:**
- No network SQLite issues
- Offline-capable
- True multi-user with conflict resolution

**Cons:**
- Requires sync server infrastructure
- More complex setup

**Verdict:** RECOMMENDED

### Option C: CouchDB Lite / RxDB (Embedded with Sync)

```
\\server\wems\     (read-only installation)
     ↓
C:\Users\$USER\.wems\  (local embedded DB with sync)
```

**Pros:**
- Designed for distributed systems
- Built-in conflict resolution
- Append-only storage handles SMB better

**Cons:**
- Document-based (no SQL joins)
- Learning curve

**Verdict:** RECOMMENDED for offline-first scenarios

### Option D: Terminal Server / RDP Deployment

```
\\server\app\  →  Windows Server + RDS
```

**Pros:**
- Works perfectly with SQLite (local to server)
- True multi-user
- Traditional LOB app deployment

**Cons:**
- Requires Windows Server + RDS CALs
- Infrastructure cost

**Verdict:** RECOMMENDED for enterprise environments

---

## 5. Current Implementation Weaknesses

### 5.1 Lock Acquisition Race Condition

**Code:** `src/core/lib/lock/index.ts:179-234`

```typescript
acquire: () => {
  const existingLock = readLockFile();
  // <-- Another process could acquire here
  if (existingLock && !Lock.isOurLock(existingLock)) {
    return Result.failure(new LockAlreadyExistsError(...));
  }
  // <-- Another process could write stale lock here
  writeLockFile(newLock);  // Not atomic on SMB
}
```

The read-then-write pattern is not atomic on SMB.

### 5.2 No Lock Recovery Mechanism

If the write lock holder crashes:
1. Lock file remains with old PID
2. Other clients detect stale lock after 5 minutes
3. But SMB cache may show stale lock state to other clients before timeout
4. No automatic cleanup or notification to waiting readers

### 5.3 Heartbeat on Network File

**Code:** `src/core/lib/lock/index.ts:103-116`

Heartbeat writes to lock file every 30 seconds on network drive. This creates:
- Unnecessary network traffic
- Lock file modification timestamps may not sync across clients
- Potential race conditions on SMB

### 5.4 Data Directory Co-location with App

**Code:** `src/core/db/index.ts:14-21`

Data directory next to executable means database and lock file are on the same network path as the app. If the app becomes inaccessible (network issue), data is also inaccessible.

---

## 6. Recommendations

### 6.1 Short-term (If Network SQLite Must Be Used)

1. **Add `immutable=1` for read-only connections**
   ```typescript
   // More robust read-only mode
   new Database(`file:${getDbPath()}?mode=ro&immutable=1`, { readonly: true });
   ```

2. **Increase lock timeout** to reduce heartbeat frequency (e.g., 15 minutes)

3. **Add database integrity check** on startup in read-only mode

4. **Document the limitation** - this is not a supported deployment model for production

### 6.2 Medium-term (With Infrastructure)

1. **Implement local database per user** with optional sync
   - Each user has SQLite locally at `%APPDATA%/wems/data.db`
   - Background sync to a central server
   - Conflict resolution (last-write-wins or server-side merge)

2. **Consider CouchDB Lite** or **RxDB** for embedded sync-capable storage

### 6.3 Long-term (Enterprise Deployment)

1. **Terminal Server deployment** with local SQLite on server
2. **PostgreSQL backend** with thin Electron client
3. **Supabase or similar** BaaS for data persistence

---

## 7. Files Affected by Shared App Logic

| File | Line(s) | Description |
|------|---------|-------------|
| `src/core/lib/lock/index.ts` | All | Lock file management, heartbeat, stale detection |
| `src/core/lib/lock/errors.ts` | All | Custom error types for lock failures |
| `src/core/lib/lock-events.ts` | All | Event emitter for lock state changes |
| `src/core/db/index.ts` | 14-48, 164-167 | Portable data directory, read/write mode selection |
| `src/main/index.ts` | 159-177, 187-236 | Single instance lock + lock watcher setup |
| `src/preload/index.ts` | 10-62 | Lock status callbacks bridge |
| `src/core/ipc/database/handlers.ts` | 2992 | Export directory for network shared storage |
| `src/core/lib/export-history.ts` | 20 | Portable storage comment |
| `src/core/lib/date-utils.ts` | 44 | Export directory comment |

---

## 8. Conclusion

WEMS v2's current architecture assumes reliable file system locking for multi-user coordination on a shared network drive. This assumption is fundamentally incompatible with:

1. **SQLite's design** - embedded database, not designed for network sharing
2. **SMB locking semantics** - advisory locks, client-side caching, non-atomic rename
3. **Electron's single-instance lock** - per-machine only, not cross-machine

The lock file mechanism implemented in `src/core/lib/lock/` is well-designed for local file systems but becomes unreliable on SMB shares due to:

- Non-atomic read-then-write patterns
- SMB client-side caching of lock state
- WAL checkpoint atomicity requirements
- Heartbeat overhead on network

**If shared network deployment is a hard requirement**, the recommended path forward is either:
- Local database per user with a sync server (Option B)
- Embedded sync-capable database like CouchDB Lite (Option C)
- Terminal Server deployment for true multi-user (Option D)

---

## References

- [SQLite When to Use](https://www.sqlite.org/whentouse.html) - Official guidance on network sharing
- [SQLite File Locking](https://www.sqlite.org/ltsv3html/doc/trunk/pgschemat使用.html) - WAL mode documentation
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/security) - Security best practices
- [CouchDB Lite Documentation](https://docs.couchbase.com/couchbase-lite/current/) - Sync-capable embedded DB
- [RxDB Documentation](https://rxdb.info/) - Real-time database for JavaScript

---

*Report generated as part of WEMS v2 architecture review*