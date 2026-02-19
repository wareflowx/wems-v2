import { ipc } from "@/ipc/manager";
import type { Position, NewPosition } from "@/db/schema/positions";
import type { WorkLocation, NewWorkLocation } from "@/db/schema/work-locations";
import type { Employee, NewEmployee } from "@/db/schema/employees";

// Re-export types
export type { Position, NewPosition };
export type { WorkLocation, NewWorkLocation };
export type { Employee, NewEmployee };

// Posts
export function getPosts() {
  return ipc.client.database.getPosts();
}

export function createPost(data: { title: string; content: string }) {
  return ipc.client.database.createPost(data);
}

// Positions
export function getPositions() {
  return ipc.client.database.getPositions();
}

export function createPosition(data: { code: string; name: string; color: string; isActive?: boolean }) {
  return ipc.client.database.createPosition(data);
}

export function updatePosition(data: { id: number; code: string; name: string; color: string; isActive: boolean }) {
  return ipc.client.database.updatePosition(data);
}

export function deletePosition(data: { id: number }) {
  return ipc.client.database.deletePosition(data);
}

// Work Locations
export function getWorkLocations() {
  return ipc.client.database.getWorkLocations();
}

export function createWorkLocation(data: { code: string; name: string; color: string; isActive?: boolean }) {
  return ipc.client.database.createWorkLocation(data);
}

export function updateWorkLocation(data: { id: number; code: string; name: string; color: string; isActive: boolean }) {
  return ipc.client.database.updateWorkLocation(data);
}

export function deleteWorkLocation(data: { id: number }) {
  return ipc.client.database.deleteWorkLocation(data);
}

// Employees
export function getEmployees() {
  return ipc.client.database.getEmployees();
}

export function getEmployeeById(id: number) {
  return ipc.client.database.getEmployeeById({ id });
}

export function createEmployee(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  positionId?: number;
  workLocationId?: number;
  contract: string;
  department: string;
  status?: "active" | "on_leave" | "terminated";
  hireDate: string;
  terminationDate?: string;
}) {
  return ipc.client.database.createEmployee(data);
}

export function updateEmployee(data: {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  positionId?: number | null;
  workLocationId?: number | null;
  contract?: string;
  department?: string;
  status?: "active" | "on_leave" | "terminated";
  hireDate?: string;
  terminationDate?: string | null;
}) {
  return ipc.client.database.updateEmployee(data);
}

export function deleteEmployee(id: number) {
  return ipc.client.database.deleteEmployee({ id });
}

// Contracts
export function getContracts() {
  return ipc.client.database.getContracts();
}

export function getContractsByEmployee(employeeId: number) {
  return ipc.client.database.getContractsByEmployee({ employeeId });
}

export function getActiveContractByEmployee(employeeId: number) {
  return ipc.client.database.getActiveContractByEmployee({ employeeId });
}

export function createContract(data: {
  employeeId: number;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  isActive?: boolean;
}) {
  return ipc.client.database.createContract(data);
}

export function updateContract(data: {
  id: number;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
}) {
  return ipc.client.database.updateContract(data);
}

export function deleteContract(id: number) {
  return ipc.client.database.deleteContract({ id });
}
