// Centralized hooks exports

// Generic ORPC hooks
export * from "./use-query";
export * from "./use-mutation";
export * from "./use-dialog";

// Data processing hooks
export * from "./use-filtered-data";
export * from "./use-metrics";

// Entity-specific hooks
export * from "./use-agencies";
export * from "./use-alerts";
export * from "./use-caces";
export * from "./use-contracts";
export * from "./use-documents";
export * from "./use-driving-authorizations";
export * from "./use-employees";
export * from "./use-medical-visits";
export * from "./use-online-trainings";
export * from "./use-orpc-ready";
export * from "./use-positions-worklocations";
export {
  useContractTypes,
  useDepartments,
} from "./use-positions-worklocations";
export * from "./use-settings";
