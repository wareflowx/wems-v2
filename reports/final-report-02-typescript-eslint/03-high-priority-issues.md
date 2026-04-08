# High Priority Issues (P1)

These issues affect type safety, data integrity, and runtime behavior. They should be addressed after critical issues are resolved.

---

## 1. ORPC Handler `input` is `unknown` (Lines 142, 258, 335, 487, etc.)

**Report Error:** `TS18046: 'input' is of type 'unknown'`

**Root Cause:** ORPC's `os.handler()` needs proper TypeScript generics to infer input types.

**Research-Backed Solution:**

```typescript
// Define your schema
export const createPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

// Extract the inferred type
type CreatePostInput = z.infer<typeof createPostInputSchema>;

// Handler with properly typed input
export const createPost = os.handler(async ({ input }: { input: CreatePostInput }) => {
  const validatedData = createPostInputSchema.parse(input);
  const db = await getDb();
  const [newPost] = await db.insert(posts).values(validatedData).returning();
  return newPost;
});
```

**Effort:** 4-6 hours across all handlers.

---

## 2. Drizzle ORM Type Mismatches (Lines 407-434)

**Report Error:** `TS2322: Type 'string' is not assignable to type 'SQLiteColumn<...>'`

**Root Cause:** Zod schemas with transforms produce types that don't match Drizzle column types.

**Fix Pattern:**
```typescript
// Option 1: Don't use transforms in schema
export const createEmployeeInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  // No transforms
});

// Then do transforms AFTER parsing:
export const createEmployee = os.handler(async ({ input }: { input: CreateEmployeeInput }) => {
  const validatedData = {
    ...input,
    email: input.email.toLowerCase().trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
  };
  // Insert with properly typed data
});
```

**Effort:** 6-8 hours to fix all Drizzle insertions.

---

## 3. ORPC Interceptor Type Errors (`handler.ts`)

**Report Errors:**
```
TS2345: Argument of type '(error: unknown, { path, input }: ...) => ORPCError'
TS2339: Property 'path' does not exist on type '...'
```

**Fix:**
```typescript
onError((error: unknown, context: { path?: string; input?: unknown }) => {
  console.error(`[ORPC Error] ${context.path ?? "unknown"}:`, {
    message: error instanceof Error ? error.message : String(error),
  });
});
```

**Effort:** 2-3 hours.

---

## 4. Window Handlers Type Errors (`window/hadlers.ts`)

**Report Errors:**
```
TS2339: Property 'minimize' does not exist on type 'never'
TS2339: Property 'isMaximized' does not exist on type 'never'
```

**Fix:**
```typescript
export const minimizeWindow = os
  .use(ipcContext.mainWindowContext)
  .handler(({ context }) => {
    if (!context.window) {
      throw new Error("Window not available");
    }
    context.window.minimize();
  });
```

**Effort:** 1-2 hours.

---

## Summary

| Issue | Files Affected | Estimated Effort |
|-------|----------------|------------------|
| ORPC input types | handlers.ts (20+ handlers) | 4-6 hours |
| Drizzle insert types | handlers.ts | 6-8 hours |
| IPC interceptor types | handler.ts, manager.ts | 2-3 hours |
| Window handler types | window/hadlers.ts | 1-2 hours |
| **Total P1** | | **14-19 hours** |
