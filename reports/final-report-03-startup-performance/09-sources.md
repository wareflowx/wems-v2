# Sources and References

## Documentation

- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite 7.x Documentation](https://vitejs.dev/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [i18next](https://www.i18next.com/)
- [ORPC/tRPC Documentation](https://orpc.vercel.app/)

## Key Concepts

### Code Splitting
- Vite Rollup Options: `rollupOptions.output.manualChunks`
- Route-based code splitting with `React.lazy()`
- Library-level code splitting for heavy dependencies

### Electron Best Practices
- BrowserWindow `show: false` option
- `ready-to-show` event for delayed rendering
- `backgroundColor` for seamless splash effect

### TanStack Query Optimization
- `staleTime` to prevent unnecessary refetches
- `gcTime` for cache management
- `refetchOnWindowFocus: false` to reduce background activity

### ORPC/tRPC
- MessageChannel for efficient IPC
- Promise-based initialization over polling

---

## Report Information

**Report generated:** 2026-04-07

**Analysis by:** Claude Sonnet 4.6

**Senior Review by:** Principal Software Architect

**Status:** FINAL (Merged Analysis + Senior Review)

---

*Part of WEMS v2 Startup Performance Analysis*
