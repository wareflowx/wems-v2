# Cloud Sync Feasibility Analysis for .wems Files

**Project:** WEMS v2
**Date:** 2026-04-20
**Type:** Technical Analysis
**Status:** Research Summary

---

## Executive Summary

This report analyzes the feasibility of adding a cloud synchronization option to the `.wems` document format (SQLite database). We investigated how Microsoft Excel handles OneDrive synchronization and applied those lessons to our context.

**Key Finding:** Cloud sync for `.wems` files is significantly more complex than for `.xlsx` files due to SQLite's active-state nature (WAL journals, shared memory, file locks). A naive file-sync approach (like OneDrive) would risk database corruption. True cloud sync requires either a central server or CRDT-based state replication.

---

## 1. How Excel/OneDrive Sync Works

### 1.1 Synchronization Architecture

OneDrive uses a **central server-based model** with the following components:

```
User saves file
     ↓
OneDrive client detects change (via WNS notification if online)
     ↓
File chunked (if >8MB via BITS, else single HTTPS request)
     ↓
Upload to Azure blob storage (encrypted)
     ↓
Server updates change token (version vector)
     ↓
Other clients notified via WNS
     ↓
They download the changes
```

### 1.2 Conflict Resolution

Excel/OneDrive uses **optimistic concurrency** with server-side conflict detection:

1. Each file has a **change token** (version sequence number)
2. Client sends its known token when saving
3. Server compares tokens:
   - **Match** → save succeeds
   - **Mismatch** → conflict detected
4. On conflict: OneDrive creates a **duplicate file** (e.g., `payroll (Alice's Device) - 2026-04-20.xlsx`)
5. Original file preserved; user manually resolves

### 1.3 File Locking

- OneDrive uses **short-lived server-managed leases** during save operations
- Office apps acquire **co-authoring locks** when editing in collaboration mode
- These locks are **server-side**, not WebDAV-based
- Lock released when file closed or user idle

### 1.4 Security Model

| Layer | Protection |
|-------|-----------|
| In transit | HTTPS/TLS |
| At rest (Azure) | Per-file encryption, chunk-level keys |
| Local cache | **NOT encrypted** at filesystem level |

**Local cache security note:** While Azure stores data encrypted, the local OneDrive cache in `%LocalAppData%\Microsoft\OneDrive\` is stored as raw encrypted bytes — if an attacker gains PC access, they can read the files.

### 1.5 Offline Behavior

```
User offline → edits file → Excel saves locally to OneDrive folder
     ↓
File marked "pending sync"
     ↓
On reconnect → upload queue processed
     ↓
If server unchanged → sync succeeds
If server changed → conflict → two files created
```

---

## 2. Why .wems is Different from .xlsx

### 2.1 The Fundamental Difference

| Aspect | .xlsx (Excel) | .wems (SQLite) |
|--------|---------------|----------------|
| **Format type** | Passive document file | Active database engine |
| **Active state** | None (file is closed when not editing) | WAL journal, shared memory, locks |
| **Concurrent access** | Single writer at file level | Multiple internal locks (SHARED, RESERVED, EXCLUSIVE) |
| **Copy behavior** | Safe to copy at any time | **UNSAFE** if another process has it open |

### 2.2 SQLite's Active State Problem

When a SQLite database is in use:

```
payroll.wems          (main database file)
payroll.wems-wal      (Write-Ahead Log - active writes)
payroll.wems-shm      (Shared memory - lock state)
```

**If you copy `payroll.wems` while someone else has it open:**
- You get an incomplete snapshot
- WAL entries may not be in the main file
- On opening, SQLite sees corruption or missing data

This is why SQLite documentation explicitly warns against using databases on network shares.

### 2.3 Excel Doesn't Have This Problem

`.xlsx` is a ZIP archive. When Excel closes the file, there's no active state. When you copy it, you get a complete, self-contained snapshot. OneDrive can sync it safely because there's no "someone is using this" internal state.

---

## 3. Cloud Sync Options for .wems

### Option A: Naive File Sync (OneDrive-style)

**Approach:** Sync the `.wems` file like OneDrive syncs `.xlsx`

**Problems:**
- SQLite corruption if copied while another user has it open
- No conflict resolution at data level (would need to keep both full files)
- WAL files (`-wal`, `-shm`) get out of sync
- No server-side lock mechanism (our `.lock` file is application-level, not filesystem-level)

**Verdict:** ❌ **Does not work** — SQLite is not a document format.

### Option B: Full Database Sync (Server-based)

**Approach:** Central server with one true SQLite/PostgreSQL database. Clients sync data state, not files.

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│  Alice App  │ ←────→  │  Sync Server     │  ←────→  │   Bob App   │
│  (local .wems)│         │ (central .wems)  │         │ (local .wems)│
└─────────────┘         └─────────────────┘         └─────────────┘
```

**How it works:**
1. Server holds the authoritative database
2. Each client has a local `.wems` (cache/slave)
3. Sync protocol exchanges changes (not files)
4. Server is the arbiter for conflicts

**Problems:**
- Requires a server to run (defeats "local-first" if server goes down)
- Still complex — need to implement sync protocol, conflict resolution
- You've already solved this with network share — why add server?

**Verdict:** ⚠️ **Works but adds server dependency** — not local-first anymore.

### Option C: CRDT-based State Sync

**Approach:** Don't sync the SQLite file. Sync the application state using Conflict-free Replicated Data Types.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Alice App  │         │   Bob App   │         │  Carol App  │
│  Local state │ ←────→  │  Local state│ ←────→  │  Local state│
│  (CRDT)      │   ↕     │  (CRDT)     │   ↕     │  (CRDT)     │
└─────────────┘         └─────────────┘         └─────────────┘
         ↑                    ↑                    ↑
         └────────────────────┼────────────────────┘
                    (Eventual consistency via CRDT merge)
```

**How it works:**
- Each client maintains its own copy of application data (not SQLite)
- Changes are exchanged as operations (not file copies)
- CRDT merge algorithm resolves conflicts automatically
- No central server required (can be peer-to-peer or hub-and-spoke)

**Problems:**
- Lose SQLite's relational model and SQL queries
- Need to reimplement data layer (not just sync SQLite)
- Complex to implement correctly
- Significant rewrite of the data access layer

**Verdict:** ⚠️ **Theoretically elegant but complex** — substantial rewrite, loses SQL power.

### Option D: VPN + Existing Network Share

**Approach:** Don't sync to cloud. Use a mesh VPN to access the existing network share remotely.

```
Remote user → Tailscale VPN → Accesses \\server\share\payroll.wems
                      ↓
              Uses existing .wems lock mechanism
              No cloud sync needed
```

**How it works:**
- Tailscale (or similar: ZeroTier, WireGuard) creates a mesh VPN
- Remote users join the "private network"
- They access the shared folder as if they were on the local LAN
- Existing `.wems.lock` mechanism works
- No file sync, no cloud, no additional infrastructure

**Advantages:**
- Zero additional infrastructure
- Uses existing architecture (network share + lock file)
- Works for remote work scenarios (home, travel)
- Data never leaves your control
- No monthly fees

**Problems:**
- Requires internet connection to VPN in
- If server is down, no access (same as local network)
- Latency depends on internet speed

**Verdict:** ✅ **Recommended for remote access** — simple, uses existing architecture.

---

## 4. If We Really Want Cloud Sync

### 4.1 Minimum Viable Cloud Architecture

If cloud sync is required (e.g., for backup or access from devices without VPN), here's the minimum approach:

```
┌──────────────────────────────────────────────────────────────┐
│                     Cloud Storage (S3 / Azure Blob)         │
│                                                              │
│   payroll.wems (synced periodically, not during edits)       │
│   payroll.wems.lock (for conflict detection)                 │
└──────────────────────────────────────────────────────────────┘
            ↑                                    ↑
            │         Sync every N minutes       │
            │         (not real-time)             │
            ↓                                    ↓
┌─────────────────────┐              ┌─────────────────────┐
│     Alice's PC       │              │      Bob's PC       │
│  Local .wems         │ ←─────→     │   Local .wems       │
│  (editing)           │   Manual     │   (read-only)        │
│                      │   resolve    │                      │
└─────────────────────┘              └─────────────────────┘
```

**Rules:**
1. **No real-time sync** — only sync on explicit save or auto-save interval
2. **Writer must have exclusive lock** — before syncing up, ensure no one else is editing
3. **On conflict:** keep both versions (filename - date.xlsx style)
4. **Backups only** — cloud is for backup, not for live collaboration

### 4.2 Security Requirements (If Cloud)

If going cloud route:

| Concern | Requirement |
|---------|-------------|
| Authentication | OAuth 2.0 (Google, Microsoft, or custom) |
| In transit | TLS 1.2+ minimum |
| At rest | AES-256 encryption |
| Local cache | Consider filesystem encryption (BitLocker) |
| Access control | Per-file permissions, revoke capability |

### 4.3 Not Recommended for WEMS

Cloud sync adds significant complexity:
- Auth system
- Sync protocol
- Conflict resolution UI
- Security hardening
- Ongoing maintenance

For a 5-10 user app with network share already working, this is overkill. **VPN access is the right solution for remote users.**

---

## 5. Comparison Table

| Sync Method | Complexity | Local-first | Server required | Safe for SQLite | Recommended |
|-------------|------------|-------------|-----------------|-----------------|-------------|
| **Network share (current)** | Low | ✅ | No | ✅ (with lock file) | ✅ |
| **VPN + network share** | Low | ✅ | No | ✅ | ✅ (for remote) |
| **Cloud file sync (OneDrive-style)** | Medium | ❌ | No | ❌ | ❌ |
| **Central DB server** | High | ❌ | Yes | ✅ | ⚠️ |
| **CRDT-based sync** | Very High | ✅ | Optional | ✅ | ❌ |
| **Hybrid (periodic backup to cloud)** | Medium | ✅ | No | ✅ | ⚠️ |

---

## 6. Recommendations

### 6.1 For WEMS v2 (Current Phase)

**Keep the network share architecture.** It's simple, reliable, and works for the target use case (5-10 users, shared folder).

### 6.2 For Remote Access

**Implement VPN (Tailscale/ZeroTier).** This is the simplest solution for users working from home or traveling:

```
User installs Tailscale → joins private network → accesses shared folder
```

No code changes, no cloud dependency, no additional infrastructure.

### 6.3 For Backup Only (Optional Future)

If backup to cloud is desired:

```
Auto-backup every night to S3
Manual "Save to Cloud" button
Conflict creates duplicate file
```

Not real-time sync, just periodic backup for disaster recovery.

### 6.4 What NOT To Do

- ❌ Don't try to sync `.wems` files in real-time like OneDrive
- ❌ Don't add a central database server (defeats local-first)
- ❌ Don't implement full CRDT sync (overkill for this use case)
- ❌ Don't build a custom cloud sync service (security hardening is a full-time job)

---

## 7. Why This Is Fine

The limitation is actually a **feature**, not a bug:

1. **Local-first means local-first** — your data is on your network, not in someone else's cloud
2. **Simple is reliable** — no sync conflicts, no cloud outages, no auth breaches
3. **Network share is proven** — Excel, Word, and millions of businesses work this way
4. **VPN covers remote** — Tailscale makes this trivial to set up

**For a 5-10 person team, the network share + lock file model is the right solution.** Cloud sync would add complexity without meaningful benefit.

---

## 8. Future Consideration

If WEMS grows to a platform (as described in `local-first-app-platform.md`) and the use case expands to:
- Larger teams
- Geographically distributed users
- Need for real-time collaboration

Then **Option B (Central DB Server)** or **Option C (CRDT-based)** would become relevant. At that point, the architecture would shift from "local-first file app" to "sync-enabled collaborative app" — a different product category with different complexity.

For the current scope (small team, shared folder), **keep it simple**.

---

*Report generated: 2026-04-20*
*Based on research of Microsoft Excel/OneDrive sync architecture and SQLite network sharing limitations*