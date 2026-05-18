# Update UI Components

## 7.1 Sidebar Banner (Primary)

For max 10 users, a simple **sidebar banner** is the main update notification.

**Location:** Bottom of sidebar, above the rail

**States:**
- `update-available` - Download button + version
- `downloading` - Progress bar + percentage
- `ready` - Install button + version
- `error` - Error message + retry button

**Component:** `UpdateSidebarBanner` (`src/renderer/src/components/update-sidebar-banner.tsx`)

---

## 7.2 Update States

```typescript
type UpdateStatus =
  | "idle"
  | "checking"
  | "update-available"
  | "downloading"
  | "ready"
  | "installing"
  | "up-to-date"
  | "error";
```

### State Flow

```
checking ──> update-available ──> downloading ──> ready ──> installing
   │                │                                     │
   v                v                                     v
up-to-date      (dismiss)                              (done)
                   │                                        │
                   v                                        v
                error <──────────────────────────────────────┘
```

---

## 7.3 Banner Layout

```
┌────────────────────────────┐
│ [icon] Update available    │
│        v2.3.0               │
│ ─────────────────────────── │  <- progress bar when downloading
│ [Download]         [X]     │
└────────────────────────────┘
```

---

## 7.4 Design Principles

1. **Compact** - Fits in sidebar, no full-screen overlay needed
2. **Non-intrusive** - Shows at bottom, doesn't block navigation
3. **Clear actions** - Download/Install buttons when needed
4. **Progress** - Shows percentage during download
5. **Dismissable** - X button to hide (status is remembered)