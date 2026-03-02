import { os } from "@orpc/server";
import { and, desc, eq, isNull, not } from "drizzle-orm";
import { getDb } from "@/core/db";
import {
  attachments,
  caces,
  contracts,
  contractTypes,
  departments,
  drivingAuthorizations,
  employees,
  media,
  medicalVisits,
  onlineTrainings,
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
  createDrivingAuthorizationInputSchema,
  createEmployeeInputSchema,
  createMedicalVisitInputSchema,
  createMediaInputSchema,
  createOnlineTrainingInputSchema,
  createPositionInputSchema,
  createPostInputSchema,
  createWorkLocationInputSchema,
  deleteAttachmentInputSchema,
  deleteCaceInputSchema,
  deleteContractTypeInputSchema,
  deleteDepartmentInputSchema,
  deleteDrivingAuthorizationInputSchema,
  deleteEmployeeInputSchema,
  deleteMedicalVisitInputSchema,
  deleteMediaInputSchema,
  deleteOnlineTrainingInputSchema,
  deletePositionInputSchema,
  deleteWorkLocationInputSchema,
  getAttachmentInputSchema,
  getAttachmentsInputSchema,
  getMediaInputSchema,
  updateCaceInputSchema,
  updateContractTypeInputSchema,
  updateDepartmentInputSchema,
  updateDrivingAuthorizationInputSchema,
  updateEmployeeInputSchema,
  updateMedicalVisitInputSchema,
  updateOnlineTrainingInputSchema,
  updatePositionInputSchema,
  updateSettingsInputSchema,
  updateWorkLocationInputSchema,
  restoreInputSchema,
  permanentDeleteInputSchema,
} from "./schemas";

// Posts handlers
export const getPosts = os.handler(async () => {
  try {
    const db = await getDb();
    const allPosts = await db
      .select()
      .from(posts)
      .where(isNull(posts.deletedAt))
      .orderBy(posts.id);
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
    return await db
      .select()
      .from(positions)
      .where(isNull(positions.deletedAt))
      .orderBy(positions.id);
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
    await db
      .update(positions)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(positions.id, validatedData.id));
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
    return await db
      .select()
      .from(workLocations)
      .where(isNull(workLocations.deletedAt))
      .orderBy(workLocations.id);
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
      .update(workLocations)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(workLocations.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkLocation:", error);
    throw error;
  }
});

// Employees handlers
export const getEmployees = os.handler(async () => {
  try {
    const db = await getDb();
    const result = await db
      .select()
      .from(employees)
      .where(isNull(employees.deletedAt))
      .orderBy(employees.id);
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
      .where(and(eq(employees.id, input.id), isNull(employees.deletedAt)));
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
    await db
      .update(employees)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(employees.id, validatedData.id));
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
    return await db
      .select()
      .from(contracts)
      .where(isNull(contracts.deletedAt))
      .orderBy(desc(contracts.id));
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
      .where(
        and(
          eq(contracts.employeeId, input.employeeId),
          isNull(contracts.deletedAt)
        )
      )
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
      .where(
        and(
          eq(contracts.employeeId, input.employeeId),
          isNull(contracts.deletedAt)
        )
      )
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
    await db
      .update(contracts)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(contracts.id, input.id));
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
        .where(and(eq(media.type, input.type), isNull(media.deletedAt)))
        .orderBy(desc(media.createdAt));
    }
    return await db
      .select()
      .from(media)
      .where(isNull(media.deletedAt))
      .orderBy(desc(media.createdAt));
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
      .where(and(eq(media.id, validatedData.id), isNull(media.deletedAt)));
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

    // Soft delete - set deletedAt timestamp
    await db
      .update(media)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(media.id, validatedData.id));

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
            eq(attachments.entityType, validatedData.entityType),
            isNull(attachments.deletedAt)
          )
        )
        .orderBy(desc(attachments.createdAt));
    }

    if (validatedData?.employeeId) {
      return await query
        .where(
          and(
            eq(attachments.employeeId, validatedData.employeeId),
            isNull(attachments.deletedAt)
          )
        )
        .orderBy(desc(attachments.createdAt));
    }

    if (validatedData?.entityType) {
      return await query
        .where(
          and(
            eq(attachments.entityType, validatedData.entityType),
            isNull(attachments.deletedAt)
          )
        )
        .orderBy(desc(attachments.createdAt));
    }

    return await db
      .select()
      .from(attachments)
      .where(isNull(attachments.deletedAt))
      .orderBy(desc(attachments.createdAt));
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
      .where(
        and(
          eq(attachments.id, validatedData.id),
          isNull(attachments.deletedAt)
        )
      );
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

    // Soft delete - set deletedAt timestamp
    await db
      .update(attachments)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(attachments.id, validatedData.id));

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
    const allDepartments = await db
      .select()
      .from(departments)
      .where(and(eq(departments.isActive, 1), isNull(departments.deletedAt)))
      .orderBy(departments.name);
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
    await db
      .update(departments)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(departments.id, validatedData.id));
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
    const allTypes = await db
      .select()
      .from(contractTypes)
      .where(and(eq(contractTypes.isActive, 1), isNull(contractTypes.deletedAt)))
      .orderBy(contractTypes.name);
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
    await db
      .update(contractTypes)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(contractTypes.id, validatedData.id));
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
    const allCaces = await db
      .select()
      .from(caces)
      .where(isNull(caces.deletedAt))
      .orderBy(desc(caces.expirationDate));
    return allCaces;
  } catch (error) {
    console.error("Error in getCaces:", error);
    throw error;
  }
});

export const getCacesByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeCaces = await db
      .select()
      .from(caces)
      .where(
        and(eq(caces.employeeId, input.employeeId), isNull(caces.deletedAt))
      )
      .orderBy(desc(caces.expirationDate));
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
    await db
      .update(caces)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(caces.id, validatedData.id));
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
    const entityAttachments = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.entityType, input.entityType),
          eq(attachments.entityId, input.entityId),
          isNull(attachments.deletedAt)
        )
      );
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
    const entityAttachments = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.entityType, input.entityType),
          isNull(attachments.deletedAt)
        )
      )
      .orderBy(desc(attachments.createdAt));
    return entityAttachments;
  } catch (error) {
    console.error("Error in getAttachmentsByType:", error);
    throw error;
  }
});

export const getAttachmentsByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeAttachments = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.employeeId, input.employeeId),
          isNull(attachments.deletedAt)
        )
      )
      .orderBy(desc(attachments.createdAt));
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
    const allVisits = await db
      .select()
      .from(medicalVisits)
      .where(isNull(medicalVisits.deletedAt))
      .orderBy(desc(medicalVisits.scheduledDate));
    return allVisits;
  } catch (error) {
    console.error("Error in getMedicalVisits:", error);
    throw error;
  }
});

export const getMedicalVisitsByEmployee = os.handler(async ({ input }) => {
  try {
    const db = await getDb();
    const employeeVisits = await db
      .select()
      .from(medicalVisits)
      .where(
        and(
          eq(medicalVisits.employeeId, input.employeeId),
          isNull(medicalVisits.deletedAt)
        )
      )
      .orderBy(desc(medicalVisits.scheduledDate));
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
    await db
      .update(medicalVisits)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(medicalVisits.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteMedicalVisit:", error);
    throw error;
  }
});

// Driving Authorization handlers
export const getDrivingAuthorizations = os.handler(async () => {
  try {
    const db = await getDb();
    const allAuthorizations = await db
      .select()
      .from(drivingAuthorizations)
      .where(isNull(drivingAuthorizations.deletedAt))
      .orderBy(desc(drivingAuthorizations.expirationDate));
    return allAuthorizations;
  } catch (error) {
    console.error("Error in getDrivingAuthorizations:", error);
    throw error;
  }
});

export const getDrivingAuthorizationsByEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = { id: input.employeeId };
    const db = await getDb();
    const authorizations = await db
      .select()
      .from(drivingAuthorizations)
      .where(and(eq(drivingAuthorizations.employeeId, validatedData.id), isNull(drivingAuthorizations.deletedAt)))
      .orderBy(desc(drivingAuthorizations.expirationDate));
    return authorizations;
  } catch (error) {
    console.error("Error in getDrivingAuthorizationsByEmployee:", error);
    throw error;
  }
});

export const createDrivingAuthorization = os.handler(async ({ input }) => {
  try {
    const validatedData = createDrivingAuthorizationInputSchema.parse(input);
    const db = await getDb();
    const [newAuthorization] = await db
      .insert(drivingAuthorizations)
      .values(validatedData)
      .returning();
    return newAuthorization;
  } catch (error) {
    console.error("Error in createDrivingAuthorization:", error);
    throw error;
  }
});

export const updateDrivingAuthorization = os.handler(async ({ input }) => {
  try {
    const validatedData = updateDrivingAuthorizationInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db
      .update(drivingAuthorizations)
      .set(validatedData)
      .where(eq(drivingAuthorizations.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateDrivingAuthorization:", error);
    throw error;
  }
});

export const deleteDrivingAuthorization = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteDrivingAuthorizationInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(drivingAuthorizations)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(drivingAuthorizations.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteDrivingAuthorization:", error);
    throw error;
  }
});

// Online Training handlers
export const getOnlineTrainings = os.handler(async () => {
  try {
    const db = await getDb();
    const allTrainings = await db
      .select()
      .from(onlineTrainings)
      .where(isNull(onlineTrainings.deletedAt))
      .orderBy(desc(onlineTrainings.completionDate));
    return allTrainings;
  } catch (error) {
    console.error("Error in getOnlineTrainings:", error);
    throw error;
  }
});

export const getOnlineTrainingsByEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = { id: input.employeeId };
    const db = await getDb();
    const trainings = await db
      .select()
      .from(onlineTrainings)
      .where(and(eq(onlineTrainings.employeeId, validatedData.id), isNull(onlineTrainings.deletedAt)))
      .orderBy(desc(onlineTrainings.completionDate));
    return trainings;
  } catch (error) {
    console.error("Error in getOnlineTrainingsByEmployee:", error);
    throw error;
  }
});

export const createOnlineTraining = os.handler(async ({ input }) => {
  try {
    const validatedData = createOnlineTrainingInputSchema.parse(input);
    const db = await getDb();
    const [newTraining] = await db
      .insert(onlineTrainings)
      .values(validatedData)
      .returning();
    return newTraining;
  } catch (error) {
    console.error("Error in createOnlineTraining:", error);
    throw error;
  }
});

export const updateOnlineTraining = os.handler(async ({ input }) => {
  try {
    const validatedData = updateOnlineTrainingInputSchema.parse(input);
    const db = await getDb();
    const [updated] = await db
      .update(onlineTrainings)
      .set(validatedData)
      .where(eq(onlineTrainings.id, validatedData.id))
      .returning();
    return updated;
  } catch (error) {
    console.error("Error in updateOnlineTraining:", error);
    throw error;
  }
});

export const deleteOnlineTraining = os.handler(async ({ input }) => {
  try {
    const validatedData = deleteOnlineTrainingInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(onlineTrainings)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(onlineTrainings.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteOnlineTraining:", error);
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

// Alert types
interface Alert {
  id: number;
  type: string;
  employee: string;
  employeeId: number;
  category?: string;
  visitType?: string;
  daysLeft?: number;
  severity: string;
  date: string;
}

interface AlertFilters {
  search?: string;
  severity?: string;
  type?: string;
}

// Get alerts from real database data
export const getAlerts = os.handler(async ({ input }: { input?: AlertFilters }) => {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get settings for alert thresholds
    const [appSettings] = await db.select().from(settings).where(eq(settings.id, 1));
    const cacesDays = appSettings?.cacesDays ?? 30;
    const medicalDays = appSettings?.medicalDays ?? 7;

    const alerts: Alert[] = [];

    // Get all employees for name lookup (excluding soft-deleted)
    const allEmployees = await db.select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
    }).from(employees).where(isNull(employees.deletedAt));

    const employeeMap = new Map(allEmployees.map(e => [e.id, `${e.firstName} ${e.lastName}`]));

    // Get all CACES (excluding soft-deleted)
    if (appSettings?.cacesAlerts !== false) {
      const allCaces = await db.select().from(caces).where(isNull(caces.deletedAt));

      for (const cace of allCaces) {
        const expirationDate = new Date(cace.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);

        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 0) {
          // CACES expired - critical
          alerts.push({
            id: `caces-expired-${cace.id}`,
            type: "CACES expiré",
            employee: employeeMap.get(cace.employeeId) || "Unknown",
            employeeId: cace.employeeId,
            category: cace.category,
            severity: "critical",
            date: cace.expirationDate,
          });
        } else if (daysUntilExpiration <= cacesDays) {
          // CACES expiring soon - warning
          alerts.push({
            id: `caces-warning-${cace.id}`,
            type: "CACES expiration proche",
            employee: employeeMap.get(cace.employeeId) || "Unknown",
            employeeId: cace.employeeId,
            category: cace.category,
            daysLeft: daysUntilExpiration,
            severity: daysUntilExpiration <= 7 ? "critical" : "warning",
            date: cace.expirationDate,
          });
        }
      }
    }

    // Get all Medical Visits (excluding soft-deleted)
    if (appSettings?.medicalAlerts !== false) {
      const allVisits = await db.select().from(medicalVisits).where(isNull(medicalVisits.deletedAt));

      for (const visit of allVisits) {
        const scheduledDate = new Date(visit.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);

        const daysUntilVisit = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (visit.status === "overdue" || (visit.status === "scheduled" && daysUntilVisit < 0)) {
          // Visit overdue - critical
          alerts.push({
            id: `visit-overdue-${visit.id}`,
            type: "Visite en retard",
            employee: employeeMap.get(visit.employeeId) || "Unknown",
            employeeId: visit.employeeId,
            visitType: visit.type,
            severity: "critical",
            date: visit.scheduledDate,
          });
        } else if (visit.status === "scheduled" && daysUntilVisit <= medicalDays) {
          // Visit coming up - info or warning
          alerts.push({
            id: `visit-scheduled-${visit.id}`,
            type: "Visite planifiée",
            employee: employeeMap.get(visit.employeeId) || "Unknown",
            employeeId: visit.employeeId,
            visitType: visit.type,
            daysLeft: daysUntilVisit,
            severity: daysUntilVisit <= 3 ? "warning" : "info",
            date: visit.scheduledDate,
          });
        }
      }
    }

    // Get all Contracts (only if contract alerts enabled, excluding soft-deleted)
    if (appSettings?.contractAlerts) {
      const allContracts = await db.select().from(contracts).where(and(eq(contracts.isActive, true), isNull(contracts.deletedAt)));

      for (const contract of allContracts) {
        if (!contract.endDate) continue;

        const endDate = new Date(contract.endDate);
        endDate.setHours(0, 0, 0, 0);

        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilEnd < 0) {
          // Contract expired - critical
          alerts.push({
            id: `contract-expired-${contract.id}`,
            type: "Contrat expiré",
            employee: employeeMap.get(contract.employeeId) || "Unknown",
            employeeId: contract.employeeId,
            severity: "critical",
            date: contract.endDate,
          });
        } else if (daysUntilEnd <= 30) {
          // Contract expiring soon - warning
          alerts.push({
            id: `contract-warning-${contract.id}`,
            type: "Contrat expiration proche",
            employee: employeeMap.get(contract.employeeId) || "Unknown",
            employeeId: contract.employeeId,
            daysLeft: daysUntilEnd,
            severity: daysUntilEnd <= 7 ? "critical" : "warning",
            date: contract.endDate,
          });
        }
      }
    }

    // Get all Driving Authorizations (excluding soft-deleted)
    const allDrivingAuthorizations = await db
      .select()
      .from(drivingAuthorizations)
      .where(isNull(drivingAuthorizations.deletedAt));

    for (const auth of allDrivingAuthorizations) {
      const expirationDate = new Date(auth.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);

      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration < 0) {
        // Authorization expired - critical
        alerts.push({
          id: `driving-auth-expired-${auth.id}`,
          type: "Autorisation de conduite expirée",
          employee: employeeMap.get(auth.employeeId) || "Unknown",
          employeeId: auth.employeeId,
          category: auth.licenseCategory,
          severity: "critical",
          date: auth.expirationDate,
        });
      } else if (daysUntilExpiration <= cacesDays) {
        // Authorization expiring soon - warning
        alerts.push({
          id: `driving-auth-warning-${auth.id}`,
          type: "Autorisation de conduite expiration proche",
          employee: employeeMap.get(auth.employeeId) || "Unknown",
          employeeId: auth.employeeId,
          category: auth.licenseCategory,
          daysLeft: daysUntilExpiration,
          severity: daysUntilExpiration <= 7 ? "critical" : "warning",
          date: auth.expirationDate,
        });
      }
    }

    // Get all Online Trainings (excluding soft-deleted)
    const allOnlineTrainings = await db
      .select()
      .from(onlineTrainings)
      .where(isNull(onlineTrainings.deletedAt));

    for (const training of allOnlineTrainings) {
      // Check for expired training certifications
      if (training.expirationDate) {
        const expirationDate = new Date(training.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);

        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiration < 0) {
          // Training certification expired - critical
          alerts.push({
            id: `training-expired-${training.id}`,
            type: "Formation expirée",
            employee: employeeMap.get(training.employeeId) || "Unknown",
            employeeId: training.employeeId,
            category: training.trainingName,
            severity: "critical",
            date: training.expirationDate,
          });
        } else if (daysUntilExpiration <= cacesDays) {
          // Training certification expiring soon - warning
          alerts.push({
            id: `training-warning-${training.id}`,
            type: "Formation expiration proche",
            employee: employeeMap.get(training.employeeId) || "Unknown",
            employeeId: training.employeeId,
            category: training.trainingName,
            daysLeft: daysUntilExpiration,
            severity: daysUntilExpiration <= 7 ? "critical" : "warning",
            date: training.expirationDate,
          });
        }
      }

      // Check for in-progress trainings
      if (training.status === "in_progress") {
        alerts.push({
          id: `training-in-progress-${training.id}`,
          type: "Formation en cours",
          employee: employeeMap.get(training.employeeId) || "Unknown",
          employeeId: training.employeeId,
          category: training.trainingName,
          severity: "info",
          date: training.completionDate,
        });
      }
    }

    // Apply filters
    let filteredAlerts = [...alerts];

    if (input?.search) {
      const searchLower = input.search.toLowerCase();
      filteredAlerts = filteredAlerts.filter(
        (alert) =>
          alert.employee.toLowerCase().includes(searchLower) ||
          alert.type.toLowerCase().includes(searchLower)
      );
    }

    if (input?.severity && input.severity !== "all") {
      filteredAlerts = filteredAlerts.filter((alert) => alert.severity === input.severity);
    }

    if (input?.type && input.type !== "all") {
      filteredAlerts = filteredAlerts.filter((alert) => alert.type === input.type);
    }

    // Sort by date descending
    filteredAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filteredAlerts;
  } catch (error) {
    console.error("Error in getAlerts:", error);
    throw error;
  }
});

// ============================================================
// Trash/Restore handlers - Soft delete support
// ============================================================

// Get deleted employees
export const getDeletedEmployees = os.handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(employees)
      .where(not(isNull(employees.deletedAt)))
      .orderBy(desc(employees.deletedAt));
  } catch (error) {
    console.error("Error in getDeletedEmployees:", error);
    throw error;
  }
});

// Restore employee
export const restoreEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = restoreInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(employees)
      .set({ deletedAt: null })
      .where(eq(employees.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in restoreEmployee:", error);
    throw error;
  }
});

// Permanent delete employee (and cascade related records)
export const permanentDeleteEmployee = os.handler(async ({ input }) => {
  try {
    const validatedData = permanentDeleteInputSchema.parse(input);
    const db = await getDb();

    // Get attachments to delete physical files
    const employeeAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.employeeId, validatedData.id));

    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Delete physical files first
      for (const attachment of employeeAttachments) {
        if (attachment.filePath) {
          try {
            deleteFile(attachment.filePath);
          } catch (fileError) {
            console.error("Error deleting attachment file:", fileError);
          }
        }
      }

      // Permanently delete related records
      await tx.delete(contracts).where(eq(contracts.employeeId, validatedData.id));
      await tx.delete(caces).where(eq(caces.employeeId, validatedData.id));
      await tx.delete(medicalVisits).where(eq(medicalVisits.employeeId, validatedData.id));
      await tx.delete(attachments).where(eq(attachments.employeeId, validatedData.id));

      // Permanently delete employee
      await tx.delete(employees).where(eq(employees.id, validatedData.id));
    });

    return { success: true };
  } catch (error) {
    console.error("Error in permanentDeleteEmployee:", error);
    throw error;
  }
});

// Get deleted positions
export const getDeletedPositions = os.handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(positions)
      .where(not(isNull(positions.deletedAt)))
      .orderBy(desc(positions.deletedAt));
  } catch (error) {
    console.error("Error in getDeletedPositions:", error);
    throw error;
  }
});

// Restore position
export const restorePosition = os.handler(async ({ input }) => {
  try {
    const validatedData = restoreInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(positions)
      .set({ deletedAt: null })
      .where(eq(positions.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in restorePosition:", error);
    throw error;
  }
});

// Get deleted work locations
export const getDeletedWorkLocations = os.handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(workLocations)
      .where(not(isNull(workLocations.deletedAt)))
      .orderBy(desc(workLocations.deletedAt));
  } catch (error) {
    console.error("Error in getDeletedWorkLocations:", error);
    throw error;
  }
});

// Restore work location
export const restoreWorkLocation = os.handler(async ({ input }) => {
  try {
    const validatedData = restoreInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(workLocations)
      .set({ deletedAt: null })
      .where(eq(workLocations.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in restoreWorkLocation:", error);
    throw error;
  }
});

// Get deleted departments
export const getDeletedDepartments = os.handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(departments)
      .where(not(isNull(departments.deletedAt)))
      .orderBy(desc(departments.deletedAt));
  } catch (error) {
    console.error("Error in getDeletedDepartments:", error);
    throw error;
  }
});

// Restore department
export const restoreDepartment = os.handler(async ({ input }) => {
  try {
    const validatedData = restoreInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(departments)
      .set({ deletedAt: null })
      .where(eq(departments.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in restoreDepartment:", error);
    throw error;
  }
});

// Get deleted contract types
export const getDeletedContractTypes = os.handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(contractTypes)
      .where(not(isNull(contractTypes.deletedAt)))
      .orderBy(desc(contractTypes.deletedAt));
  } catch (error) {
    console.error("Error in getDeletedContractTypes:", error);
    throw error;
  }
});

// Restore contract type
export const restoreContractType = os.handler(async ({ input }) => {
  try {
    const validatedData = restoreInputSchema.parse(input);
    const db = await getDb();
    await db
      .update(contractTypes)
      .set({ deletedAt: null })
      .where(eq(contractTypes.id, validatedData.id));
    return { success: true };
  } catch (error) {
    console.error("Error in restoreContractType:", error);
    throw error;
  }
});
