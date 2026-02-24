# Context & Dependency Injection

This guide covers ORPC's context mechanism for dependency injection and passing request-scoped data.

## Why Context?

- **Dependency Injection**: Pass database connections, services
- **Request Scoped Data**: User info, session data
- **Environment Config**: API keys, feature flags

## Two Types of Context

### 1. Initial Context

Passed explicitly when calling a procedure:

```typescript
// Define context type
const os = import { os } from "@orpc/server";

const base = os.$context<{
  env: { DB_URL: string };
  requestId: string;
}>();

// Use in handler
const getEmployees = base.handler(async ({ context }) => {
  console.log("DB URL:", context.env.DB_URL);
  console.log("Request ID:", context.requestId);
});

// Caller must provide context
client.database.getEmployees({}, {
  context: {
    env: { DB_URL: "..." },
    requestId: "abc-123",
  },
});
```

### 2. Execution Context

Computed during request, usually via middleware:

```typescript
// Middleware to add user to context
const withUser = os.middleware(async ({ next }) => {
  const user = await getCurrentUser();

  return next({
    context: { user },
  });
});

// Use in handler
const getEmployees = os
  .use(withUser)
  .handler(async ({ context }) => {
    // context.user is available
    console.log("Current user:", context.user.id);
  });
```

## Practical Example: Database Connection

### Define Context

```typescript
// src/ipc/context.ts
import { os } from "@orpc/server";
import { getDb } from "@/db";

// Initial context: static configuration
export const withContext = os.$context<{
  // Environment variables
  env: {
    NODE_ENV: "development" | "production";
    DB_PATH: string;
  };
  // Request tracking
  requestId: string;
  // User info (filled by middleware)
  user?: {
    id: number;
    role: "admin" | "user" | "guest";
  };
}>();
```

### Create Database Middleware

```typescript
// src/ipc/middleware/db.ts
import { os } from "@orpc/server";
import { getDb } from "@/db";

export const withDatabase = os.middleware(async ({ next, context }) => {
  // Get database connection
  const db = await getDb();

  // Pass to execution context
  return next({
    context: {
      ...context,
      db,
    },
  });
});
```

### Create Auth Middleware

```typescript
// src/ipc/middleware/auth.ts
import { os } from "@orpc/server";
import { ORPCError } from "@orpc/server";

export const requireAuth = os.middleware(async ({ next, context }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    });
  }

  return next();
});

export const requireRole = (role: "admin" | "user") =>
  os.middleware(async ({ next, context }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      });
    }

    if (context.user.role !== role && context.user.role !== "admin") {
      throw new ORPCError("FORBIDDEN", {
        message: `Role '${role}' required`,
      });
    }

    return next();
  });
```

### Use Middleware in Handlers

```typescript
// src/ipc/database/handlers.ts
import { withContext } from "@/ipc/context";
import { withDatabase } from "@/ipc/middleware/db";
import { requireAuth, requireRole } from "@/ipc/middleware/auth";
import { employees } from "@/db/schema";

export const getEmployees = withContext
  .use(withDatabase)
  .use(requireAuth)
  .handler(async ({ context }) => {
    // context.db is available
    // context.user is available
    return context.db.select().from(employees);
  });

export const createEmployee = withContext
  .use(withDatabase)
  .use(requireRole("admin")) // Only admins
  .input(createEmployeeSchema)
  .handler(async ({ input, context }) => {
    return context.db.insert(employees).values(input).returning();
  });
```

## Client-Side: Passing Context

```typescript
// src/ipc/manager.ts
import { createORPCClient } from "@orpc/client";
import { v4 as uuid } from "uuid";

class IPCManager {
  private client: ReturnType<typeof createORPCClient> | null = null;

  init() {
    // ... initialization

    // Add context to all calls
    this.client = createORPCClient(link, {
      context: {
        env: { NODE_ENV: import.meta.env.MODE },
        requestId: uuid(),
      },
    });
  }
}
```

## Type-Safe Context

### Define Context Types

```typescript
// src/ipc/types.ts
export interface AppContext {
  env: {
    NODE_ENV: "development" | "production";
    DB_PATH: string;
  };
  requestId: string;
  user?: {
    id: number;
    email: string;
    role: "admin" | "user";
  };
  db?: ReturnType<typeof import("@/db").getDb>;
}

export type AppOS = typeof import("@/ipc/context").withContext;
```

### Infer Context in Handlers

```typescript
import type { AppOS, AppContext } from "@/ipc/types";
import type { InferRouterCurrentContexts } from "@orpc/server";

type CurrentContexts = InferRouterCurrentContexts<AppOS>;
type GetEmployeesContext = CurrentContexts["database"]["getEmployees"];
```

## Best Practices

| Practice | Do | Don't |
|----------|-----|-------|
| Context | Keep it simple | Too many fields |
| Middleware | Use for cross-cutting concerns | Duplicate logic |
| Auth | Use middleware | Check in every handler |
| DB | Use context for connection | Create new connection each time |
| Typing | Export context types | Use `any` |

## Example: Full Setup

```typescript
// src/ipc/context.ts
import { os } from "@orpc/server";

export const baseOS = os.$context<{
  env: {
    NODE_ENV: "development" | "production";
  };
  requestId: string;
  user?: {
    id: number;
    role: "admin" | "user";
  };
}>();

// src/ipc/middleware/index.ts
export { withDatabase } from "./db";
export { requireAuth, requireRole } from "./auth";

// src/ipc/database/handlers.ts
import { baseOS } from "../context";
import { withDatabase, requireAuth } from "../middleware";

export const getEmployees = baseOS
  .use(withDatabase)
  .use(requireAuth)
  .handler(async ({ context }) => {
    return context.db.select().from(employees);
  });
```

## Related Documents

- [Setup Guide](./setup.md) - Basic setup
- [Error Handling](./error-handling.md) - Error handling with context
- [Contracts](./contracts.md) - Input/output validation
