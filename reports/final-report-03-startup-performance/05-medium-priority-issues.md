# MEDIUM Priority Issues

## Issue 5: ORPC Handshake Complexity

### The 11-Step Handshake Process

```
1. Renderer calls ipc.init()
2. ipc posts "orpc-port-ready" listener
3. ipc calls window.electron.rpc.notifyReady()
4. Preload receives notifyReady
5. Preload sends START_ORPC_SERVER to main
6. Main creates MessageChannel
7. Main sends client port to preload
8. Preload receives port
9. Preload forwards to renderer
10. Renderer receives port
11. Renderer creates ORPC client
```

### Current Problem

The handshake uses polling as a fallback, creating approximately 50 setTimeout calls during startup.

### Optimization - Remove Polling

```typescript
// Current: Polls for 5 seconds as fallback
// Problem: creates 50 setTimeout calls

// Optimized: Single promise-based approach
await new Promise((resolve) => {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'orpc-port-ready') {
      resolve();
    }
  });
  setTimeout(resolve, 10000); // Single timeout instead of polling
});
```

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| setTimeout calls | ~50 | 1 |
| Time savings | - | 200-500ms |

### Effort

**1 hour** to remove polling fallback
**2 hours** to pre-create ORPC channel

---

## Issue 6: Lock Watcher Polling

### Location

`src/main/index.ts:226-228`

### Current Behavior

Polling starts immediately at 2-second intervals during startup.

### Optimization

```typescript
// Start with 5s interval, not 2s
// Don't start until after UI is ready
startLockWatcher(callback, 5000); // Start with 5s
```

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Polling interval | 2s | 5s |
| CPU reduction | - | Moderate |
| Time savings | - | 0.5-1 seconds |

### Effort

**5 minutes** to increase interval

---

## Issue 7: Database WAL Pragma on Every Start

### Location

`src/core/db/index.ts:148`

### Current Behavior

```typescript
sqlite.pragma('journal_mode = WAL'); // Runs every startup
```

### Optimization

```typescript
const currentMode = sqlite.pragma('journal_mode', { simple: true });
if (currentMode !== 'wal') {
  sqlite.pragma('journal_mode = WAL');
}
```

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| WAL pragma calls | Every startup | Conditional |
| Time savings | - | <100ms |

### Effort

**10 minutes** to add conditional check

---

*Part of WEMS v2 Startup Performance Analysis*
