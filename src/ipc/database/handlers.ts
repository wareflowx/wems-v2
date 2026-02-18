import { os } from "@orpc/server";
import { getDb } from "@/db";
import { posts, positions, workLocations, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createPostInputSchema, createPositionInputSchema, updatePositionInputSchema, deletePositionInputSchema, createWorkLocationInputSchema, updateWorkLocationInputSchema, deleteWorkLocationInputSchema, createEmployeeInputSchema, updateEmployeeInputSchema, deleteEmployeeInputSchema } from "./schemas";

// Posts handlers
export const getPosts = os.handler(async () => {
  try {
    console.log('getPosts called');
    const db = await getDb();
    console.log('DB obtained:', db);
    const allPosts = await db.select().from(posts).orderBy(posts.id);
    console.log('Posts fetched:', allPosts);
    return allPosts;
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
});

export const createPost = os.handler(async ({ input }) => {
  try {
    console.log('createPost called with input:', input);
    const db = await getDb();
    console.log('DB obtained:', db);
    const validatedData = createPostInputSchema.parse(input);
    console.log('Validated data:', validatedData);
    const [newPost] = await db.insert(posts).values(validatedData).returning();
    console.log('New post created:', newPost);
    return newPost;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
});

// Positions handlers
export const getPositions = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(positions).orderBy(positions.id);
  } catch (error) {
    console.error('Error in getPositions:', error);
    throw error;
  }
});

export const createPosition = os.handler(async ({ input }) => {
  try {
    console.log('createPosition handler called with input:', input);
    const validatedData = createPositionInputSchema.parse(input);
    console.log('Validated data:', validatedData);
    const db = await getDb();
    console.log('DB obtained, inserting...');
    const [newPosition] = await db.insert(positions).values(validatedData).returning();
    console.log('Position created:', newPosition);
    return newPosition;
  } catch (error) {
    console.error('Error in createPosition:', error);
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
    console.error('Error in updatePosition:', error);
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
    console.error('Error in deletePosition:', error);
    throw error;
  }
});

// Work Locations handlers
export const getWorkLocations = os.handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(workLocations).orderBy(workLocations.id);
  } catch (error) {
    console.error('Error in getWorkLocations:', error);
    throw error;
  }
});

export const createWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = createWorkLocationInputSchema.parse(input);
    const db = await getDb();
    const [newWorkLocation] = await db.insert(workLocations).values(validatedData).returning();
    return newWorkLocation;
  } catch (error) {
    console.error('Error in createWorkLocation:', error);
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
    console.error('Error in updateWorkLocation:', error);
    throw error;
  }
});

export const deleteWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteWorkLocationInputSchema.parse(input);
    const db = await getDb();
    await db.delete(workLocations).where(eq(workLocations.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error('Error in deleteWorkLocation:', error);
    throw error;
  }
});

// Employees handlers
export const getEmployees = os.handler(async () => {
  try {
    console.log('[DB] getEmployees called');
    const db = await getDb();
    console.log('[DB] db obtained, fetching employees...');
    const allEmployees = await db.select().from(employees).orderBy(employees.id);
    console.log('[DB] employees fetched:', allEmployees.length);
    return allEmployees;
  } catch (error) {
    console.error('Error in getEmployees:', error);
    throw error;
  }
});

export const getEmployeeById = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const [employee] = await db.select().from(employees).where(eq(employees.id, input.id));
    if (!employee) {
      throw new Error(`Employee with id ${input.id} not found`);
    }
    return employee;
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    throw error;
  }
});

export const createEmployee = os.handler(async ({ input }) => {
  try {
    console.log('[DB] createEmployee called with input:', input);
    const validatedData = createEmployeeInputSchema.parse(input);
    console.log('[DB] validatedData:', validatedData);
    const db = await getDb();
    console.log('[DB] inserting employee...');
    const [newEmployee] = await db.insert(employees).values(validatedData).returning();
    console.log('[DB] employee created:', newEmployee);
    return newEmployee;
  } catch (error) {
    console.error('[DB] Error in createEmployee:', error);
    throw error;
  }
});

export const updateEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = updateEmployeeInputSchema.parse(input);
    const db = await getDb();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (validatedData.firstName !== undefined) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName !== undefined) updateData.lastName = validatedData.lastName;
    if (validatedData.email !== undefined) updateData.email = validatedData.email;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.positionId !== undefined) updateData.positionId = validatedData.positionId;
    if (validatedData.workLocationId !== undefined) updateData.workLocationId = validatedData.workLocationId;
    if (validatedData.contract !== undefined) updateData.contract = validatedData.contract;
    if (validatedData.department !== undefined) updateData.department = validatedData.department;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.hireDate !== undefined) updateData.hireDate = validatedData.hireDate;
    if (validatedData.terminationDate !== undefined) updateData.terminationDate = validatedData.terminationDate;

    const [updated] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Error in updateEmployee:', error);
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
    console.error('Error in deleteEmployee:', error);
    throw error;
  }
});
