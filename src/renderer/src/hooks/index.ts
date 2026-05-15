// Centralized hooks exports

// Entity-specific hooks
export * from "./use-agencies";
export * from "./use-alerts";
export * from "./use-caces";
export * from "./use-dialog";
export * from "./use-documents";
export * from "./use-driving-authorizations";
export * from "./use-employees";
// Data processing hooks
export * from "./use-filtered-data";
export * from "./use-medical-visits";
export * from "./use-metrics";
export * from "./use-mutation";
export * from "./use-online-trainings";
export * from "./use-orpc-ready";
export * from "./use-positions-worklocations";
export {
  useContractTypes,
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./use-positions-worklocations";
// Generic ORPC hooks
export * from "./use-query";
export * from "./use-settings";
