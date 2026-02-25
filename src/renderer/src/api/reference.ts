import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getContractTypes,
  createContractType,
  updateContractType,
  deleteContractType,
} from "@/actions/database";

// Types
export type ReferenceDataType = "departments" | "jobTitles" | "contractTypes";

// Helper to convert DB records to string arrays
const toStringArray = <T extends { name: string }>(items: T[]): string[] =>
  items.map((item) => item.name);

// API functions for reference data
export const referenceApi = {
  // Departments
  getDepartments: async (): Promise<string[]> => {
    const departments = await getDepartments();
    return toStringArray(departments);
  },

  addDepartment: async (name: string): Promise<string> => {
    // Generate code from name (uppercase, no spaces)
    const code = name.toUpperCase().replace(/\s+/g, "_");
    await createDepartment({ name, code, isActive: true });
    return name;
  },

  updateDepartment: async (
    oldName: string,
    newName: string
  ): Promise<string> => {
    // Get all departments to find the one to update
    const departments = await getDepartments();
    const dept = departments.find((d) => d.name === oldName);
    if (!dept) {
      throw new Error(`Department "${oldName}" not found`);
    }
    const code = newName.toUpperCase().replace(/\s+/g, "_");
    await updateDepartment({
      id: dept.id,
      name: newName,
      code,
      isActive: dept.isActive,
    });
    return newName;
  },

  deleteDepartment: async (name: string): Promise<void> => {
    const departments = await getDepartments();
    const dept = departments.find((d) => d.name === name);
    if (!dept) {
      throw new Error(`Department "${name}" not found`);
    }
    await deleteDepartment(dept.id);
  },

  // Job Titles - uses existing positions table
  getJobTitles: async (): Promise<string[]> => {
    // Job titles use the positions table - we'll add this later or use mock
    const { getPositions } = await import("@/actions/database");
    const positions = await getPositions();
    return positions.map((p) => p.name);
  },

  addJobTitle: async (title: string): Promise<string> => {
    // Job titles use the positions table - we'll add this later or use mock
    throw new Error("Job titles use positions table - not implemented yet");
  },

  updateJobTitle: async (
    _oldTitle: string,
    _newTitle: string
  ): Promise<string> => {
    throw new Error("Job titles use positions table - not implemented yet");
  },

  deleteJobTitle: async (_title: string): Promise<void> => {
    throw new Error("Job titles use positions table - not implemented yet");
  },

  // Contract Types
  getContractTypes: async (): Promise<string[]> => {
    const contractTypes = await getContractTypes();
    return toStringArray(contractTypes);
  },

  addContractType: async (type: string): Promise<string> => {
    const code = type.toUpperCase().replace(/\s+/g, "_");
    await createContractType({ name: type, code, isActive: true });
    return type;
  },

  updateContractType: async (
    oldType: string,
    newType: string
  ): Promise<string> => {
    const contractTypes = await getContractTypes();
    const ct = contractTypes.find((c) => c.name === oldType);
    if (!ct) {
      throw new Error(`Contract type "${oldType}" not found`);
    }
    const code = newType.toUpperCase().replace(/\s+/g, "_");
    await updateContractType({
      id: ct.id,
      name: newType,
      code,
      isActive: ct.isActive,
    });
    return newType;
  },

  deleteContractType: async (type: string): Promise<void> => {
    const contractTypes = await getContractTypes();
    const ct = contractTypes.find((c) => c.name === type);
    if (!ct) {
      throw new Error(`Contract type "${type}" not found`);
    }
    await deleteContractType(ct.id);
  },
};
