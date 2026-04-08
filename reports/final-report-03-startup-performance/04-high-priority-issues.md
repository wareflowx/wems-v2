# HIGH Priority Issues

## Issue 3: No Splash Screen / Loading State

### Location

- `src/main/index.ts`
- `src/renderer/index.html`

### Current Behavior

The application displays a blank window during the entire startup sequence, leaving users with no feedback.

### Electron Best Practice

```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,  // Don't show until ready
    backgroundColor: '#1a1a2e',  // Match app's dark background
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
  });

  // Use ready-to-show event
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
}
```

### Implementation Steps

1. **Create inline splash HTML** - 1 hour
2. **Implement ready-to-show event** - 1 hour

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| User feedback | None (blank window) | Within 500ms |
| Perceived startup time | Full 30-120s | Reduced by 50% |

---

## Issue 4: i18n Eager Loading

### Location

`src/renderer/src/localization/i18n.ts`

### Problem

Both FR and EN translations are loaded on startup, but only FR is actually used.

```typescript
import en from '@/locales/en.json';  // LOADED BUT NEVER USED
import fr from '@/locales/fr.json';
```

### Solution

Remove the unused EN translation import.

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Bundle reduction | - | ~50-100KB |
| Time savings | - | 1-2 seconds |

### Effort

**5 minutes** to remove unused import

---

*Part of WEMS v2 Startup Performance Analysis*
