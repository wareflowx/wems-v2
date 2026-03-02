import { create } from "zustand";

export type DialogId =
  | "create-employee"
  | "edit-employee"
  | "delete-employee"
  | "create-document"
  | "edit-document"
  | "delete-document"
  | "create-caces"
  | "edit-caces"
  | "delete-caces"
  | "create-medical-visit"
  | "edit-medical-visit"
  | "delete-medical-visit"
  | "create-driving-authorization"
  | "edit-driving-authorization"
  | "delete-driving-authorization"
  | "create-online-training"
  | "edit-online-training"
  | "delete-online-training"
  | "create-contract"
  | "edit-contract"
  | "delete-contract"
  | "create-position"
  | "edit-position"
  | "delete-position"
  | "create-work-location"
  | "edit-work-location"
  | "delete-work-location"
  | "create-department"
  | "edit-department"
  | "delete-department"
  | "create-contract-type"
  | "edit-contract-type"
  | "delete-contract-type";

interface DialogData {
  // Employee
  employeeId?: number;
  // Document
  documentId?: number;
  // CACES
  cacesId?: number;
  // Medical Visit
  medicalVisitId?: number;
  // Driving Authorization
  drivingAuthorizationId?: number;
  // Online Training
  onlineTrainingId?: number;
  // Contract
  contractId?: number;
  // Position
  positionId?: number;
  // Work Location
  workLocationId?: number;
  // Department
  departmentId?: number;
  // Contract Type
  contractTypeId?: number;
}

interface DialogState {
  activeDialog: DialogId | null;
  dialogData: DialogData;
  isOpen: (dialogId: DialogId) => boolean;
  openDialog: (dialogId: DialogId, data?: DialogData) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  activeDialog: null,
  dialogData: {},

  isOpen: (dialogId: DialogId) => get().activeDialog === dialogId,

  openDialog: (dialogId: DialogId, data: DialogData = {}) =>
    set({ activeDialog: dialogId, dialogData: data }),

  closeDialog: () => set({ activeDialog: null, dialogData: {} }),
}));
