// Hierarchical query keys for cache management and invalidation

export const queryKeys = {
  // Employees
  employees: {
    all: ['employees'] as const,
    lists: () => ['employees', 'list'] as const,
    list: (filters: string) => ['employees', 'list', filters] as const,
    details: () => ['employees', 'detail'] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
  },

  // Contracts
  contracts: {
    all: ['contracts'] as const,
    lists: () => ['contracts', 'list'] as const,
    list: (filters: string) => ['contracts', 'list', filters] as const,
    details: () => ['contracts', 'detail'] as const,
    detail: (id: number) => ['contracts', 'detail', id] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => ['documents', 'list'] as const,
    list: (filters: string) => ['documents', 'list', filters] as const,
    details: () => ['documents', 'detail'] as const,
    detail: (id: number) => ['documents', 'detail', id] as const,
  },

  // CACES Certifications
  caces: {
    all: ['caces'] as const,
    lists: () => ['caces', 'list'] as const,
    list: (filters: string) => ['caces', 'list', filters] as const,
    details: () => ['caces', 'detail'] as const,
    detail: (id: number) => ['caces', 'detail', id] as const,
  },

  // Medical Visits
  medicalVisits: {
    all: ['medical-visits'] as const,
    lists: () => ['medical-visits', 'list'] as const,
    list: (filters: string) => ['medical-visits', 'list', filters] as const,
    details: () => ['medical-visits', 'detail'] as const,
    detail: (id: number) => ['medical-visits', 'detail', id] as const,
  },

  // Alerts
  alerts: {
    all: ['alerts'] as const,
    lists: () => ['alerts', 'list'] as const,
    list: (filters: string) => ['alerts', 'list', filters] as const,
    details: () => ['alerts', 'detail'] as const,
    detail: (id: number) => ['alerts', 'detail', id] as const,
  },

  // Reference Data (Settings)
  reference: {
    all: ['reference'] as const,
    departments: () => ['reference', 'departments'] as const,
    jobTitles: () => ['reference', 'job-titles'] as const,
    contractTypes: () => ['reference', 'contract-types'] as const,
  },

  // Positions
  positions: {
    all: ['positions'] as const,
    lists: () => ['positions', 'list'] as const,
    list: (filters: string) => ['positions', 'list', filters] as const,
    details: () => ['positions', 'detail'] as const,
    detail: (id: number) => ['positions', 'detail', id] as const,
  },

  // Work Locations
  workLocations: {
    all: ['work-locations'] as const,
    lists: () => ['work-locations', 'list'] as const,
    list: (filters: string) => ['work-locations', 'list', filters] as const,
    details: () => ['work-locations', 'detail'] as const,
    detail: (id: number) => ['work-locations', 'detail', id] as const,
  },
} as const
