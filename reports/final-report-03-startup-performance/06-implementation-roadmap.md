# Implementation Roadmap

## Phase 1: Quick Wins (1-2 hours)

| Change | Effort | Impact |
|--------|--------|--------|
| Add `show: false` and `backgroundColor` | 15 min | User perception |
| Increase lock watcher interval to 5s | 5 min | 0.5-1s |
| Check WAL mode before setting | 10 min | <100ms |
| Remove unused EN translations | 5 min | 50KB |
| Set default staleTime in QueryClient | 15 min | 3-8s |

**Total Phase 1: 3-10 seconds improvement**

---

## Phase 2: Code Splitting (4-8 hours)

| Change | Effort | Impact |
|--------|--------|--------|
| Configure manualChunks in vite | 2 hours | 8-15s |
| Lazy load route components | 3 hours | 5-10s |
| Lazy load heavy libraries (exceljs, jspdf) | 2 hours | 2-5s |

**Total Phase 2: 13-25 seconds improvement**

---

## Phase 3: Query Optimization (2-4 hours)

| Change | Effort | Impact |
|--------|--------|--------|
| Remove sidebar badge queries | 1 hour | 3-5s |
| Add staleTime to remaining queries | 1 hour | 2-4s |
| Implement Suspense boundaries | 2 hours | User perception |

**Total Phase 3: 5-10 seconds improvement**

---

## Phase 4: ORPC Optimization (2-3 hours)

| Change | Effort | Impact |
|--------|--------|--------|
| Remove polling fallback | 1 hour | 200ms |
| Pre-create ORPC channel | 2 hours | 300-500ms |

**Total Phase 4: 0.5-1 seconds improvement**

---

## Phase 5: Splash Screen (2-3 hours)

| Change | Effort | Impact |
|--------|--------|--------|
| Create inline splash HTML | 1 hour | User perception |
| Implement ready-to-show event | 1 hour | User perception |

**Total Phase 5: User perception improvement**

---

## Timeline Summary

| Phase | Time Investment | Startup Improvement |
|-------|-----------------|---------------------|
| Phase 1 | 1-2 hours | 3-10 seconds |
| Phase 2 | 4-8 hours | 13-25 seconds |
| Phase 3 | 2-4 hours | 5-10 seconds |
| Phase 4 | 2-3 hours | 0.5-1 seconds |
| Phase 5 | 2-3 hours | User perception |

**Total: 11-19 hours, 20-45+ seconds improvement**

---

## Target Achievement

With all phases completed, the goal is to reduce cold start from **30-120 seconds** to under **8 seconds** (industry standard: 3-5s).

---

*Part of WEMS v2 Startup Performance Analysis*
