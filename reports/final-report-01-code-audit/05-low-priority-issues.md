# Low Priority Issues (P3)

## 13. Commented-Out Code

Code that has been commented out but not removed. While sometimes useful during development, commented code:
- Creates noise and confusion for other developers
- May contain outdated logic that misleads readers
- Should be removed or replaced with proper version control history references

**Recommendation:** Remove commented-out code. Use git history if you need to recover it.

---

## 14. Missing useCallback for Event Handlers

React components may benefit from `useCallback` to memoize event handlers, preventing unnecessary re-renders of child components that receive these handlers as props.

**Example:**
```typescript
// Before: Handler recreated on every render
const handleClick = () => {
  doSomething(value);
};

// After: Memoized handler
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

**Note:** Not all event handlers need memoization. Consider the child component's rendering behavior before adding `useCallback`.

---

## 15. Unnecessary useEffect Dependencies

useEffect hooks with missing or incorrect dependency arrays may cause stale closures or infinite loops.

**Example of problematic pattern:**
```typescript
// May cause infinite loop
useEffect(() => {
  setValue(something);
}, [something]);
```

**Recommendations:**
1. Review all useEffect hooks for correct dependencies
2. Use ESLint rules to catch missing dependencies
3. Consider using `useMemo` or `useCallback` to stabilize values

---

## Summary

| Issue | Impact | Effort to Fix |
|-------|--------|---------------|
| Commented-Out Code | Code clarity | Low |
| Missing useCallback | Performance | Medium |
| Unnecessary useEffect Dependencies | Correctness | Medium |