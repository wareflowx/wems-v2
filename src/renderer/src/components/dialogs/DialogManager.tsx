"use client";

import { useDialogStore } from "@/stores/dialog-store";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog";
import { AddCacesDialog } from "@/components/caces/AddCacesDialog";
import { AddMedicalVisitDialog } from "@/components/medical-visits/AddMedicalVisitDialog";
import { AddDrivingAuthorizationDialog } from "@/components/driving-authorizations/AddDrivingAuthorizationDialog";
import { AddOnlineTrainingDialog } from "@/components/online-trainings/AddOnlineTrainingDialog";
import { CreateContractDialog } from "@/components/contracts/CreateContractDialog";
import { CreatePositionDialog } from "@/components/positions/CreatePositionDialog";
import { CreateWorkLocationDialog } from "@/components/work-locations/CreateWorkLocationDialog";
import { CreateDepartmentDialog } from "@/components/departments/CreateDepartmentDialog";
import { CreateContractTypeDialog } from "@/components/contract-types/CreateContractTypeDialog";

import {
  useAgencies,
  useCreateCaces,
  useCreateContract,
  useCreateContractType,
  useCreateDepartment,
  useCreateDocument,
  useCreateDrivingAuthorization,
  useCreateEmployee,
  useCreateMedicalVisit,
  useCreateOnlineTraining,
  useCreatePosition,
  useCreateWorkLocation,
  useDepartments,
  useEmployees,
  usePositions,
  useWorkLocations,
  useContractTypes,
} from "@/hooks";

export function DialogManager() {
  const activeDialog = useDialogStore((state) => state.activeDialog);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  // Fetch data needed by dialogs
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: contractTypes = [] } = useContractTypes();
  const { data: agencies = [] } = useAgencies();

  // Create mutations
  const createEmployee = useCreateEmployee();
  const createDocument = useCreateDocument();
  const createCaces = useCreateCaces();
  const createMedicalVisit = useCreateMedicalVisit();
  const createDrivingAuthorization = useCreateDrivingAuthorization();
  const createOnlineTraining = useCreateOnlineTraining();
  const createContract = useCreateContract();
  const createPosition = useCreatePosition();
  const createWorkLocation = useCreateWorkLocation();
  const createDepartment = useCreateDepartment();
  const createContractType = useCreateContractType();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  // Render the appropriate dialog based on activeDialog
  switch (activeDialog) {
    case "create-employee":
      return (
        <CreateEmployeeDialog
          open
          onOpenChange={handleOpenChange}
          onCreate={(data) => createEmployee.mutate(data)}
          departments={departments}
          positions={positions}
          workLocations={workLocations}
          agencies={agencies}
        />
      );

    case "create-document":
      return (
        <AddDocumentDialog
          open
          onOpenChange={handleOpenChange}
          onAdd={(data) => createDocument.mutate(data)}
        />
      );

    case "create-caces":
      return (
        <AddCacesDialog
          open
          onOpenChange={handleOpenChange}
          onAdd={(data) => createCaces.mutate(data)}
          employees={employees}
        />
      );

    case "create-medical-visit":
      return (
        <AddMedicalVisitDialog
          open
          onOpenChange={handleOpenChange}
          onAdd={(data) => createMedicalVisit.mutate(data)}
        />
      );

    case "create-driving-authorization":
      return (
        <AddDrivingAuthorizationDialog
          open
          onOpenChange={handleOpenChange}
          onAdd={(data) => createDrivingAuthorization.mutate(data)}
          employees={employees}
        />
      );

    case "create-online-training":
      return (
        <AddOnlineTrainingDialog
          open
          onOpenChange={handleOpenChange}
          onAdd={(data) => createOnlineTraining.mutate(data)}
          employees={employees}
        />
      );

    case "create-contract":
      return (
        <CreateContractDialog
          open
          onOpenChange={handleOpenChange}
          onCreate={(data) => createContract.mutate(data)}
          employees={employees}
          contractTypes={contractTypes}
        />
      );

    case "create-position":
      return (
        <CreatePositionDialog
          open
          onOpenChange={handleOpenChange}
        />
      );

    case "create-work-location":
      return (
        <CreateWorkLocationDialog
          open
          onOpenChange={handleOpenChange}
        />
      );

    case "create-department":
      return (
        <CreateDepartmentDialog
          open
          onClose={closeDialog}
        />
      );

    case "create-contract-type":
      return (
        <CreateContractTypeDialog
          open
          onOpenChange={handleOpenChange}
        />
      );

    default:
      return null;
  }
}
