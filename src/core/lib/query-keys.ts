// Hierarchical query keys for cache management and invalidation

export const queryKeys = {
  // Employees
  employees: {
    all: ["employees"] as const,
    lists: () => ["employees", "list"] as const,
    list: (filters: string) => ["employees", "list", filters] as const,
    details: () => ["employees", "detail"] as const,
    detail: (id: number) => ["employees", "detail", id] as const,
  },

  // Contracts
  contracts: {
    all: ["contracts"] as const,
    lists: () => ["contracts", "list"] as const,
    list: (filters: string) => ["contracts", "list", filters] as const,
    details: () => ["contracts", "detail"] as const,
    detail: (id: number) => ["contracts", "detail", id] as const,
    byEmployee: (employeeId: number) =>
      ["contracts", "byEmployee", employeeId] as const,
    activeByEmployee: (employeeId: number) =>
      ["contracts", "activeByEmployee", employeeId] as const,
  },

  // Documents
  documents: {
    all: ["documents"] as const,
    lists: () => ["documents", "list"] as const,
    list: (filters: string) => ["documents", "list", filters] as const,
    details: () => ["documents", "detail"] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },

  // CACES Certifications
  caces: {
    all: ["caces"] as const,
    lists: () => ["caces", "list"] as const,
    list: (filters: string) => ["caces", "list", filters] as const,
    details: () => ["caces", "detail"] as const,
    detail: (id: number) => ["caces", "detail", id] as const,
    byEmployee: (employeeId: number) =>
      ["caces", "byEmployee", employeeId] as const,
  },

  // Medical Visits
  medicalVisits: {
    all: ["medical-visits"] as const,
    lists: () => ["medical-visits", "list"] as const,
    list: (filters: string) => ["medical-visits", "list", filters] as const,
    details: () => ["medical-visits", "detail"] as const,
    detail: (id: number) => ["medical-visits", "detail", id] as const,
  },

  // Driving Authorizations
  drivingAuthorizations: {
    all: ["driving-authorizations"] as const,
    lists: () => ["driving-authorizations", "list"] as const,
    list: (filters: string) => ["driving-authorizations", "list", filters] as const,
    details: () => ["driving-authorizations", "detail"] as const,
    detail: (id: number) => ["driving-authorizations", "detail", id] as const,
    byEmployee: (employeeId: number) =>
      ["driving-authorizations", "byEmployee", employeeId] as const,
  },

  // Driving Authorization Status
  drivingAuthorizationStatus: {
    all: ["driving-authorization-status"] as const,
    byEmployee: (employeeId: number) =>
      ["driving-authorization-status", "byEmployee", employeeId] as const,
  },

  // Online Trainings
  onlineTrainings: {
    all: ["online-trainings"] as const,
    lists: () => ["online-trainings", "list"] as const,
    list: (filters: string) => ["online-trainings", "list", filters] as const,
    details: () => ["online-trainings", "detail"] as const,
    detail: (id: number) => ["online-trainings", "detail", id] as const,
    byEmployee: (employeeId: number) =>
      ["online-trainings", "byEmployee", employeeId] as const,
  },

  // Alerts
  alerts: {
    all: ["alerts"] as const,
    lists: () => ["alerts", "list"] as const,
    list: (filters: string) => ["alerts", "list", filters] as const,
    details: () => ["alerts", "detail"] as const,
    detail: (id: number) => ["alerts", "detail", id] as const,
  },

  // Reference Data (Settings)
  reference: {
    all: ["reference"] as const,
    departments: () => ["reference", "departments"] as const,
    jobTitles: () => ["reference", "job-titles"] as const,
    contractTypes: () => ["reference", "contract-types"] as const,
    agencies: () => ["reference", "agencies"] as const,
  },

  // Positions
  positions: {
    all: ["positions"] as const,
    lists: () => ["positions", "list"] as const,
    list: (filters: string) => ["positions", "list", filters] as const,
    details: () => ["positions", "detail"] as const,
    detail: (id: number) => ["positions", "detail", id] as const,
  },

  // Work Locations
  workLocations: {
    all: ["work-locations"] as const,
    lists: () => ["work-locations", "list"] as const,
    list: (filters: string) => ["work-locations", "list", filters] as const,
    details: () => ["work-locations", "detail"] as const,
    detail: (id: number) => ["work-locations", "detail", id] as const,
  },

  // Departments
  departments: {
    all: ["departments"] as const,
    lists: () => ["departments", "list"] as const,
    list: (filters: string) => ["departments", "list", filters] as const,
    details: () => ["departments", "detail"] as const,
    detail: (id: number) => ["departments", "detail", id] as const,
  },

  // Contract Types
  contractTypes: {
    all: ["contract-types"] as const,
    lists: () => ["contract-types", "list"] as const,
    list: (filters: string) => ["contract-types", "list", filters] as const,
    details: () => ["contract-types", "detail"] as const,
    detail: (id: number) => ["contract-types", "detail", id] as const,
  },

  // Agencies
  agencies: {
    all: ["agencies"] as const,
    lists: () => ["agencies", "list"] as const,
    list: (filters: string) => ["agencies", "list", filters] as const,
    details: () => ["agencies", "detail"] as const,
    detail: (id: number) => ["agencies", "detail", id] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    detail: () => ["settings", "detail"] as const,
  },

  // Trash (deleted items)
  trash: {
    deletedEmployees: () => ["trash", "deleted-employees"] as const,
    deletedPositions: () => ["trash", "deleted-positions"] as const,
    deletedWorkLocations: () => ["trash", "deleted-work-locations"] as const,
    deletedDepartments: () => ["trash", "deleted-departments"] as const,
    deletedContractTypes: () => ["trash", "deleted-contract-types"] as const,
    deletedAgencies: () => ["trash", "deleted-agencies"] as const,
  },
} as const;
