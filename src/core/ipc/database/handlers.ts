import { os } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/core/db";
import {
  attachments,
  caces,
  contracts,
  contractTypes,
  departments,
  employees,
  media,
  medicalVisits,
  positions,
  posts,
  settings,
  workLocations,
} from "@/core/db/schema";
import {
  saveFile,
  deleteFile,
  readFile,
  generateStoredFileName,
  getMediaPath,
  getAttachmentPath,
} from "@/core/lib/file-storage";
import { randomUUID } from "node:crypto";
import {
  createAttachmentInputSchema,
  createCaceInputSchema,
  createContractTypeInputSchema,
  createDepartmentInputSchema,
  createEmployeeInputSchema,
  createMedicalVisitInputSchema,
  createMediaInputSchema,
  createPositionInputSchema,
  createPostInputSchema,
  createWorkLocationInputSchema,
  deleteAttachmentInputSchema,
  deleteCaceInputSchema,
  deleteContractTypeInputSchema,
  deleteDepartmentInputSchema,
  deleteEmployeeInputSchema,
  deleteMedicalVisitInputSchema,
  deleteMediaInputSchema,
  deletePositionInputSchema,
  deleteWorkLocationInputSchema,
  getAttachmentInputSchema,
  getAttachmentsInputSchema,
  getMediaInputSchema,
  updateCaceInputSchema,
  updateContractTypeInputSchema,
  updateDepartmentInputSchema,
  updateEmployeeInputSchema,
  updateMedicalVisitInputSchema,
  updatePositionInputSchema,
  updateSettingsInputSchema,
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

    // Insert employee first
    const [newEmployee] = await db
      .insert(employees)
      .values(employeeData)
      .returning();

    // Then insert contract with the employee's ID
    // Use try-catch with manual rollback to ensure atomicity
    try {
      await db.insert(contracts).values({
        employeeId: newEmployee.id,
        contractType,
        startDate: contractStartDate || employeeData.hireDate,
        endDate: contractEndDate || null,
        isActive: true,
      });
    } catch (contractError) {
      // Rollback: delete the employee if contract creation fails
      await db.delete(employees).where(eq(employees.id, newEmployee.id));
      throw contractError;
    }

    return newEmployee;
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
    // Validate input
    const validatedData = getMediaInputSchema.parse(input);
    const db = await getDb();
    const [result] = await db
      .select()
      .from(media)
      .where(eq(media.id, validatedData.id));
    return result || null;
  } catch (error) {
    console.error("Error in getMediaById:", error);
    throw error;
  }
});

export const createMedia = os.handler(async ({ input }) => {
  try {
    // Validate input with schema
    const validatedData = createMediaInputSchema.parse(input);
    const db = await getDb();

    // Generate UUID for the file
    const id = validatedData.id || randomUUID();

    // If file data is provided (base64), save it
    let storedName: string | undefined;
    let filePath: string | undefined;

    if (validatedData.fileData && validatedData.fileName) {
      // Decode base64 to buffer
      const buffer = Buffer.from(validatedData.fileData, "base64");
      storedName = generateStoredFileName(id, validatedData.fileName);
      filePath = getMediaPath(validatedData.type || "documents", storedName);

      // Save file to disk first
      try {
        saveFile(buffer, filePath);
      } catch (fileError) {
        // DB not touched yet, just throw
        throw new Error("Failed to save file to disk");
      }
    }

    // Insert record to DB
    try {
      const [newMedia] = await db
        .insert(media)
        .values({
          id,
          name: validatedData.name,
          type: validatedData.type,
          fileName: validatedData.fileName,
          mimeType: validatedData.mimeType,
          size: validatedData.size,
          filePath: filePath,
        })
        .returning();

      return newMedia;
    } catch (dbError) {
      // Rollback: delete the file if DB insert failed
      if (filePath) {
        try {
          deleteFile(filePath);
        } catch {
          // Ignore cleanup error
        }
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error in createMedia:", error);
    throw error;
  }
});

export const deleteMedia = os.handler(async ({ input }) => {
  try {
    // Validate input
    const validatedData = deleteMediaInputSchema.parse(input);
    const db = await getDb();

    // First get the media to find the file path
    const [mediaRecord] = await db
      .select()
      .from(media)
      .where(eq(media.id, validatedData.id));

    if (mediaRecord?.filePath) {
      // Delete file from disk
      deleteFile(mediaRecord.filePath);
    }

    // Delete record from DB
    await db.delete(media).where(eq(media.id, validatedData.id));

    return { success: true };
  } catch (error) {
    console.error("Error in deleteMedia:", error);
    throw error;
  }
});

export const downloadMedia = os.handler(async ({ input }) => {
  try {
    // Validate input
    const validatedData = getMediaInputSchema.parse(input);
    const db = await getDb();

    // Get the media record
    const [mediaRecord] = await db
      .select()
      .from(media)
      .where(eq(media.id, validatedData.id));

    if (!mediaRecord) {
      throw new Error("Media not found");
    }

    if (!mediaRecord.filePath) {
      throw new Error("No file associated with this media");
    }

    // Read file from disk
    const buffer = readFile(mediaRecord.filePath);

    if (!buffer) {
      throw new Error("File is missing from storage");
    }

    // Return as base64
    return {
      ...mediaRecord,
      fileData: buffer.toString("base64"),
    };
  } catch (error) {
    console.error("Error in downloadMedia:", error);
    throw error;
  }
});

// Attachment handlers
export const getAttachments = os.handler(async ({ input }) => {
  try {
    // Validate input
    const validatedData = getAttachmentsInputSchema.parse(input || {});
    const db = await getDb();
    let query = db.select().from(attachments);

    if (validatedData?.employeeId && validatedData?.entityType) {
      return await query
        .where(
          and(
            eq(attachments.employeeId, validatedData.employeeId),
            eq(attachments.entityType, validatedData.entityType)
          )
        )
        .orderBy(desc(attachments.createdAt));
    }

    if (validatedData?.employeeId) {
      return await query
        .where(eq(attachments.employeeId, validatedData.employeeId))
        .orderBy(desc(attachments.createdAt));
    }

    if (validatedData?.entityType) {
      return await query
        .where(eq(attachments.entityType, validatedData.entityType))
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
    // Validate input
    const validatedData = getAttachmentInputSchema.parse(input);
    const db = await getDb();
    const [result] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, validatedData.id));
    return result || null;
  } catch (error) {
    console.error("Error in getAttachmentById:", error);
    throw error;
  }
});

export const createAttachment = os.handler(async ({ input }) => {
  try {
    // Validate input with schema
    const validatedData = createAttachmentInputSchema.parse(input);
    const db = await getDb();

    // Generate UUID for the file
    const id = validatedData.id || randomUUID();

    // If file data is provided (base64), save it
    let storedName: string | undefined;
    let filePath: string | undefined;

    if (validatedData.fileData && validatedData.originalName && validatedData.employeeId) {
      // Decode base64 to buffer
      const buffer = Buffer.from(validatedData.fileData, "base64");
      storedName = generateStoredFileName(id, validatedData.originalName);
      filePath = getAttachmentPath(
        validatedData.entityType,
        validatedData.employeeId,
        storedName,
        validatedData.employeeName
      );

      // Save file to disk first
      try {
        saveFile(buffer, filePath);
      } catch (fileError) {
        // DB not touched yet, just throw
        throw new Error("Failed to save file to disk");
      }
    }

    // Insert record to DB
    try {
      const [newAttachment] = await db
        .insert(attachments)
        .values({
          id,
          employeeId: validatedData.employeeId,
          entityType: validatedData.entityType,
          entityId: validatedData.entityId,
          originalName: validatedData.originalName,
          storedName,
          mimeType: validatedData.mimeType,
          size: validatedData.size,
          filePath,
        })
        .returning();

      return newAttachment;
    } catch (dbError) {
      // Rollback: delete the file if DB insert failed
      if (filePath) {
        try {
          deleteFile(filePath);
        } catch {
          // Ignore cleanup error
        }
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error in createAttachment:", error);
    throw error;
  }
});

export const deleteAttachment = os.handler(async ({ input }) => {
  try {
    // Validate input
    const validatedData = deleteAttachmentInputSchema.parse(input);
    const db = await getDb();

    // First get the attachment to find the file path
    const [attachmentRecord] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, validatedData.id));

    if (attachmentRecord?.filePath) {
      // Delete file from disk
      deleteFile(attachmentRecord.filePath);
    }

    // Delete record from DB
    await db.delete(attachments).where(eq(attachments.id, validatedData.id));

    return { success: true };
  } catch (error) {
    console.error("Error in deleteAttachment:", error);
    throw error;
  }
});

export const downloadAttachment = os.handler(async ({ input }) => {
  try {
    // Validate input
    const validatedData = getAttachmentInputSchema.parse(input);
    const db = await getDb();

    // Get the attachment record
    const [attachmentRecord] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, validatedData.id));

    if (!attachmentRecord) {
      throw new Error("Attachment not found");
    }

    if (!attachmentRecord.filePath) {
      throw new Error("No file associated with this attachment");
    }

    // Read file from disk
    const buffer = readFile(attachmentRecord.filePath);

    if (!buffer) {
      throw new Error("File is missing from storage");
    }

    // Return as base64
    return {
      ...attachmentRecord,
      fileData: buffer.toString("base64"),
    };
  } catch (error) {
    console.error("Error in downloadAttachment:", error);
    throw error;
  }
});

// Department handlers
export const getDepartments = os.handler(async () => {
  try {
    const db = await getDb();
    const allDepartments = await db.select().from(departments).where(eq(departments.isActive, 1)).orderBy(departments.name);
    return allDepartments;
  } catch (error) {
    console.error("Error in getDepartments:", error);
    throw error;
  }
});

export const createDepartment = os.handler(async ({ input }) => {
  try {
    const validatedData = createDepartmentInputSchema.parse(input);
    const db = await getDb();
    const [newDepartment] = await db.insert(departments).values(validatedData).returning();
    return newDepartment;
  } catch (error) {
    console.error("Error in createDepartment:", error);
    throw error;
  }
});

export const updateDepartment = os.handler(async ({ input }) => {
  try {
    const validatedData = updateDepartmentInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db.update(departments).set({ name: validatedData.name, code: validatedData.code, color: validatedData.color, isActive: validatedData.isActive }).where(eq(departments.id, validatedData.id)).returning();
    return updated;
  } catch (error) {
    console.error("Error in updateDepartment:", error);
    throw error;
  }
});

export const deleteDepartment = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteDepartmentInputSchema.parse(input);
    const db = await getDb();
    await db.delete(departments).where(eq(departments.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteDepartment:", error);
    throw error;
  }
});

// Contract Type handlers
export const getContractTypes = os.handler(async () => {
  try {
    const db = await getDb();
    const allTypes = await db.select().from(contractTypes).where(eq(contractTypes.isActive, 1)).orderBy(contractTypes.name);
    return allTypes;
  } catch (error) {
    console.error("Error in getContractTypes:", error);
    throw error;
  }
});

export const createContractType = os.handler(async ({ input }) => {
  try {
    const validatedData = createContractTypeInputSchema.parse(input);
    const db = await getDb();
    const [newType] = await db.insert(contractTypes).values(validatedData).returning();
    return newType;
  } catch (error) {
    console.error("Error in createContractType:", error);
    throw error;
  }
});

export const updateContractType = os.handler(async ({ input }) => {
  try {
    const validatedData = updateContractTypeInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db.update(contractTypes).set({ name: validatedData.name, code: validatedData.code, color: validatedData.color, isActive: validatedData.isActive }).where(eq(contractTypes.id, validatedData.id)).returning();
    return updated;
  } catch (error) {
    console.error("Error in updateContractType:", error);
    throw error;
  }
});

export const deleteContractType = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteContractTypeInputSchema.parse(input);
    const db = await getDb();
    await db.delete(contractTypes).where(eq(contractTypes.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteContractType:", error);
    throw error;
  }
});

// CACES handlers
export const getCaces = os.handler(async () => {
  try {
    const db = await getDb();
    const allCaces = await db.select().from(caces).orderBy(desc(caces.expirationDate));
    return allCaces;
  } catch (error) {
    console.error("Error in getCaces:", error);
    throw error;
  }
});

export const getCacesByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeCaces = await db.select().from(caces).where(eq(caces.employeeId, input.employeeId)).orderBy(desc(caces.expirationDate));
    return employeeCaces;
  } catch (error) {
    console.error("Error in getCacesByEmployee:", error);
    throw error;
  }
});

export const createCace = os.handler(async ({ input }) => {
  try {
    const validatedData = createCaceInputSchema.parse(input);
    const db = await getDb();
    const [newCace] = await db.insert(caces).values(validatedData).returning();
    return newCace;
  } catch (error) {
    console.error("Error in createCace:", error);
    throw error;
  }
});

export const updateCace = os.handler(async ({ input }) => {
  try {
    const validatedData = updateCaceInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db.update(caces).set({ category: validatedData.category, dateObtained: validatedData.dateObtained, expirationDate: validatedData.expirationDate, attachmentId: validatedData.attachmentId }).where(eq(caces.id, validatedData.id)).returning();
    return updated;
  } catch (error) {
    console.error("Error in updateCace:", error);
    throw error;
  }
});

export const deleteCace = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteCaceInputSchema.parse(input);
    const db = await getDb();
    await db.delete(caces).where(eq(caces.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteCace:", error);
    throw error;
  }
});

// Attachment by entity handler
export const getAttachmentsByEntity = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const entityAttachments = await db.select().from(attachments).where(and(eq(attachments.entityType, input.entityType), eq(attachments.entityId, input.entityId)));
    return entityAttachments;
  } catch (error) {
    console.error("Error in getAttachmentsByEntity:", error);
    throw error;
  }
});

// Attachment by type handler
export const getAttachmentsByType = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const entityAttachments = await db.select().from(attachments).where(eq(attachments.entityType, input.entityType)).orderBy(desc(attachments.createdAt));
    return entityAttachments;
  } catch (error) {
    console.error("Error in getAttachmentsByType:", error);
    throw error;
  }
});

export const getAttachmentsByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeAttachments = await db.select().from(attachments).where(eq(attachments.employeeId, input.employeeId)).orderBy(desc(attachments.createdAt));
    return employeeAttachments;
  } catch (error) {
    console.error("Error in getAttachmentsByEmployee:", error);
    throw error;
  }
});

// Medical Visit handlers
export const getMedicalVisits = os.handler(async () => {
  try {
    const db = await getDb();
    const allVisits = await db.select().from(medicalVisits).orderBy(desc(medicalVisits.scheduledDate));
    return allVisits;
  } catch (error) {
    console.error("Error in getMedicalVisits:", error);
    throw error;
  }
});

export const getMedicalVisitsByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeVisits = await db.select().from(medicalVisits).where(eq(medicalVisits.employeeId, input.employeeId)).orderBy(desc(medicalVisits.scheduledDate));
    return employeeVisits;
  } catch (error) {
    console.error("Error in getMedicalVisitsByEmployee:", error);
    throw error;
  }
});

export const createMedicalVisit = os.handler(async ({ input }) => {
  try {
    const validatedData = createMedicalVisitInputSchema.parse(input);
    const db = await getDb();
    const [newVisit] = await db.insert(medicalVisits).values(validatedData).returning();
    return newVisit;
  } catch (error) {
    console.error("Error in createMedicalVisit:", error);
    throw error;
  }
});

export const updateMedicalVisit = os.handler(async ({ input }) => {
  try {
    const validatedData = updateMedicalVisitInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db.update(medicalVisits).set({ type: validatedData.type, scheduledDate: validatedData.scheduledDate, actualDate: validatedData.actualDate, status: validatedData.status, fitnessStatus: validatedData.fitnessStatus, attachmentId: validatedData.attachmentId }).where(eq(medicalVisits.id, validatedData.id)).returning();
    return updated;
  } catch (error) {
    console.error("Error in updateMedicalVisit:", error);
    throw error;
  }
});

export const deleteMedicalVisit = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteMedicalVisitInputSchema.parse(input);
    const db = await getDb();
    await db.delete(medicalVisits).where(eq(medicalVisits.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteMedicalVisit:", error);
    throw error;
  }
});

// Settings handlers
export const getSettings = os.handler(async () => {
  try {
    const db = await getDb();
    const [result] = await db.select().from(settings).where(eq(settings.id, 1));
    return result || null;
  } catch (error) {
    console.error("Error in getSettings:", error);
    throw error;
  }
});

export const updateSettings = os.handler(async ({ input }) => {
  try {
    const validatedData = updateSettingsInputSchema.parse(input);
    const db = await getDb();

    console.log("Updating settings with:", validatedData);

    // Check if settings exist
    const [existing] = await db.select().from(settings).where(eq(settings.id, 1));

    if (!existing) {
      // Create default settings
      const [created] = await db.insert(settings).values({
        id: 1,
        ...validatedData,
      }).returning();
      return created;
    }

    // Update existing settings
    const [updated] = await db
      .update(settings)
      .set(validatedData)
      .where(eq(settings.id, 1))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateSettings:", error);
    throw error;
  }
});
