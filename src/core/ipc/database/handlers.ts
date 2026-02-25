import { os } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/core/db";
import {
  attachments,
  contracts,
  employees,
  media,
  positions,
  posts,
  workLocations,
} from "@/core/db/schema";
import {
  createEmployeeInputSchema,
  createPositionInputSchema,
  createPostInputSchema,
  createWorkLocationInputSchema,
  deleteEmployeeInputSchema,
  deletePositionInputSchema,
  deleteWorkLocationInputSchema,
  updateEmployeeInputSchema,
  updatePositionInputSchema,
  updateWorkLocationInputSchema,
} from "./schemas";

// Posts handlers
export const getPosts = os.handler(async () => {
  try {
    const db = await getDb();
    const allPosts = await db.select().from(posts).orderBy(posts.id);
    return allPosts;
  } catch (error) {
    console.error("Error in getPosts:", error);
    throw error;
  }
});

export const createPost = os.handler(async ({ input }) => {
  try {
    const validatedData = createPostInputSchema.parse(input);
    const db = await getDb();
    const [newPost] = await db.insert(posts).values(validatedData).returning();
    return newPost;
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
});

// Positions handlers
export const getPositions = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(positions).orderBy(positions.id);
  } catch (error) {
    console.error("Error in getPositions:", error);
    throw error;
  }
});

export const createPosition = os.handler(async ({ input }) => {
  try {
    const validatedData = createPositionInputSchema.parse(input);
    const db = await getDb();
    const [newPosition] = await db
      .insert(positions)
      .values(validatedData)
      .returning();
    return newPosition;
  } catch (error) {
    console.error("Error in createPosition:", error);
    throw error;
  }
});

export const updatePosition = os.handler(async ({ input }) => {
  try {
    const validatedData = updatePositionInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db
      .update(positions)
      .set({
        code: validatedData.code,
        name: validatedData.name,
        color: validatedData.color,
        isActive: validatedData.isActive,
      })
      .where(eq(positions.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updatePosition:", error);
    throw error;
  }
});

export const deletePosition = os.handler(async ({ input }) => {
  try {
    const validatedData = deletePositionInputSchema.parse(input);
    const db = await getDb();
    await db.delete(positions).where(eq(positions.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deletePosition:", error);
    throw error;
  }
});

// Work Locations handlers
export const getWorkLocations = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(workLocations).orderBy(workLocations.id);
  } catch (error) {
    console.error("Error in getWorkLocations:", error);
    throw error;
  }
});

export const createWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = createWorkLocationInputSchema.parse(input);
    const db = await getDb();
    const [newWorkLocation] = await db
      .insert(workLocations)
      .values(validatedData)
      .returning();
    return newWorkLocation;
  } catch (error) {
    console.error("Error in createWorkLocation:", error);
    throw error;
  }
});

export const updateWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = updateWorkLocationInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db
      .update(workLocations)
      .set({
        code: validatedData.code,
        name: validatedData.name,
        color: validatedData.color,
        isActive: validatedData.isActive,
      })
      .where(eq(workLocations.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateWorkLocation:", error);
    throw error;
  }
});

export const deleteWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteWorkLocationInputSchema.parse(input);
    const db = await getDb();
    await db
      .delete(workLocations)
      .where(eq(workLocations.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkLocation:", error);
    throw error;
  }
});

// Employees handlers
export const getEmployees = os.handler(async () => {
  console.log("[DB-HANDLER] getEmployees called!");
  try {
    const db = await getDb();
    console.log("[DB-HANDLER] getEmployees: DB obtained, querying...");
    const result = await db.select().from(employees).orderBy(employees.id);
    console.log(
      "[DB-HANDLER] getEmployees: Query complete, found",
      result.length,
      "employees"
    );
    return result;
  } catch (error) {
    console.error("Error in getEmployees:", error);
    throw error;
  }
});

export const getEmployeeById = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, input.id));
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  } catch (error) {
    console.error("Error in getEmployeeById:", error);
    throw error;
  }
});

export const createEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = createEmployeeInputSchema.parse(input);
    const db = await getDb();

    // Extract contract info from input
    const {
      contractType,
      contractStartDate,
      contractEndDate,
      ...employeeData
    } = validatedData;

    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      const [newEmployee] = await tx
        .insert(employees)
        .values(employeeData)
        .returning();

      await tx.insert(contracts).values({
        employeeId: newEmployee.id,
        contractType,
        startDate: contractStartDate || employeeData.hireDate,
        endDate: contractEndDate || null,
        isActive: true,
      });

      return newEmployee;
    });

    return result;
  } catch (error) {
    console.error("Error in createEmployee:", error);
    throw error;
  }
});

export const updateEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = updateEmployeeInputSchema.parse(input);
    const db = await getDb();

    // Build update object with only provided fields using Partial type
    type EmployeeUpdateKeys =
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "positionId"
      | "workLocationId"
      | "department"
      | "status"
      | "hireDate"
      | "terminationDate";
    const updateData: Partial<Pick<typeof employees, EmployeeUpdateKeys>> = {};
    if (validatedData.firstName !== undefined) {
      updateData.firstName = validatedData.firstName;
    }
    if (validatedData.lastName !== undefined) {
      updateData.lastName = validatedData.lastName;
    }
    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone;
    }
    if (validatedData.positionId !== undefined) {
      updateData.positionId = validatedData.positionId;
    }
    if (validatedData.workLocationId !== undefined) {
      updateData.workLocationId = validatedData.workLocationId;
    }
    if (validatedData.department !== undefined) {
      updateData.department = validatedData.department;
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }
    if (validatedData.hireDate !== undefined) {
      updateData.hireDate = validatedData.hireDate;
    }
    if (validatedData.terminationDate !== undefined) {
      updateData.terminationDate = validatedData.terminationDate;
    }

    const [updated] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateEmployee:", error);
    throw error;
  }
});

export const deleteEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteEmployeeInputSchema.parse(input);
    const db = await getDb();
    await db.delete(employees).where(eq(employees.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteEmployee:", error);
    throw error;
  }
});

// Contracts handlers
export const getContracts = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(contracts).orderBy(desc(contracts.id));
  } catch (error) {
    console.error("Error in getContracts:", error);
    throw error;
  }
});

export const getContractsByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.employeeId, input.employeeId))
      .orderBy(desc(contracts.startDate));
  } catch (error) {
    console.error("Error in getContractsByEmployee:", error);
    throw error;
  }
});

export const getActiveContractByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.employeeId, input.employeeId))
      .orderBy(desc(contracts.id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error in getActiveContractByEmployee:", error);
    throw error;
  }
});

export const createContract = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [newContract] = await db
      .insert(contracts)
      .values({
        employeeId: input.employeeId,
        contractType: input.contractType,
        startDate: input.startDate,
        endDate: input.endDate || null,
        isActive: input.isActive ?? true,
      })
      .returning();
    return newContract;
  } catch (error) {
    console.error("Error in createContract:", error);
    throw error;
  }
});

export const updateContract = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [updated] = await db
      .update(contracts)
      .set({
        contractType: input.contractType,
        startDate: input.startDate,
        endDate: input.endDate || null,
        isActive: input.isActive,
      })
      .where(eq(contracts.id, input.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateContract:", error);
    throw error;
  }
});

export const deleteContract = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    await db.delete(contracts).where(eq(contracts.id, input.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteContract:", error);
    throw error;
  }
});

// Media handlers
export const getAllMedia = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    if (input?.type) {
      return await db
        .select()
        .from(media)
        .where(eq(media.type, input.type))
        .orderBy(desc(media.createdAt));
    }
    return await db.select().from(media).orderBy(desc(media.createdAt));
  } catch (error) {
    console.error("Error in getAllMedia:", error);
    throw error;
  }
});

export const getMediaById = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [result] = await db
      .select()
      .from(media)
      .where(eq(media.id, input.id));
    return result || null;
  } catch (error) {
    console.error("Error in getMediaById:", error);
    throw error;
  }
});

export const createMedia = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [newMedia] = await db.insert(media).values(input).returning();
    return newMedia;
  } catch (error) {
    console.error("Error in createMedia:", error);
    throw error;
  }
});

export const deleteMedia = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    await db.delete(media).where(eq(media.id, input.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteMedia:", error);
    throw error;
  }
});

// Attachment handlers
export const getAttachments = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    let query = db.select().from(attachments);

    if (input?.employeeId && input?.entityType) {
      return await query
        .where(
          eq(attachments.employeeId, input.employeeId) &&
            eq(attachments.entityType, input.entityType)
        )
        .orderBy(desc(attachments.createdAt));
    }

    if (input?.employeeId) {
      return await query
        .where(eq(attachments.employeeId, input.employeeId))
        .orderBy(desc(attachments.createdAt));
    }

    if (input?.entityType) {
      return await query
        .where(eq(attachments.entityType, input.entityType))
        .orderBy(desc(attachments.createdAt));
    }

    return await query.orderBy(desc(attachments.createdAt));
  } catch (error) {
    console.error("Error in getAttachments:", error);
    throw error;
  }
});

export const getAttachmentById = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [result] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, input.id));
    return result || null;
  } catch (error) {
    console.error("Error in getAttachmentById:", error);
    throw error;
  }
});

export const createAttachment = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [newAttachment] = await db
      .insert(attachments)
      .values(input)
      .returning();
    return newAttachment;
  } catch (error) {
    console.error("Error in createAttachment:", error);
    throw error;
  }
});

export const deleteAttachment = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    await db.delete(attachments).where(eq(attachments.id, input.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAttachment:", error);
    throw error;
  }
});
