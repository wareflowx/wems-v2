# Contract-First Development

This guide covers contract-first development with ORPC, using Zod for validation and type safety.

## What is Contract-First?

Contract-first means defining your API interface **before** implementing the logic:

1. **Define contract** - Input/output types with Zod
2. **Implement handler** - Business logic that fulfills the contract
3. **Automatic validation** - ORPC validates automatically

## Benefits

- **Type Safety**: Full TypeScript inference
- **Runtime Validation**: Zod validates before handler runs
- **Documentation**: Contract serves as API documentation
- **Client/Server Sync**: Both use same types

## Step-by-Step

### 1. Install Dependencies

```bash
npm install zod
# or
npm install valibot
```

### 2. Define Contract Schemas

```typescript
// src/ipc/database/schemas.ts
import { z } from "zod";

// Employee schemas
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  positionId: z.number().int().positive().optional(),
  workLocationId: z.number().int().positive().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
  hireDate: z.string().datetime(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ hireDate: true })
  .partial()
  .merge(z.object({ id: z.number().int().positive() }));

export const deleteEmployeeSchema = z.object({
  id: z.number().int().positive(),
});

// Output schemas
export const employeeSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  positionId: z.number().int().positive().nullable(),
  workLocationId: z.number().int().positive().nullable(),
  department: z.string().nullable(),
  status: z.string(),
  hireDate: z.string(),
  terminationDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const employeeListSchema = z.array(employeeSchema);
```

### 3. Create Procedures with Contracts

```typescript
// src/ipc/database/handlers.ts
import { os } from "@orpc/server";
import { getDb } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  deleteEmployeeSchema,
  employeeSchema,
  employeeListSchema,
} from "./schemas";

// List employees - no input needed
export const getEmployees = os
  .output(employeeListSchema)
  .handler(async () => {
    const db = await getDb();
    return db.select().from(employees).orderBy(employees.id);
  });

// Get single employee
export const getEmployeeById = os
  .input(z.object({ id: z.number().int().positive() }))
  .output(employeeSchema)
  .handler(async ({ input }) => {
    const db = await getDb();
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, input.id));

    if (!employee) {
      throw new Error("Employee not found");
    }

    return employee;
  });

// Create employee - validates input automatically
export const createEmployee = os
  .input(createEmployeeSchema)
  .output(employeeSchema)
  .handler(async ({ input }) => {
    const db = await getDb();
    const [employee] = await db
      .insert(employees)
      .values(input)
      .returning();

    return employee;
  });

// Update employee
export const updateEmployee = os
  .input(updateEmployeeSchema)
  .output(employeeSchema)
  .handler(async ({ input }) => {
    const db = await getDb();
    const { id, ...data } = input;

    const [employee] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(employees.id, id))
      .returning();

    return employee;
  });

// Delete employee
export const deleteEmployee = os
  .input(deleteEmployeeSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    const db = await getDb();
    await db.delete(employees).where(eq(employees.id, input.id));
    return { success: true };
  });
```

### 4. Organize in Router

```typescript
// src/ipc/database/index.ts
import * as handlers from "./handlers";

export const database = {
  getEmployees: handlers.getEmployees,
  getEmployeeById: handlers.getEmployeeById,
  createEmployee: handlers.createEmployee,
  updateEmployee: handlers.updateEmployee,
  deleteEmployee: handlers.deleteEmployee,
  // ... other handlers
};
```

## Advanced: Using @orpc/contract

For more formal contract-first development:

```typescript
// src/ipc/contracts.ts
import { oc } from "@orpc/contract";
import { z } from "zod";

// Define contract
export const employeeContract = oc
  .input(
    z.object({
      id: z.number().int().positive(),
    })
  )
  .output(
    z.object({
      id: z.number().int().positive(),
      firstName: z.string(),
      lastName: z.string(),
    })
  );

// Use in handler
export const getEmployee = os
  .contract(employeeContract)
  .handler(async ({ input }) => {
    // Implementation
    return { id: input.id, firstName: "John", lastName: "Doe" };
  });
```

## Type Inference

### On Server

Types are automatically inferred:

```typescript
// Input/output types inferred from schemas
type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
type Employee = z.infer<typeof employeeSchema>;
```

### On Client

Use utility types:

```typescript
import type { InferClientInputs, InferClientOutputs } from "@orpc/client";

// Get input types from client
type GetEmployeesInput = InferClientInputs<typeof client>["database"]["getEmployees"];

// Get output types from client
type EmployeeList = InferClientOutputs<typeof client>["database"]["getEmployees"];
```

## Validation Error Handling

Customize validation error messages:

```typescript
export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});
```

## Best Practices

| Practice | Do | Don't |
|----------|-----|-------|
| Schemas | Define in separate file | Mix with handlers |
| Naming | Use descriptive names | Single letter names |
| Validation | Specific error messages | Generic errors |
| Types | Export for client use | Keep internal |
| Contracts | Use for public APIs | Over-engineering |

## Related Documents

- [Setup Guide](./setup.md) - Basic setup
- [Error Handling](./error-handling.md) - Error interceptors
- [Context](./context.md) - Dependency injection
