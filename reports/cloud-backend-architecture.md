# WEMS Cloud Backend: Hub-and-Spoke Architecture

**Project:** WEMS v2
**Date:** 2026-04-20
**Type:** Architecture Proposal
**Status:** New Idea

---

## Executive Summary

This document describes a **cloud hub architecture** for `.wems` files — an auto-hosted alternative to network share deployment. Instead of peer-to-peer sync via network share, `.wems` files are stored in a private cloud backend. Desktop apps (clients) sync with the cloud. This enables:
- Remote access from anywhere (not just LAN)
- Centralized backup and version history
- SSO/authentication for enterprise environments
- Conflict resolution via server-side arbitration

**This is the cloud version of the document-based architecture, not a replacement.**

---

## 1. Architecture Overview

### 1.1 The Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Cloud Backend (Private)                       │
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────┐  │
│   │  Auth/SSO   │     │  REST API   │     │   Blob Storage (S3)     │  │
│   │  (OAuth/SSO)│     │  (Fastify)  │     │   /Containers            │  │
│   └─────────────┘     └──────┬──────┘     │   └── documents/         │  │
│                              │             │       ├── doc-id-1.wems   │  │
│                              │             │       ├── doc-id-2.wems   │  │
│                              │             │       └── ...             │  │
│                              │             └─────────────────────────┘  │
│                              │                                               │
│                    API: /documents, /sync, /auth                        │
└──────────────────────────────┼────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  Alice PC    │  │  Bob PC       │  │  Carol PC    │
     │  (Windows)  │  │  (Windows)    │  │  (Mac/Linux) │
     │  Local .wems│  │  Local .wems  │  │  Local .wems  │
     │  + Sync CLI │  │  + Sync CLI  │  │  + Sync CLI  │
     └──────────────┘  └──────────────┘  └──────────────┘
```

### 1.2 How It Works

1. **User imports** a `.wems` file to the cloud (Upload)
2. **Cloud stores** the file as a blob (with version history)
3. **Desktop apps** download the file to work locally
4. **Edits** are saved locally (offline-first)
5. **Sync** uploads changes to cloud when online
6. **Conflict** → server keeps both versions (like OneDrive)

### 1.3 Comparison with Other Models

| Aspect | Network Share | Cloud Backend |
|--------|---------------|---------------|
| **Access** | LAN only | Anywhere with internet |
| **Sync model** | Peer-to-peer via `.lock` | Hub-and-spoke via API |
| **Auth** | None (file permissions) | SSO/OAuth (enterprise ready) |
| **Conflict resolution** | Lock file (first writer wins) | Server arbiter + version history |
| **Backup** | Manual copy | Automatic, versioned |
| **Infrastructure** | None (just a folder) | Server + storage required |

---

## 2. Cloud Backend Components

### 2.1 API Server

**Technology:** Node.js + Fastify (or Express)

**Endpoints:**

```
Auth:
POST   /auth/login          → Login (returns JWT)
POST   /auth/logout         → Logout
GET    /auth/me             → Current user info

Documents:
GET    /documents           → List user's documents
POST   /documents           → Upload new .wems file
GET    /documents/:id       → Download .wems file
PUT    /documents/:id       → Upload new version (with conflict check)
DELETE /documents/:id       → Delete document

Sync:
GET    /documents/:id/sync   → Get changes since token (for incremental sync)
POST   /documents/:id/sync   → Push local changes, get conflicts

Versions:
GET    /documents/:id/versions     → List version history
GET    /documents/:id/versions/:v  → Download specific version

Conflicts:
GET    /documents/:id/conflicts    → List conflicts
POST   /documents/:id/conflicts/:c/resolve → Resolve a conflict
```

### 2.2 Storage

**Technology:** S3-compatible (MinIO for self-hosted, or AWS S3, Azure Blob, etc.)

**Structure:**
```
bucket/
└── wems/
    ├── {document-id}/
    │   ├── current.wems           (latest version)
    │   ├── versions/
    │   │   ├── v1_2026-04-01.wems
    │   │   ├── v2_2026-04-15.wems
    │   │   └── ...
    │   └── metadata.json         (name, owner, created, tags)
    └── ...
```

**Metadata stored separately** (not in the .wems blob):
- Document name
- Owner/user
- Tags/categories
- Created/modified timestamps
- Version info

### 2.3 Authentication

**Options:**

1. **OAuth/SSO (Enterprise):**
   - Microsoft Entra ID (Azure AD)
   - Google Workspace
   - Keycloak / Dex (self-hosted)
   - Uses OIDC for authentication

2. **Simple (Internal):**
   - Username/password
   - JWT tokens for API auth
   - Session management

**For internal use, OAuth with your existing SSO is ideal.**

### 2.4 Conflict Resolution

Server acts as **arbiter** using change tokens:

```typescript
// Client wants to push changes
PUT /documents/:id
Headers: {
  "If-Match": "v12"  // client's known version
}

// Server checks:
// - If current version === "v12" → accept, increment to "v13"
// - If current version !== "v12" → CONFLICT
//   → Save client's version as "v13_conflict_{timestamp}.wems"
//   → Return 409 Conflict with both versions info
```

**Conflict handling:**
- Server keeps both versions
- Client sees: "Your version vs Server version"
- User manually resolves (choose one, or merge)
- Future: automatic merge for non-overlapping changes

---

## 3. Desktop Client Changes

### 3.1 Current Architecture → Cloud-Ready

**Current (network share):**
```
open(filePath) → copy to temp → work locally → save (copy to network)
```

**Cloud-ready (add sync layer):**
```
open(filePath_or_cloudId)
  ↓
  if cloudId:
    → download from cloud → copy to temp
  else:
    → copy from local/network path → copy to temp
  ↓
work locally (offline-first)
  ↓
save():
  → if cloudId: push to cloud (with version check)
  → else: copy to original location (network share behavior)
  ↓
watch for changes:
  → if cloudId: poll /sync endpoint every 15s
  → else: poll mtime on file
```

### 3.2 Sync Module

```typescript
interface SyncModule {
  // Connect to cloud (or offline)
  connect(): Promise<void>;
  disconnect(): void;

  // Upload local changes
  push(docId: string, localPath: string): Promise<SyncResult>;

  // Download remote changes
  pull(docId: string): Promise<void>;

  // Check for conflicts
  getStatus(docId: string): Promise<DocStatus>;

  // Resolve conflict
  resolveConflict(docId: string, resolution: 'keep-local' | 'keep-remote' | 'merge'): Promise<void>;
}

interface SyncResult {
  success: boolean;
  newVersion?: string;
  conflict?: {
    localVersion: string;
    remoteVersion: string;
    conflictFile: string;
  };
}
```

### 3.3 Offline-First Behavior

```
User opens document (cloud or local)
  ↓
Works offline (all operations on local temp)
  ↓
On save (Ctrl+S or auto-save):
  → If online: push to cloud
  → If offline: queue for sync later
  ↓
On reconnect:
  → Sync queued changes
  → Detect conflicts
  → Resolve with user if needed
```

---

## 4. Data Flow Examples

### 4.1 First Import

```
Alice has: C:\HR\payroll.wems (local file)
     ↓
Alice opens WEMS → "Import to Cloud" button
     ↓
WEMS: Upload to cloud API
     ↓
Cloud: Store in S3, create metadata, return document ID
     ↓
Alice's app: Store cloud ID in local config, continue working
     ↓
Now Bob and Carol can access via cloud
```

### 4.2 Normal Work Session

```
Alice opens: payroll.wems (cloud ID)
     ↓
Cloud: Download latest to temp
     ↓
Alice edits (offline-capable)
     ↓
Ctrl+S → Save
     ↓
WEMS: Push to cloud with version token
     ↓
Cloud: Check token → Accept (new version) or Conflict
     ↓
Update local cache, notify success/conflict
```

### 4.3 Remote User (Offline/Coffee Shop)

```
Bob opens: payroll.wems (cloud ID)
     ↓
Cloud: Download latest to temp
     ↓
Bob works offline (plane, bad wifi)
     ↓
Bob saves locally (queued)
     ↓
Bob reconnects
     ↓
WEMS: Push queued changes
     ↓
Cloud: Handle conflicts, notify Bob
```

### 4.4 Conflict Scenario

```
Alice and Bob both open payroll.wems (same version v5)
     ↓
Alice edits locally, saves → Push to cloud (v6)
     ↓
Bob edits locally (old version), saves → Push to cloud
     ↓
Cloud: Token mismatch (Bob has v5, current is v6)
     ↓
Cloud: Save Bob's as v7_conflict_2026-04-20.wems
     ↓
Return 409 Conflict to Bob
     ↓
Bob's app shows: "Conflict detected"
     ↓
Bob: Opens conflict file, sees both versions, picks one
     ↓
Bob: Pushes resolved version → Cloud accepts (v8)
```

---

## 5. Security Considerations

### 5.1 In Transit
- HTTPS/TLS 1.2+ for all API calls
- JWT tokens (short-lived, refresh rotation)
- No credentials in local storage (use secure keychain)

### 5.2 At Rest
- Storage encryption (S3 server-side encryption, or MinIO with encryption)
- Files stored with per-document encryption keys
- Backup encrypted

### 5.3 Access Control
- Document-level permissions (owner, editor, viewer)
- API rate limiting
- Audit log (who accessed what, when)

### 5.4 Local Cache
- Temp files in `%TEMP%` (standard cleanup)
- Optionally: encrypt local cache (slower, more complex)
- Clear cache on logout

---

## 6. Infrastructure Requirements

### 6.1 Minimum for Internal Deployment

```
┌─────────────────────────────────────────────────────────┐
│  Cloud Backend (VM or Container)                         │
│                                                          │
│  CPU: 2 vCPU                                            │
│  RAM: 4 GB                                              │
│  Disk: 100 GB (for storage + OS)                         │
│                                                          │
│  + S3-compatible storage (can be on same VM or separate) │
│                                                          │
│  Estimated cost: $50-100/month (cloud VM)                │
│  Or: On-prem server (existing infra)                     │
└─────────────────────────────────────────────────────────┘
```

### 6.2 S3 Storage Options

| Option | Pros | Cons |
|--------|------|------|
| **MinIO (self-hosted)** | Free, same VM, full control | You manage it |
| **TrueNAS/SCIH** | Built-in S3, enterprise features | More complex |
| **AWS S3** | Fully managed, reliable | Monthly cost, data leaves infra |
| **Backblaze B2** | Cheap, S3-compatible | External dependency |
| **Azure Blob** | If already Azure | Learning curve |

### 6.3 Authentication Options

| Option | Best For |
|--------|----------|
| **Microsoft Entra ID** | Already using Microsoft 365 |
| **Google Workspace** | Already using Google |
| **Keycloak** | Self-hosted, open source |
| **Authelia** | Self-hosted, simple |
| **Simple (username/pwd)** | Small team, internal only |

---

## 7. Implementation Phases

### Phase 0: Infrastructure Setup
- [ ] Deploy VM with Ubuntu/CentOS
- [ ] Install MinIO (or connect to existing S3)
- [ ] Deploy API server (Node.js + Fastify)
- [ ] Configure SSL (Let's Encrypt)
- [ ] Setup domain/internal DNS

### Phase 1: Basic Sync API
- [ ] Auth endpoints (login/logout)
- [ ] Document upload/download
- [ ] Version history (basic)
- [ ] Desktop client sync module (connect/disconnect)

### Phase 2: Incremental Sync
- [ ] Change token system
- [ ] Delta sync (only changed pages)
- [ ] Conflict detection
- [ ] Conflict resolution UI

### Phase 3: Enterprise Features
- [ ] SSO integration (Entra/Google)
- [ ] Permissions matrix
- [ ] Audit log
- [ ] Email notifications (conflict alerts)

### Phase 4: Polish
- [ ] Offline queue management
- [ ] Selective sync (which documents to keep local)
- [ ] Performance optimization (chunked upload/download)
- [ ] Mobile client (future)

---

## 8. Why This Is Different from Network Share

| Question | Network Share | Cloud Backend |
|----------|---------------|---------------|
| **Where is the data?** | On your file server | On your cloud storage |
| **Access from home?** | VPN required | Direct (internet) |
| **Conflict resolution?** | Lock file (someone loses work) | Version history + manual merge |
| **Backup?** | Manual (robocopy) | Automatic, versioned |
| **Auth?** | None or file share perms | SSO/OAuth enterprise ready |
| **Infrastructure?** | None (just a folder) | Server + storage + API |
| **Monthly cost?** | $0 (existing infra) | ~$50-100/month |

**The trade-off:** Cloud backend adds infrastructure cost and complexity, but enables remote access, better conflict handling, and enterprise auth.

---

## 9. Decision Framework

### Choose Network Share If:
- Team is on-site or VPN is acceptable
- IT already manages a shared drive
- Don't need SSO/authentication
- Want zero infrastructure changes

### Choose Cloud Backend If:
- Team is distributed (remote, multiple sites)
- Need SSO (Microsoft/Google login)
- Want automatic backups + version history
- Willing to manage/maintain a small server
- Data needs to be accessible from non-Windows devices

---

## 10. Summary

The cloud backend architecture transforms WEMS from:

```
Network Share Model:
\\server\share\payroll.wems
    ↑ shared folder (LAN only, no auth, manual backup)

To Cloud Backend Model:
cloud.internal → S3 storage → Desktop clients
                  ↑
              Auth + API + Versioning
```

**It's a new deployment option, not a replacement:**
- Existing network share users → keep using it
- New users/organizations → can use cloud backend
- Same `.wems` file format, same desktop app, different sync layer

**The core value proposition:**
- "Your data in your cloud, accessible from anywhere"
- "Like Notion but self-hosted"
- "No monthly SaaS fees, own your infrastructure"

---

*Architecture proposal for WEMS cloud backend*
*Generated: 2026-04-20*
*Status: New idea — for evaluation and planning*