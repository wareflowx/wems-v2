// Database actions - use ORPC via MessagePort tunnel
import { ipc } from "@@/ipc/manager";

// Helper to get the ORPC client
// NOTE: Use useORPCReady hook in TanStack Query's `enabled` option
// to wait for ORPC to be ready before fetching
function getClient() {
  if (!ipc.isReady()) {
    console.warn("[DB-ACTIONS] ORPC not ready - ensure you're using useORPCReady hook");
    return null;
  }
  return ipc.client;
}

// Posts
export async function getPosts() {
  const client = getClient();
  if (!client) return [];
  return client.database.getPosts();
}

export async function createPost(data: { title: string; content: string }) {
  const client = getClient();
  if (!client) return null;
  return client.database.createPost(data);
}

// Positions
export async function getPositions() {
  const client = getClient();
  if (!client) return [];
  return client.database.getPositions();
}

export async function createPosition(data: { code: string; name: string; color: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) return null;
  return client.database.createPosition(data);
}

export async function updatePosition(data: { id: number; code: string; name: string; color: string; isActive: boolean }) {
  const client = getClient();
  if (!client) return null;
  return client.database.updatePosition(data);
}

export async function deletePosition(data: { id: number }) {
  const client = getClient();
  if (!client) return null;
  return client.database.deletePosition(data);
}

// Work Locations
export async function getWorkLocations() {
  const client = getClient();
  if (!client) return [];
  return client.database.getWorkLocations();
}

export async function createWorkLocation(data: { code: string; name: string; color: string; isActive?: boolean }) {
  const client = getClient();
  if (!client) return null;
  return client.database.createWorkLocation(data);
}

export async function updateWorkLocation(data: { id: number; code: string; name: string; color: string; isActive: boolean }) {
  const client = getClient();
  if (!client) return null;
  return client.database.updateWorkLocation(data);
}

export async function deleteWorkLocation(data: { id: number }) {
  const client = getClient();
  if (!client) return null;
  return client.database.deleteWorkLocation(data);
}

// Employees
export async function getEmployees() {
  console.log('[ACTION] getEmployees: calling ORPC client');
  const client = getClient();
  if (!client) {
    console.warn('[ACTION] getEmployees: client not ready');
    return [];
  }
  const result = await client.database.getEmployees();
  console.log('[ACTION] getEmployees: got result:', result.length);
  return result;
}

export async function getEmployeeById(id: number) {
  const client = getClient();
  if (!client) return null;
  return client.database.getEmployeeById({ id });
}

export async function createEmployee(data: any) {
  const client = getClient();
  if (!client) return null;
  return client.database.createEmployee(data);
}

export async function updateEmployee(data: any) {
  const client = getClient();
  if (!client) return null;
  return client.database.updateEmployee(data);
}

export async function deleteEmployee(id: number) {
  const client = getClient();
  if (!client) return null;
  return client.database.deleteEmployee({ id });
}

// Contracts
export async function getContracts() {
  const client = getClient();
  if (!client) return [];
  return client.database.getContracts();
}

export async function getContractsByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) return [];
  return client.database.getContractsByEmployee({ employeeId });
}

export async function getActiveContractByEmployee(employeeId: number) {
  const client = getClient();
  if (!client) return null;
  return client.database.getActiveContractByEmployee({ employeeId });
}

export async function createContract(data: any) {
  const client = getClient();
  if (!client) return null;
  return client.database.createContract(data);
}

export async function updateContract(data: any) {
  const client = getClient();
  if (!client) return null;
  return client.database.updateContract(data);
}

export async function deleteContract(id: number) {
  const client = getClient();
  if (!client) return null;
  return client.database.deleteContract({ id });
}
