# CRITICAL Issue 1: Renderer Bundle Without Code Splitting

## Location

`electron.vite.config.ts:32-49`

## Current Problem

The renderer bundle is built as a single 2.5MB file with no code splitting. This means the entire application must be downloaded and parsed before any code can execute.

### Current Configuration

```typescript
renderer: {
  root: "src/renderer",
  plugins: [tailwindcss()],
  build: {
    target: "chrome108", // Missing code splitting
  },
  // NO rollupOptions.output.manualChunks!
}
```

### Impact

- **Bundle size:** 2.5MB must be fully parsed before any code executes
- **Initial JS parse time:** 8-15 seconds
- **Time to interactive:** 30-120 seconds

## Recommended Solution

Configure `manualChunks` in the Vite build configuration to split vendor code into separate chunks:

```typescript
// electron.vite.config.ts
export default defineConfig({
  renderer: {
    root: 'src/renderer',
    plugins: [tailwindcss()],
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
              if (id.includes('@tanstack')) return 'vendor-tanstack';
              if (id.includes('@radix-ui')) return 'vendor-radix';
              if (id.includes('exceljs')) return 'vendor-excel';
              if (id.includes('jspdf')) return 'vendor-pdf';
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('i18next')) return 'vendor-i18n';
              if (id.includes('date-fns')) return 'vendor-date';
              return 'vendor-misc';
            }
          }
        }
      }
    },
  },
});
```

## Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial bundle size | 2.5MB | ~400-600KB |
| Time savings | - | 8-15 seconds |

## Effort

**2 hours** for initial configuration
**3 hours** additional for lazy loading route components
**2 hours** for lazy loading heavy libraries (exceljs, jspdf)

---

*Part of WEMS v2 Startup Performance Analysis*
