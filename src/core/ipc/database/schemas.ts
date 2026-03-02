import { z } from "zod";

// Constants for validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
] as const;

export const createPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

// Position schemas
export const createPositionInputSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean().default(true),
});

export const updatePositionInputSchema = z.object({
  id: z.number(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean(),
});

// Work location schemas
export const createWorkLocationInputSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean().default(true),
});

export const updateWorkLocationInputSchema = z.object({
  id: z.number(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean(),
});

// Delete schemas
export const deletePositionInputSchema = z.object({
  id: z.number(),
});

export const deleteWorkLocationInputSchema = z.object({
  id: z.number(),
});

// Employee schemas
export const createEmployeeInputSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z
    .string()
    .email("Valid email is required")
    .transform((val) => val.toLowerCase().trim()),
  phone: z.string().optional(),
  positionId: z.number().optional(),
  workLocationId: z.number().optional(),
  department: z.string().min(1, "Department is required").trim(),
  status: z.enum(["active", "on_leave", "terminated"]).default("active"),
  hireDate: z.string().min(1, "Hire date is required"),
  terminationDate: z.string().optional(),
  // Contract info - will create contract record
  contractType: z.string().min(1, "Contract type is required"),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
});

export const updateEmployeeInputSchema = z.object({
  id: z.number(),
  firstName: z.string().min(1, "First name is required").trim().optional(),
  lastName: z.string().min(1, "Last name is required").trim().optional(),
  email: z
    .string()
    .email("Valid email is required")
    .transform((val) => val.toLowerCase().trim())
    .optional(),
  phone: z.string().optional(),
  positionId: z.number().optional().nullable(),
  workLocationId: z.number().optional().nullable(),
  department: z.string().min(1, "Department is required").trim().optional(),
  status: z.enum(["active", "on_leave", "terminated"]).optional(),
  hireDate: z.string().min(1, "Hire date is required").optional(),
  terminationDate: z.string().optional().nullable(),
});

export const deleteEmployeeInputSchema = z.object({
  id: z.number(),
});

// Media schemas
export const createMediaInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["logo", "template", "document", "other"]),
  fileName: z.string().optional(),
  mimeType: z.enum(ALLOWED_MIME_TYPES).optional(),
  size: z.number().max(MAX_FILE_SIZE, "File size exceeds maximum allowed size of 50MB").optional(),
  fileData: z.string().optional(), // base64 encoded file
});

export const deleteMediaInputSchema = z.object({
  id: z.string(),
});

export const getMediaInputSchema = z.object({
  id: z.string(),
});

export const getAllMediaInputSchema = z.object({
  type: z.enum(["logo", "template", "document", "other"]).optional(),
});

// Attachment schemas
export const createAttachmentInputSchema = z.object({
  id: z.string().optional(),
  employeeId: z.number(),
  employeeName: z.string().optional(), // For slugified folder path
  entityType: z.enum(["contract", "caces", "document", "medical_visit", "driving_authorization", "online_training"]),
  entityId: z.number().optional(),
  originalName: z.string(),
  mimeType: z.enum(ALLOWED_ATTACHMENT_MIME_TYPES).optional(),
  size: z.number().max(MAX_FILE_SIZE, "File size exceeds maximum allowed size of 50MB").optional(),
  fileData: z.string(), // base64 encoded file
});

export const deleteAttachmentInputSchema = z.object({
  id: z.string(),
});

export const getAttachmentInputSchema = z.object({
  id: z.string(),
});

export const getAttachmentsInputSchema = z.object({
  employeeId: z.number().optional(),
  entityType: z.enum(["contract", "caces", "document", "medical_visit", "driving_authorization", "online_training"]).optional(),
});

// Department schemas
export const createDepartmentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean().default(true),
});

export const updateDepartmentInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean(),
});

export const deleteDepartmentInputSchema = z.object({
  id: z.number(),
});

// Contract Type schemas
export const createContractTypeInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean().default(true),
});

export const updateContractTypeInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  color: z.string().min(1, "Color is required"),
  isActive: z.boolean(),
});

export const deleteContractTypeInputSchema = z.object({
  id: z.number(),
});

// CACES schemas
export const createCaceInputSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  category: z.string().min(1, "Category is required"),
  dateObtained: z.string().min(1, "Date obtained is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  attachmentId: z.string().optional(),
});

export const updateCaceInputSchema = z.object({
  id: z.number(),
  category: z.string().min(1, "Category is required").optional(),
  dateObtained: z.string().min(1, "Date obtained is required").optional(),
  expirationDate: z.string().min(1, "Expiration date is required").optional(),
  attachmentId: z.string().optional().nullable(),
});

export const deleteCaceInputSchema = z.object({
  id: z.number(),
});

// Medical Visit schemas
export const createMedicalVisitInputSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  type: z.enum(["periodique", "reprise", "initiale", "embauche"]),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  actualDate: z.string().optional(),
  status: z.enum(["scheduled", "completed", "overdue", "cancelled"]).default("scheduled"),
  fitnessStatus: z.enum(["Apt", "Apt partiel", "Inapte"]).optional(),
  attachmentId: z.string().optional(),
});

export const updateMedicalVisitInputSchema = z.object({
  id: z.number(),
  type: z.enum(["periodique", "reprise", "initiale", "embauche"]).optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required").optional(),
  actualDate: z.string().optional().nullable(),
  status: z.enum(["scheduled", "completed", "overdue", "cancelled"]).optional(),
  fitnessStatus: z.enum(["Apt", "Apt partiel", "Inapte"]).optional().nullable(),
  attachmentId: z.string().optional().nullable(),
});

export const deleteMedicalVisitInputSchema = z.object({
  id: z.number(),
});

// Driving Authorization schemas
export const createDrivingAuthorizationInputSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  dateObtained: z.string().min(1, "Date obtained is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  attachmentId: z.string().optional(),
});

export const updateDrivingAuthorizationInputSchema = z.object({
  id: z.number(),
  licenseCategory: z.string().min(1, "License category is required").optional(),
  dateObtained: z.string().min(1, "Date obtained is required").optional(),
  expirationDate: z.string().min(1, "Expiration date is required").optional(),
  attachmentId: z.string().optional().nullable(),
});

export const deleteDrivingAuthorizationInputSchema = z.object({
  id: z.number(),
});

// Online Training schemas
export const createOnlineTrainingInputSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  trainingName: z.string().min(1, "Training name is required"),
  trainingProvider: z.string().min(1, "Training provider is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  expirationDate: z.string().optional(),
  status: z.enum(["in_progress", "completed", "expired"]).default("completed"),
  attachmentId: z.string().optional(),
});

export const updateOnlineTrainingInputSchema = z.object({
  id: z.number(),
  trainingName: z.string().min(1, "Training name is required").optional(),
  trainingProvider: z.string().min(1, "Training provider is required").optional(),
  completionDate: z.string().min(1, "Completion date is required").optional(),
  expirationDate: z.string().optional().nullable(),
  status: z.enum(["in_progress", "completed", "expired"]).optional(),
  attachmentId: z.string().optional().nullable(),
});

export const deleteOnlineTrainingInputSchema = z.object({
  id: z.number(),
});

// Settings schema
export const updateSettingsInputSchema = z.object({
  // Backup
  autoBackup: z.boolean().optional(),

  // Alerts
  cacesAlerts: z.boolean().optional(),
  cacesDays: z.number().min(1).optional(),
  medicalAlerts: z.boolean().optional(),
  medicalDays: z.number().min(1).optional(),
  contractAlerts: z.boolean().optional(),

  // System
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["fr", "en"]).optional(),
  readOnlyMode: z.boolean().optional(),
});

// Alert filters schema
export const getAlertsInputSchema = z.object({
  search: z.string().optional(),
  severity: z.string().optional(),
  type: z.string().optional(),
});

// Restore and permanent delete schemas
export const restoreInputSchema = z.object({
  id: z.number(),
});

export const permanentDeleteInputSchema = z.object({
  id: z.number(),
});
