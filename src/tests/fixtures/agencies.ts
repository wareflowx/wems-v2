import type { Agency } from "@/hooks/use-agencies";

export function createMockAgency(overrides: Partial<Agency> = {}): Agency {
  return {
    id: 1,
    name: "Test Agency",
    code: "TEST_AGENCY",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

export const mockAgencyList: Agency[] = [
  createMockAgency({ id: 1, name: "Agency Alpha", code: "ALPHA", isActive: true }),
  createMockAgency({ id: 2, name: "Agency Beta", code: "BETA", isActive: false }),
  createMockAgency({ id: 3, name: "Agency Gamma", code: "GAMMA", isActive: true }),
  createMockAgency({ id: 4, name: "Agency Delta", code: "DELTA", isActive: false }),
];

export const mockActiveAgencies = mockAgencyList.filter((a) => a.isActive);
export const mockInactiveAgencies = mockAgencyList.filter((a) => !a.isActive);
