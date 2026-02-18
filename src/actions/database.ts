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
  console.log('[Actions] getEmployees called');
  return ipc.client.database.getEmployees()
    .then(result => {
      console.log('[Actions] getEmployees result:', result?.length ?? 0, 'employees');
      return result;
    })
    .catch(err => {
      console.error('[Actions] getEmployees error:', err);
      throw err;
    });
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
  console.log('[Actions] createEmployee called with:', data);
  return ipc.client.database.createEmployee(data)
    .then(result => {
      console.log('[Actions] createEmployee result:', result);
      return result;
    })
    .catch(err => {
      console.error('[Actions] createEmployee error:', err);
      throw err;
    });
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
