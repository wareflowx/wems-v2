import { ipc } from "@@/ipc/manager";

// Types
export interface AlertFilters {
  search?: string;
  severity?: string;
  type?: string;
}

export interface Alert {
  id: string | number;
  type: string;
  employee: string;
  employeeId: number;
  category?: string;
  visitType?: string;
  daysLeft?: number;
  severity: string;
  date: string;
}

// Helper to get IPC client
function getClient() {
  if (!ipc.isReady()) return null;
  return ipc.client;
}

// API functions - use IPC backend
export const alertsApi = {
  getAll: async (filters?: AlertFilters): Promise<Alert[]> => {
    const client = getClient();
    if (!client) {
      console.warn("IPC not ready, returning empty alerts");
      return [];
    }
    return client.database.getAlerts(filters);
  },

  // Note: getById is not implemented on backend as alerts are generated dynamically
  // The frontend should filter from getAll results if needed
  getById: async (_id: number): Promise<Alert> => {
    throw new Error("getById is not supported for dynamically generated alerts");
  },
};
