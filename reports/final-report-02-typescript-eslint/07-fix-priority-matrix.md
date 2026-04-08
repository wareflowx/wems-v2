# Fix Priority Matrix

This matrix provides a prioritized list of fixes with effort estimates to help plan remediation work.

## Priority Matrix Table

| Priority | Issue | Files | Estimated Effort | Impact |
|----------|-------|-------|------------------|--------|
| **P0** | Duplicate import | handlers.ts | 15 min | Unblocks build |
| **P0** | db/index.ts narrowing | db/index.ts | 1-2 h | Fixes 2 TS errors |
| **P1** | ORPC input types | handlers.ts (20+ handlers) | 4-6 h | Fixes 50+ TS errors |
| **P1** | Drizzle insert types | handlers.ts | 6-8 h | Fixes 20+ TS errors |
| **P1** | IPC interceptor types | handler.ts, manager.ts | 2-3 h | Fixes 5+ TS errors |
| **P1** | Window handler types | window/hadlers.ts | 1-2 h | Fixes 3+ TS errors |
| **P2** | Catch blocks | 138 files | 15-20 h | Type safety |
| **P2** | ESLint patterns | manager.ts, export-history.ts | 2-3 h | Code quality |
| **P3** | Style auto-fixes | 7 scripts, 2 src | 1 h | Maintenance |

---

## Effort Summary by Priority

### P0 - Critical (Must Fix)
| Issue | Effort |
|-------|--------|
| Duplicate import | 15 min |
| db/index.ts narrowing | 1-2 h |
| **Total P0** | **1.5-2.5 hours** |

### P1 - High Priority
| Issue | Effort |
|-------|--------|
| ORPC input types | 4-6 h |
| Drizzle insert types | 6-8 h |
| IPC interceptor types | 2-3 h |
| Window handler types | 1-2 h |
| **Total P1** | **13-19 hours** |

### P2 - Medium Priority
| Issue | Effort |
|-------|--------|
| Catch blocks | 15-20 h |
| ESLint patterns | 2-3 h |
| **Total P2** | **17-23 hours** |

### P3 - Low Priority
| Issue | Effort |
|-------|--------|
| Style auto-fixes | 1 h |
| **Total P3** | **1 hour** |

---

## Total Estimated Fix Time

| Phase | Priority | Time |
|-------|----------|------|
| Phase 1 | P0 | 1.5-2.5 hours |
| Phase 2 | P1 | 13-19 hours |
| Phase 3 | P2 | 17-23 hours |
| Phase 4 | P3 | 1 hour |
| **Total** | | **32.5-45.5 hours** |

---

## Recommendations

1. **Fix P0 immediately** - These block compilation
2. **Address P1 in current sprint** - These affect runtime type safety
3. **Schedule P2 work** - Catch block typing is the largest effort (15-20 hours)
4. **Automate P3 fixes** - Use eslint --fix in pre-commit hook

---

## Fix Order

1. Duplicate identifiers in handlers.ts (15 min)
2. Type narrowing in db/index.ts (1-2 h)
3. ORPC input types (4-6 h)
4. Drizzle insert types (6-8 h)
5. IPC interceptor types (2-3 h)
6. Window handler types (1-2 h)
7. Catch blocks (15-20 h) - consider codemod
8. ESLint patterns (2-3 h)
9. Auto-fix style issues (1 h)
