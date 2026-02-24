# Error Handling Best Practices

This guide covers error handling in ORPC, including interceptors, custom errors, and best practices.

## Why Error Handling Matters

- **User Experience**: Graceful error messages
- **Debugging**: Clear error logs for developers
- **Type Safety**: Proper error typing for clients

## Error Interceptors

### Server-Side Interceptors

Add interceptors when creating the RPCHandler:

```typescript
// src/ipc/handler.ts
import { RPCHandler } from "@orpc/server/message-port";
import { onError, ORPCError } from "@orpc/server";
import { router } from "./router";

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    // Global error handler
    onError((error, { path, input, context }) => {
      console.error(`[ORPC Error] ${path}:`, {
        message: error.message,
        stack: error.stack,
        input,
        context: context?.userId,
      });

      // Don't expose internal errors to client
      if (error instanceof ORPCError) {
        return error; // Already formatted
      }

      // Return a generic error
      return new ORPCError("INTERNAL_ERROR", {
        message: "An unexpected error occurred",
      });
    }),
  ],
});
```

### Client-Side Interceptors

Add interceptors when creating the client:

```typescript
// src/ipc/manager.ts
import { createORPCClient } from "@orpc/client";
import { onError } from "@orpc/client";

const client = createORPCClient(link, {
  interceptors: [
    onError((error, { path }) => {
      console.error(`[ORPC Client Error] ${path}:`, error);

      // Show user-friendly message
      if (error.code === "NETWORK_ERROR") {
        toast.error("Connection lost. Please check your internet.");
      } else if (error.code === "TIMEOUT") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }),
  ],
});
```

## Custom Error Codes

Define custom error codes for your application:

```typescript
// src/lib/orpc-errors.ts
import { ORPCError } from "@orpc/server";

// Database errors
export class DatabaseError extends ORPCError {
  constructor(message: string, details?: unknown) {
    super("DATABASE_ERROR", { message, details });
  }
}

// Auth errors
export class UnauthorizedError extends ORPCError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", { message });
  }
}

// Validation errors
export class ValidationError extends ORPCError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", { message, details });
  }
}
```

## Using Custom Errors in Handlers

```typescript
// src/ipc/database/handlers.ts
import { os } from "@orpc/server";
import { getDb } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DatabaseError } from "@/lib/orpc-errors";

export const getEmployees = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(employees);
  } catch (error) {
    console.error("[DB Error] getEmployees:", error);
    throw new DatabaseError("Failed to fetch employees", error);
  }
});
```

## Error Type Inference

### Server-Side: Define Error Types

```typescript
// src/ipc/router.ts
import { os } from "@orpc/server";
import { DatabaseError, UnauthorizedError } from "@/lib/orpc-errors";

// Base procedure with error types
const baseError = os.$outputError<DatabaseError | UnauthorizedError>();
```

### Client-Side: Infer Error Types

```typescript
import type { InferClientErrors } from "@orpc/client";
import { ipc } from "./manager";

type ClientErrors = InferClientErrors<typeof ipc.client>;

// Use in error boundary
type EmployeeErrors = ClientErrors["database"]["getEmployees"];
```

## Global Error Boundary

In React, wrap your app with an error boundary:

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    toast.error("An unexpected error occurred");
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Best Practices Summary

| Practice | Do | Don't |
|----------|-----|-------|
| Logging | Log errors with context | Expose stack traces to clients |
| Error Codes | Use specific error codes | Return generic "Error" |
| User Messages | Show user-friendly messages | Show technical details |
| Type Safety | Infer error types | Use `any` for errors |
| Recovery | Provide retry mechanisms | Fail silently |

## Related Documents

- [Setup Guide](./setup.md) - Basic setup
- [Contracts](./contracts.md) - Contract-first validation
- [Context](./context.md) - Context for user info
