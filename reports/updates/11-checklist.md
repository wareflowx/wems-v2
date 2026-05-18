# Implementation Checklist

## Repository
https://github.com/wareflowx/wems-v2

---

## Phase 1: Basic Update Flow

### PR #1 - Enable Update Infrastructure

- [ ] Configure `publish` in `electron-builder.json` with GitHub provider
- [ ] Change `differentialPackage: false` to `true`
- [ ] Create `src/main/update-manager.ts` with NsisUpdater integration
- [ ] Wire UpdateManager into main process (`src/main/index.ts`)
- [ ] Add IPC handlers for update operations
- [ ] Test update check against GitHub releases
- [ ] **Create PR and merge**

---

## Phase 2: UI Components

### PR #2 - Update Splash Screen

- [ ] Extend `UpdateStatusDialog` with download progress states
- [ ] Create `UpdateSplashScreen` component (`src/renderer/src/components/update-splash.tsx`)
- [ ] Add progress bar with percentage, speed, and bytes info
- [ ] Add "Install Now" button when update is ready
- [ ] Add "Later" button to dismiss and defer installation
- [ ] Add manual "Check for Updates" entry in app menu (Help menu)
- [ ] Test all state transitions visually
- [ ] **Create PR and merge**

---

## Phase 3: Error Handling (Simple)

### PR #3 - Basic Error Handling

- [ ] Show clear error message if update check fails
- [ ] Handle download failure with retry option
- [ ] Handle `before-quit` during active download
- [ ] Test offline scenario
- [ ] **Create PR and merge**

**Note:** For 10 users, simple retry (1-2 attempts) is sufficient, no exponential backoff needed.

---

## Phase 4: Advanced Features (Optional for small team)

### PR #4 - Minor Polish

- [ ] Add "Check for Updates" in Help menu
- [ ] Test all error scenarios
- [ ] **Create PR and merge**

---

## Quick Reference

### For 10 Users Max - Simple Approach

1. Push tag → GitHub Release is created
2. Users get notification in app
3. Download and install when convenient
4. No staged rollout, no telemetry

---

## Quick Reference

### Commands

```bash
# Build installer
npm run dist

# Test locally with dev-app-update.yml
# Point to http://localhost:8080

# Create release tag
git tag v2.3.0
git push origin v2.3.0

# Create GitHub release (via GitHub Actions)
# electron-builder auto-creates release on tag push
```

### Key Files to Modify

| File | Changes |
|------|---------|
| `electron-builder.json` | Add `publish`, enable `differentialPackage` |
| `src/main/index.ts` | Import UpdateManager, wire IPC |
| `src/main/update-manager.ts` | New file - core update logic |
| `src/preload/index.ts` | Add update IPC handlers |
| `src/renderer/src/components/update-status-dialog.tsx` | Extend for download states |
| `src/renderer/src/components/update-splash.tsx` | New file - full-screen overlay |
| `src/renderer/src/App.tsx` | Add UpdateSplashScreen to layout |

### State Machine Reference

```
idle --> checking --> update-available --> downloading --> ready --> installing --> restarted
  |         |              |                   |
  +-> up-to-date          +-> error ---------> idle (after user dismiss)
```

### Error Recovery Flow

```
Error occurs
    |
    v
Network error? --> Yes --> Retry (exponential backoff) --> Max retries?
    |                                       |
    No                                      No
    |                                       v
    v                                   Report error
Check if differential failure
    |
    v
Fallback to full download
    |
    v
Retry or report error
```

---

## Milestone Timeline

| Phase | Description | Deliverable |
|-------|-------------|-------------|
| v2.3.0 | Basic update flow | PR #1 - Update infrastructure works |
| v2.3.1 | UI improvements | PR #2 - Splash screen and menu |
| v2.3.2 | Error handling | PR #3 - Robust error recovery |
| v2.3.3 | Advanced features | PR #4 - Staged rollouts and polish |