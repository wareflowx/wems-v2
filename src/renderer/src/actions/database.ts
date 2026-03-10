// Database actions - use ORPC via MessagePort tunnel
import { ipc } from "@@/ipc/manager";

// Helper to get the ORPC client
// NOTE: Use useORPCReady hook in TanStack Query's `enabled` option
// to wait for ORPC to be ready before fetching
function getClient() {
  if (!ipc.isReady()) {
    console.warn(
      "[DB-ACTIONS] ORPC not ready - ensure you're using useORPCReady hook"
    );
    return null;
  }
  return ipc.client;
}

// Posts
export async function getPosts() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getPosts();
}

export async function createPost(data: { title: string; content: string }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createPost(data);
}

// Notes
export interface Note {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export async function getNotes(): Promise<Note[]> {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getNotes();
}

export async function createNote(data: { title: string; description?: string }): Promise<Note | null> {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createNote(data);
}

export async function updateNote(data: {
  id: number;
  title?: string;
  description?: string;
  isCompleted?: boolean;
}): Promise<Note | null> {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateNote(data);
}

export async function deleteNote(id: number): Promise<boolean | null> {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteNote({ id });
}

// Migration: Add notes table
export async function migrateAddNotesTable(): Promise<{ success: boolean } | null> {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.migrateAddNotesTable();
}

// Positions
export async function getPositions() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getPositions();
}

export async function createPosition(data: {
  code: string;
  name: string;
  color: string;
  isActive?: boolean;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createPosition(data);
}

export async function updatePosition(data: {
  id: number;
  code: string;
  name: string;
  color: string;
  isActive: boolean;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updatePosition(data);
}

export async function deletePosition(data: { id: number }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deletePosition(data);
}

export async function restorePosition(data: { id: number }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.restorePosition(data);
}

// Work Locations
export async function getWorkLocations() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getWorkLocations();
}

export async function createWorkLocation(data: {
  code: string;
  name: string;
  color: string;
  isActive?: boolean;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createWorkLocation(data);
}

export async function updateWorkLocation(data: {
  id: number;
  code: string;
  name: string;
  color: string;
  isActive: boolean;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateWorkLocation(data);
}

export async function deleteWorkLocation(data: { id: number }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteWorkLocation(data);
}

// Employees
export async function getEmployees() {
  console.log("[ACTION] getEmployees: calling ORPC client");
  const client = getClient();
  if (!client) {
    console.warn("[ACTION] getEmployees: client not ready");
    return [];
  }
  const result = await client.database.getEmployees();
  console.log("[ACTION] getEmployees: got result:", result.length);
  return result;
}

export async function getEmployeeById(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getEmployeeById({ id });
}

export async function createEmployee(data: any) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createEmployee(data);
}

export async function updateEmployee(data: any) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateEmployee(data);
}

export async function deleteEmployee(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteEmployee({ id });
}

// Contracts
export async function getContracts() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getContracts();
}

export async function getContractsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getContractsByEmployee({ employeeId });
}

export async function getActiveContractByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getActiveContractByEmployee({ employeeId });
}

export async function createContract(data: any) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createContract(data);
}

export async function updateContract(data: any) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateContract(data);
}

export async function deleteContract(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteContract({ id });
}

// Media
export async function getAllMedia(type?: "logo" | "template" | "document" | "other") {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAllMedia({ type });
}

export async function getMediaById(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getMediaById({ id });
}

export async function createMedia(data: {
  id?: string;
  name: string;
  type: "logo" | "template" | "document" | "other";
  fileName?: string;
  mimeType?: string;
  size?: number;
  fileData?: string;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createMedia(data);
}

export async function deleteMedia(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteMedia({ id });
}

export async function downloadMedia(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.downloadMedia({ id });
}

// Attachments
export async function getAttachments(
  employeeId?: number,
  entityType?: "contract" | "caces" | "document" | "medical_visit"
) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAttachments({ employeeId, entityType });
}

export async function getAttachmentById(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getAttachmentById({ id });
}

export async function createAttachment(data: {
  id?: string;
  employeeId: number;
  employeeName?: string;
  entityType: "contract" | "caces" | "document" | "medical_visit" | "driving_authorization" | "online_training";
  entityId?: number;
  originalName: string;
  mimeType?: string;
  size?: number;
  fileData: string;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createAttachment(data);
}

export async function deleteAttachment(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteAttachment({ id });
}

export async function downloadAttachment(id: string) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.downloadAttachment({ id });
}

// Departments
export async function getDepartments() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDepartments();
}

export async function createDepartment(data: { name: string; code: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createDepartment(data);
}

export async function updateDepartment(data: { id: number; name: string; code: string; isActive: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateDepartment(data);
}

export async function deleteDepartment(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteDepartment({ id });
}

// Agencies
export async function getAgencies() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAgencies();
}

export async function createAgency(data: { name: string; code?: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createAgency(data);
}

export async function updateAgency(data: { id: number; name?: string; code?: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateAgency(data);
}

export async function deleteAgency(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteAgency({ id });
}

// Contract Types
export async function getContractTypes() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getContractTypes();
}

export async function createContractType(data: { name: string; code: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createContractType(data);
}

export async function updateContractType(data: { id: number; name: string; code: string; isActive: boolean }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateContractType(data);
}

export async function deleteContractType(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteContractType({ id });
}

// CACES actions
export async function getCaces() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getCaces();
}

export async function getCacesByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getCacesByEmployee({ employeeId });
}

export async function createCace(data: { employeeId: number; category: string; dateObtained: string; expirationDate: string; attachmentId?: string }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createCace(data);
}

export async function updateCace(data: { id: number; category?: string; dateObtained?: string; expirationDate?: string; attachmentId?: string | null }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateCace(data);
}

export async function deleteCace(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteCace({ id });
}

// Driving Authorizations actions
export async function getDrivingAuthorizations() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDrivingAuthorizations();
}

export async function getDrivingAuthorizationsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDrivingAuthorizationsByEmployee({ employeeId });
}

export async function getDrivingAuthorizationStatus(employeeId: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getDrivingAuthorizationStatus({ employeeId });
}

export async function getAllDrivingAuthorizationStatuses() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAllDrivingAuthorizationStatuses();
}

export async function createDrivingAuthorization(data: { employeeId: number; licenseCategory: string; dateObtained: string; expirationDate: string; attachmentId?: string }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createDrivingAuthorization(data);
}

export async function updateDrivingAuthorization(data: { id: number; licenseCategory?: string; dateObtained?: string; expirationDate?: string; attachmentId?: string | null }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateDrivingAuthorization(data);
}

export async function deleteDrivingAuthorization(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteDrivingAuthorization({ id });
}

// Online Trainings actions
export async function getOnlineTrainings() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getOnlineTrainings();
}

export async function getOnlineTrainingsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getOnlineTrainingsByEmployee({ employeeId });
}

export async function createOnlineTraining(data: { employeeId: number; trainingName: string; trainingProvider: string; completionDate: string; expirationDate?: string; status?: "in_progress" | "completed" | "expired"; attachmentId?: string }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createOnlineTraining(data);
}

export async function updateOnlineTraining(data: { id: number; trainingName?: string; trainingProvider?: string; completionDate?: string; expirationDate?: string | null; status?: "in_progress" | "completed" | "expired"; attachmentId?: string | null }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateOnlineTraining(data);
}

export async function deleteOnlineTraining(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteOnlineTraining({ id });
}

// Attachment by entity actions
export async function getAttachmentsByEntity(entityType: "contract" | "caces" | "document" | "medical_visit" | "driving_authorization" | "online_training", entityId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAttachmentsByEntity({ entityType, entityId });
}

export async function getAttachmentsByType(entityType: "contract" | "caces" | "document" | "medical_visit" | "driving_authorization" | "online_training") {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAttachmentsByType({ entityType });
}

export async function getAttachmentsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getAttachmentsByEmployee({ employeeId });
}

// Medical Visit actions
export async function getMedicalVisits() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getMedicalVisits();
}

export async function getMedicalVisitsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getMedicalVisitsByEmployee({ employeeId });
}

export async function createMedicalVisit(data: { employeeId: number; type: "periodique" | "reprise" | "initiale" | "embauche"; scheduledDate: string; actualDate?: string; status?: "scheduled" | "completed" | "overdue" | "cancelled"; fitnessStatus?: "Apt" | "Apt partiel" | "Inapte"; attachmentId?: string }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.createMedicalVisit(data);
}

export async function updateMedicalVisit(data: { id: number; type?: "periodique" | "reprise" | "initiale" | "embauche"; scheduledDate?: string; actualDate?: string | null; status?: "scheduled" | "completed" | "overdue" | "cancelled"; fitnessStatus?: "Apt" | "Apt partiel" | "Inapte" | null; attachmentId?: string | null }) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateMedicalVisit(data);
}

export async function deleteMedicalVisit(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.deleteMedicalVisit({ id });
}

// Settings functions
export async function getSettings() {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.getSettings();
}

export async function updateSettings(data: {
  autoBackup?: boolean;
  cacesAlerts?: boolean;
  cacesDays?: number;
  medicalAlerts?: boolean;
  medicalDays?: number;
  contractAlerts?: boolean;
  theme?: "light" | "dark" | "system";
  language?: "fr" | "en";
  readOnlyMode?: boolean;
}) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.updateSettings(data);
}

// Trash / Restore functions
export async function getDeletedEmployees() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDeletedEmployees();
}

export async function restoreEmployee(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.restoreEmployee({ id });
}

export async function permanentDeleteEmployee(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.permanentDeleteEmployee({ id });
}

export async function permanentDeletePosition(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.permanentDeletePosition({ id });
}

export async function permanentDeleteWorkLocation(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.permanentDeleteWorkLocation({ id });
}

export async function permanentDeleteDepartment(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.permanentDeleteDepartment({ id });
}

export async function permanentDeleteContractType(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.permanentDeleteContractType({ id });
}

export async function getDeletedPositions() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDeletedPositions();
}

export async function getDeletedWorkLocations() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDeletedWorkLocations();
}

export async function restoreWorkLocation(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.restoreWorkLocation({ id });
}

export async function getDeletedDepartments() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDeletedDepartments();
}

export async function restoreDepartment(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.restoreDepartment({ id });
}

export async function getDeletedContractTypes() {
  const client = getClient();
  if (!client) {
    return [];
  }
  return client.database.getDeletedContractTypes();
}

export async function restoreContractType(id: number) {
  const client = getClient();
  if (!client) {
    return null;
  }
  return client.database.restoreContractType({ id });
}

// ============================================================
// Export functions
// ============================================================

export type ExportType = 'employees' | 'attachments' | 'media';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type DateRange = 'today' | '7days' | '30days' | 'all';

export interface ExportOptions {
  types: ExportType[];
  format: ExportFormat;
  dateRange: DateRange;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  recordCount: number;
  canceled?: boolean;
  error?: string;
}

export interface ExportPreview {
  employees: number;
  attachments: number;
  media: number;
  total: number;
}

export async function previewExport(
  types: ExportType[],
  dateRange: DateRange
): Promise<ExportPreview> {
  const client = getClient();
  if (!client) {
    return { employees: 0, attachments: 0, media: 0, total: 0 };
  }
  return client.database.previewExport({ types, dateRange });
}

export async function exportData(options: ExportOptions): Promise<ExportResult> {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'ORPC not ready', recordCount: 0 };
  }
  return client.database.exportData(options);
}

export async function openExportedFile(filePath: string): Promise<{ success: boolean }> {
  const client = getClient();
  if (!client) {
    return { success: false };
  }
  return client.database.openExportedFile({ filePath });
}

export async function openExportFolder(filePath: string): Promise<{ success: boolean }> {
  const client = getClient();
  if (!client) {
    return { success: false };
  }
  return client.database.openExportFolder({ filePath });
}
