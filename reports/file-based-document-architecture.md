# File-Based Document Architecture Analysis: WEMS v2

**Project:** WEMS v2 (Workforce/Employee Management System)
**Date:** 2026-04-20
**Type:** Architecture Analysis
**Status:** Final Recommendation

---

## Executive Summary

WEMS is evolving from a shared database application to a **document-based application** — like Microsoft Word, Excel, or Notion. The `.wems` file IS the database: you double-click to open it, you work on it, you save it. That's the whole model.

**The network sharing aspect is a deployment detail, not the core architecture.** An user can use WEMS entirely locally on their C:\ drive with zero knowledge of network shares. The system works the same way. Sharing on a network drive is optional — an extra capability, not a requirement.

**Key characteristics:**
- WEMS stores all data in `.wems` files (SQLite databases)
- Each user installs WEMS locally (like Word/Excel)
- Open documents by double-clicking `.wems` files in Explorer
- If a document is open by another user, you get read-only access
- Standard file operations: Open, New, Save As, etc.
- Target users: 5-10 people max per document

**Architecture simplification from first draft:**
The initial report proposed a ZIP container. After reconsideration, **no ZIP wrapper is needed** — the `.wems` file IS the SQLite database directly.

---

## 1. Core Concept: Document-Based Application

### 1.1 The Mental Model

```
WEMS = Excel/Word/Notion
.wems file = Document = Database
```

Just as Excel stores spreadsheets in `.xlsx` files, WEMS stores HR data in `.wems` files. You double-click to open, you Ctrl+S to save, you Save As to copy to another location.

**This is the primary use case.** The fact that `.wems` files can be stored on a network share to be shared between users is a feature built on top of this model — not the model itself.

### 1.2 Deployment Flexibility

A `.wems` file can be stored anywhere:

```
Local usage:
    C:\HR\payroll.wems

Shared usage (optional):
    \\server\share\HR\payroll.wems
```

**The technical implementation is identical for both.** The only difference is the path format (C:\ vs \\server\share\). Lock file handling, temp extraction, save mechanism — all the same.

For the user, sharing is transparent:
- "Open the payroll file from the server" vs "Open the payroll file from my C:\ drive"
- The lock indicator shows who's editing
- The save goes to wherever the file is stored

### 1.3 File Structure

```
payroll.wems                    ← SQLite database (WAL disabled)
    ├── Schema: employees, schedules, settings, etc.
    ├── Data: all HR data
    └── Attachments: stored as BLOBs in tables

payroll.wems.lock               ← Shadow lockfile (only when shared)
    ├── { owner: "alice", machine: "ALICE-PC", acquired: "...", expires: "..." }
    └── Created with O_EXCL (atomic on any filesystem, local or network)
```

**The `.lock` file is optional.** On a purely local file, no lock file is created. On a shared network file, the lock file enables multi-user coordination.

---

## 2. User Experience Flow

### 2.1 Opening a Document (Writer)

```
User double-clicks C:\HR\payroll.wems
    ↓
Windows launches WEMS with file path as argument
    ↓
App checks for payroll.wems.lock (if file is on a share)
    ├── Lock exists + fresh → "Locked by someone else. Open Read-Only?"
    └── Lock doesn't exist or stale → acquire lock, extract to temp, open as writer
    ↓
Copy payroll.wems → %TEMP%\wems-[uuid]\payroll.wems
Create payroll.wems.lock (on network shares only)
    ↓
App works on local temp copy (fast, no network latency per query)
    ↓
On save: copy temp → original location, update lock timestamp
    ↓
On close: save, release lock (delete .lock file), cleanup temp
```

### 2.2 Opening a Document (Reader)

```
User double-clicks \\server\share\HR\payroll.wems
    ↓
Windows launches WEMS with file path as argument
    ↓
App checks for payroll.wems.lock
    ├── Lock exists → "Alice has this open. Opening Read-Only."
    └── No lock → open as writer
    ↓
Copy payroll.wems → %TEMP%\wems-[uuid]\payroll.wems
No lock file created (readers don't lock)
    ↓
Start polling: every 15s check mtime of original file
    ↓
On mtime change: show toast "Document updated by Alice. Click to reload."
```

### 2.3 Local-Only Usage (No Sharing)

For users who don't share files at all:

```
User double-clicks C:\Users\alice\Documents\company.wems
    ↓
App opens file, no lock file created (single user)
    ↓
Works on local temp copy
    ↓
Saves to original location
    ↓
Done — no network awareness needed
```

The entire lock/polling mechanism is a no-op for purely local usage.

---

## 3. Locking Mechanism

### 3.1 Shadow Lockfile Pattern

When a writer opens a document:
1. App tries to create `document.wems.lock` with `O_EXCL` flag
2. If file already exists → lock held by another user
3. If creation succeeds → lock acquired

The `O_EXCL`/`CREATE_NEW` file creation is **atomic at the filesystem namespace level** — works identically on local NTFS and SMB shares. This is the same mechanism Word/Excel use for their `~$` files.

### 3.2 Lock File Contents

```json
{
  "version": 1,
  "owner": "alice",
  "machine": "ALICE-PC",
  "pid": 12345,
  "acquired": "2026-04-20T10:30:00.000Z",
  "expires": "2026-04-20T10:30:30.000Z",
  "appVersion": "2.3.0"
}
```

### 3.3 Lock Lifecycle

| Event | Action |
|-------|--------|
| Open for write | Create lock file with `acquired` = now, `expires` = now + 30s |
| Every 15s (heartbeat) | Update `expires` = now + 30s |
| Save | Copy temp to original location, update lock timestamp |
| Close | Delete lock file |
| App crash | Lock expires after 60s (no heartbeat refresh) |

### 3.4 Stale Lock Handling

If Alice's app crashes:
- No more heartbeats
- `expires` becomes stale after 60s
- When Bob tries to open:
  1. Lock file exists but `expires` is old
  2. Bob's app detects stale lock and shows warning dialog
  3. Bob can force-unlock (with warning about potential data loss)

**Force-Unlock Warning Dialog:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Stale Lock Detected                                    │
│                                                              │
│  The lock file indicates "Alice" may have crashed.          │
│                                                              │
│  WARNING: If Alice is still online but experiencing         │
│  network issues, force-unlocking may cause her to lose      │
│  unsaved changes.                                           │
│                                                              │
│  Lock info: Alice@ALICE-PC, last heartbeat 3 minutes ago    │
│                                                              │
│  [Cancel]                    [Force Unlock]                 │
└─────────────────────────────────────────────────────────────┘
```

This prevents accidental data loss when a writer's app freezes but isn't actually crashed.

### 3.5 Recommended Library: `proper-lockfile`

```javascript
import properLockfile from 'proper-lockfile';

const release = await properLockfile.lock(filePath, {
  stale: 60000,           // Lock is stale after 60s
  updateAge: 30000,        // Update lock mtime every 30s
  retries: {
    retries: 10,
    minTimeout: 100,
    maxTimeout: 1000
  }
});

// ... do work ...
await release(); // releases lock
```

**Why `proper-lockfile`:**
- Uses `O_EXCL` (atomic create) — works on local and SMB
- Implements stale lock detection automatically
- Handles race conditions (retries on failure)
- Battle-tested (used by npm, yarn, etc.)

---

## 4. Session Model

### 4.1 Local Temp Extraction

Every document open extracts to a unique temp directory:

```typescript
const sessionId = crypto.randomUUID();
const tempDir = path.join(os.tmpdir(), `wems-${sessionId}`);
const tempDbPath = path.join(tempDir, 'payroll.wems');

// Copy from original location to temp
fs.copyFileSync(originalPath, tempDbPath);

// Work with temp DB (fast, no I/O latency)
const db = new Database(tempDbPath);
```

This ensures:
- **No I/O contention** — all queries are local
- **Isolated sessions** — each user works on their own temp copy
- **Crash safety** — temp dir cleanup on app exit

### 4.2 Save Mechanism (Atomic)

```typescript
async function save() {
  // 1. Ensure we still have the lock
  // 2. Close and reopen our temp DB to ensure all writes flushed
  tempDb.close();

  // 3. Copy to .tmp first (atomic write safety)
  //    If network dies mid-copy, original file is untouched
  const tmpPath = originalPath + '.tmp';
  fs.copyFileSync(tempDbPath, tmpPath);

  // 4. Atomic rename (MoveFileEx on Windows)
  //    Either succeeds completely or fails — never leaves file at 0 bytes
  fs.renameSync(tmpPath, originalPath);

  // 5. Update lock timestamp (keep our lock alive)
  updateLockHeartbeat();
}
```

**Why `.tmp` → rename instead of direct overwrite:**
- On SMB/NFS, `rename()` is atomic (either source exists or dest exists, never partial)
- If disk fills or network drops during copy, `payroll.wems` is still intact
- After rename, server-side atomically swaps old → new

### 4.3 Auto-Save

- Explicit save on Ctrl+S
- Auto-save every 2 minutes if changes exist
- On window close without saving: prompt to save

### 4.4 Reader Polling (Network Shares Only)

```typescript
let lastMtime = fs.stat(originalPath).mtime;

setInterval(() => {
  const stats = fs.stat(originalPath);
  if (stats.mtime > lastMtime) {
    lastMtime = stats.mtime;
    showToast("Document updated. Click to reload.");
  }
}, 15000); // Poll every 15 seconds
```

**For local files:** No polling needed — there are no other users to sync with.

### 4.5 Large File Handling (500MB+)

As `.wems` files grow (many BLOB attachments like employee photos, contracts PDFs), full-file copy on every save becomes slow over network:

- **500MB file over 100Mbps LAN:** ~40 seconds per save
- **500MB file over Wi-Fi:** potentially minutes

**Mitigation strategy:**
1. **BLOB externalization:** Move large attachments (photos, documents) to a sidecar folder:
   ```
   C:\HR\
   ├── payroll.wems          (SQLite, ~50MB - fast to copy)
   └── payroll_attachments\  (BLOBs stored as files, not in DB)
       ├── emp_001_photo.webp
       ├── emp_002_contract.pdf
       └── ...
   ```
2. **Background upload:** On save, copy SQLite immediately, then upload large BLOBs in background thread. Show progress indicator.

3. **Delta sync (future):** Track which SQLite pages changed, copy only delta. More complex but eliminates full-file copy.

4. **Threshold monitoring:** Track file size in recent files history. If a document exceeds 100MB, prompt user: "This document is large. Consider moving attachments to external storage for faster saves."

---

## 5. File Operations

### 5.1 File Menu Structure

```
File
├── New              → Create new .wems document
├── Open...          → Open file dialog (filter: *.wems)
├── Open Recent      → Submenu with recent files
├── ─────────────────
├── Save              → Save (Ctrl+S)
├── Save As...        → Save to different location
├── ─────────────────
├── Close             → Close current document
└── Exit              → Exit app (prompt to save unsaved)
```

### 5.2 Create New Document

```
User clicks File → New
    ↓
"Create New Document" dialog:
    - Document name: [text input]
    - Location: [folder picker, default to last used]
    ↓
Create empty .wems file (SQLite with schema initialized)
Create .wems.lock if on network share (acquired by creator)
    ↓
Open in writer mode
```

### 5.3 Open File Dialog

Standard Windows Open File dialog:
- Filter: `*.wems`
- Default to last opened directory (stored in local app settings)

### 5.4 Save As

```
User clicks File → Save As
    ↓
"Save As" dialog (standard Windows)
    ↓
Copy current temp DB to new location
If new location has existing .wems → acquire lock if available
    ↓
Close current document, open new one
```

### 5.5 Recent Files

Local app settings store recent files list:
```json
{
  "recentFiles": [
    { "path": "C:\\Users\\alice\\Documents\\company.wems", "lastOpened": "2026-04-20T10:30:00Z" },
    { "path": "\\\\server\\share\\HR\\payroll.wems", "lastOpened": "2026-04-19T08:15:00Z" }
  ]
}
```

**Note:** Local and network paths coexist in the same list.

---

## 6. UI Indicators

### 6.1 Title Bar

```
payroll.wems [Editing]                        ← Writer mode
payroll.wems [Read-Only — Alice is editing]  ← Reader mode (network share only)
```

### 6.2 Status Bar

```
[Write Mode] or [Read-Only — Locked by Alice] (network share only)
Last saved: 10:45 AM
```

### 6.3 Read-Only Banner

When in read-only mode (another user has it open on the network):
```
📖 Read-Only — "Alice" has this document open for editing
[Wait for Access]  [Open Copy]
```

### 6.4 Lock Conflict Dialog

When trying to open an already-locked file:
```
┌─────────────────────────────────────────────────┐
│  Document Already Open                          │
│                                                 │
│  "payroll.wems" is currently open by:           │
│                                                 │
│  👤 Alice (ALICE-PC)                            │
│  ⏰ Opened at 10:30 AM                           │
│                                                 │
│  [Open as Read-Only]  [Wait for Access]  [Cancel]  │
└─────────────────────────────────────────────────┘
```

---

## 7. Technical Implementation

### 7.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEMS on Alice's Machine                      │
│                                                                  │
│  C:\Users\alice\AppData\Local\wems\wems.exe                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  WEMS (Electron Renderer)                               │   │
│  │  ├── React UI (TanStack Query)                          │   │
│  │  └── Shows: "Editing payroll.wems"                      │   │
│  └──────────────────────┬────────────────────────────────────┘   │
│                         │ IPC                                     │
│  ┌──────────────────────▼────────────────────────────────────┐   │
│  │  WEMS (Electron Main)                                    │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              DocumentService                       │   │   │
│  │  │  open(path) → extract to temp, acquire lock       │   │   │
│  │  │  save()     → copy temp to original location      │   │   │
│  │  │  close()    → release lock, cleanup temp          │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │              LockManager                            │   │   │
│  │  │  Uses: proper-lockfile                              │   │   │
│  │  │  Creates: document.wems.lock (if on network)        │   │   │
│  │  │  Heartbeat: updates every 30s                      │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │          DatabaseService (existing)                 │   │   │
│  │  │  Uses: better-sqlite3                               │   │   │
│  │  │  Path: %TEMP%\wems-[uuid]\payroll.wems            │   │   │
│  │  │  (All existing Drizzle queries unchanged)          │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                     │                                    │
                     ▼                                    ▼
            Local file system                    Network share (SMB)
            C:\HR\payroll.wems                   \\server\HR\payroll.wems

         (Same technical flow — just a different path format)
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEMS on Bob's Machine                        │
│                                                                  │
│  C:\Users\bob\AppData\Local\wems\wems.exe                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  WEMS (Electron Renderer)                               │   │
│  │  ├── React UI (TanStack Query)                          │   │
│  │  └── Shows: "payroll.wems [Read-Only — Alice editing]"  │   │
│  └──────────────────────┬────────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼────────────────────────────────────┐   │
│  │  WEMS (Electron Main)                                    │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              DocumentService                       │   │   │
│  │  │  open(path) → extract to temp, NO lock            │   │   │
│  │  │  poll mtime every 15s for changes                  │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │              LockManager                            │   │   │
│  │  │  Reads: document.wems.lock                         │   │   │
│  │  │  Does NOT create lock (reader mode)                │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │          DatabaseService (existing)                 │   │   │
│  │  │  Uses: better-sqlite3                               │   │   │
│  │  │  Path: %TEMP%\wems-[uuid]\payroll.wems            │   │   │
│  │  │  Mode: READ ONLY                                   │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Key Modules to Add/Modify

| Module | Action | Description |
|--------|--------|-------------|
| `DocumentService` | **Add** | New service managing document lifecycle |
| `LockManager` | **Add** | Wraps `proper-lockfile` for document locking |
| `DatabaseService` | **Modify** | Accept document path instead of fixed path |
| `main/index.ts` | **Modify** | File open handling (command line args) |
| `renderer/src/app.tsx` | **Modify** | Document context, lock status UI |
| File menu components | **Add** | Open, New, Save As dialogs |
| UI components | **Add** | Lock status banner, read-only indicators |

### 7.3 Libraries

| Concern | Library | Status |
|---------|---------|--------|
| App-level locking | `proper-lockfile` | **New dependency** |
| File watching | `fs.stat` polling | No new dependency |
| Path handling | `node:path`, `node:fs` | Built-in |
| UUID generation | `uuid` | Already in WEMS |
| SQLite | `better-sqlite3` | Already in WEMS |
| Drizzle | `drizzle-orm` | Already in WEMS |

**Only ONE new dependency: `proper-lockfile`.**

### 7.4 Data Flow Summary

```
[Double-click .wems in Explorer]
         ↓
[Electron main receives file path as command line argument]
         ↓
[DocumentService.open(path)]
         ↓
[Is path a network share?]
         ├── YES: Check .lock file, acquire if available
         └── NO:  Open directly (no locking needed)
         ↓
[Copy original file → %TEMP%\wems-[uuid]\payroll.wems]
         ↓
[DatabaseService connects to temp file]
         ↓
[Drizzle/React renders data]
         ↓
[User edits → local temp DB]
         ↓
[Ctrl+S or auto-save]
         ↓
[Copy temp → original location, update lock heartbeat]
         ↓
[On close]
         ↓
[Save if needed, release lock (if network), cleanup temp]
```

---

## 8. Comparison: Old vs. New Architecture

| Aspect | Current (Shared SQLite) | New (Document Model) |
|--------|-------------------------|---------------------|
| **Installation** | Single shared install (problematic) | Local install per user |
| **Data storage** | Fixed path `data/database.db` | User-chosen `.wems` files |
| **Database access** | Direct on network path | Extracted to local temp |
| **Sharing model** | App shared, data shared | Documents shared (like Excel) |
| **Lock mechanism** | Custom lock file (unreliable on SMB) | `proper-lockfile` (atomic, works locally + SMB) |
| **Open model** | App runs, then selects file | Double-click file to open |
| **Reader mode** | Possible but unstable | Clean read-only mode |
| **Local usage** | Requires network path | Fully local, no network required |

---

## 9. Transition Plan

### Phase 1 — Document Service (Core)
- Add `DocumentService` with `open()`, `save()`, `close()`
- Add `LockManager` using `proper-lockfile`
- Modify `main/index.ts` to handle file open events (command line args)
- **Deliverable:** Can open `.wems` files with proper locking

### Phase 2 — File Operations
- Add Open, New, Save As menu items
- Add recent files list
- **Deliverable:** Full file menu works like a normal document app

### Phase 3 — UI Polish
- Add lock status to title bar
- Add read-only banner
- Add "document updated" notifications for readers
- **Deliverable:** Clear UX for lock states

### Phase 4 — Migration
- Export existing `database.db` to `.wems` file
- **Deliverable:** Migration path for existing users

---

## 10. Why This Is Better Than Current Architecture

### Problems Solved

1. **Document-centric** — WEMS now behaves like a normal document app (Word, Excel). Users understand this model intuitively.

2. **Local usage works out of the box** — No network required. Single user on a single machine works identically to shared usage.

3. **True multi-user sharing** — Lock file mechanism works reliably (atomic O_EXCL, not SMB byte-range locks).

4. **No SQLite on network** — SQLite is never accessed directly on any shared path. All access is to temp copies.

5. **Separate data per organization** — Multiple `.wems` files for different departments/companies.

6. **Deployment flexibility** — Store files locally or on any network share. Technical implementation is identical.

### What's Preserved

- All existing Drizzle schema and queries
- `better-sqlite3` for database access
- TanStack Query for UI state management
- All existing React components (just need document context)
- The entire app UX, with added document-centric navigation

### What's New

- `proper-lockfile` dependency
- `DocumentService` module
- `LockManager` module
- File association registration
- Standard file menu (Open, New, Save As, etc.)

---

## 11. Summary

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Core model** | Document-based app | User mental model matches Excel/Word |
| **File format** | `.wems` = SQLite database file | Simple, no ZIP wrapper needed |
| **Locking** | Shadow lockfile via `proper-lockfile` | Atomic on local and SMB, proven pattern |
| **Sharing** | Optional deployment feature | Local usage works without any sharing |
| **Reader mode** | Copy to temp, open readonly, poll mtime | Clean separation, no corruption risk |
| **Writer mode** | Copy to temp, work locally, copy back on save | All SQLite ops are local |
| **Auto-save** | Every 2 minutes + Ctrl+S | Familiar pattern, safe |
| **File ops** | Open, New, Save As, Close | Standard document app UX |

---

## 12. Files Affected

### New Files
- `src/core/lib/document-service.ts` — Document lifecycle management
- `src/core/lib/lock-manager.ts` — `proper-lockfile` wrapper
- `src/core/lib/file-watcher.ts` — mtime polling for network shares

### Modified Files
- `src/main/index.ts` — File open handling (command line args), document initialization
- `src/renderer/src/app.tsx` — Document context provider
- `src/renderer/src/components/file-menu.tsx` — File operations UI
- `src/renderer/src/stores/document-store.ts` — Document state (Zustand)

### Configuration
- File association: Register `.wems` extension in Windows (via installer/electron-builder)

---

## 13. Open Questions / Future Enhancements

| Question | Consideration |
|----------|---------------|
| **Attachments** | Store as BLOBs in SQLite (simpler) or external files (lazy loading)? |
| **Large files** | If `.wems` grows >100MB, might need progressive loading for cold open |
| **Schema migrations** | On document open, check schema version, run migrations if needed |

These are Phase 2+ considerations. Phase 1 covers the core locking and file operations.

---

*Report generated as part of WEMS v2 architecture review*
*Updated: 2026-04-20*
*Model: Document-based application (sharing is optional, not mandatory)*