import { z } from "zod";

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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  positionId: z.number().optional(),
  workLocationId: z.number().optional(),
  contract: z.string().min(1, "Contract type is required"),
  department: z.string().min(1, "Department is required"),
  status: z.enum(["active", "on_leave", "terminated"]).default("active"),
  hireDate: z.string().min(1, "Hire date is required"),
  terminationDate: z.string().optional(),
});

export const updateEmployeeInputSchema = z.object({
  id: z.number(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
  positionId: z.number().optional().nullable(),
  workLocationId: z.number().optional().nullable(),
  contract: z.string().min(1, "Contract type is required").optional(),
  department: z.string().min(1, "Department is required").optional(),
  status: z.enum(["active", "on_leave", "terminated"]).optional(),
  hireDate: z.string().min(1, "Hire date is required").optional(),
  terminationDate: z.string().optional().nullable(),
});

export const deleteEmployeeInputSchema = z.object({
  id: z.number(),
});
