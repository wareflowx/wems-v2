# Monitoring Strategy

## Key Metrics to Track

### 1. Bundle Size

Use `vite-bundle-analyzer` to monitor chunk sizes and identify large dependencies.

```bash
npm install -D vite-bundle-analyzer
```

### 2. Startup Time

Add performance marks to measure startup phases:

```typescript
performance.mark('app-init-start');
performance.mark('orpc-ready');
performance.measure('ORPC Init', 'app-init-start', 'orpc-ready');
```

### 3. Query Waterfalls

Use React DevTools Profiler to identify query waterfalls and excessive re-renders.

### 4. Build Reports

Use `electron-vite build --visualize` to generate visual dependency graphs.

---

## Recommended DevTools

### vite-bundle-analyzer

HTML report of chunk sizes. Essential for monitoring code splitting effectiveness.

```bash
# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({
    filename: 'stats.html',
    open: true,
  }),
];
```

### @tanstack/react-query-devtools

Query cache inspection and monitoring.

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to app root
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Electron DevTools

Main/renderer process profiling for IPC communication analysis.

### Chrome Performance Tab

Startup sequence analysis including:
- Script parsing time
- Network request waterfall
- Main thread blocking

---

## Measurement Checklist

- [ ] Measure cold start time before and after changes
- [ ] Track bundle size per chunk
- [ ] Monitor ORPC handshake time
- [ ] Count initial queries on startup
- [ ] Measure time to interactive
- [ ] Profile main thread activity

---

*Part of WEMS v2 Startup Performance Analysis*
