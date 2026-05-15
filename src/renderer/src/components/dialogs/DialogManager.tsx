"use client";

// Agency dialogs
import {
  CreateAgencyDialog,
  DeleteAgencyDialog,
  EditAgencyDialog,
} from "@/components/agencies";
import { AddCacesDialog } from "@/components/caces/AddCacesDialog";
import { CreateContractTypeDialog } from "@/components/contract-types/CreateContractTypeDialog";
import { CreateDepartmentDialog } from "@/components/departments/CreateDepartmentDialog";
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog";
import { AddDrivingAuthorizationDialog } from "@/components/driving-authorizations/AddDrivingAuthorizationDialog";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { AddMedicalVisitDialog } from "@/components/medical-visits/AddMedicalVisitDialog";
import { AddOnlineTrainingDialog } from "@/components/online-trainings/AddOnlineTrainingDialog";
import { CreatePositionDialog } from "@/components/positions/CreatePositionDialog";
import { CreateWorkLocationDialog } from "@/components/work-locations/CreateWorkLocationDialog";
import {
  useAgencies,
  useContractTypes,
  useCreateCaces,
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
} from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

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
          agencies={agencies}
          contractTypes={contractTypes}
          departments={departments}
          onCreate={(data) => createEmployee.mutate(data)}
          onOpenChange={handleOpenChange}
          open
          positions={positions}
          workLocations={workLocations}
        />
      );

    case "create-document":
      return (
        <AddDocumentDialog
          onAdd={(data) => createDocument.mutate(data)}
          onOpenChange={handleOpenChange}
          open
        />
      );

    case "create-caces":
      return (
        <AddCacesDialog
          employees={employees}
          onAdd={(data) => createCaces.mutate(data)}
          onOpenChange={handleOpenChange}
          open
        />
      );

    case "create-medical-visit":
      return (
        <AddMedicalVisitDialog
          onAdd={(data) => createMedicalVisit.mutate(data)}
          onOpenChange={handleOpenChange}
          open
        />
      );

    case "create-driving-authorization":
      return (
        <AddDrivingAuthorizationDialog
          employees={employees}
          onAdd={(data) => createDrivingAuthorization.mutate(data)}
          onOpenChange={handleOpenChange}
          open
        />
      );

    case "create-online-training":
      return (
        <AddOnlineTrainingDialog
          employees={employees}
          onAdd={(data) => createOnlineTraining.mutate(data)}
          onOpenChange={handleOpenChange}
          open
        />
      );

    case "create-position":
      return <CreatePositionDialog onOpenChange={handleOpenChange} open />;

    case "create-work-location":
      return <CreateWorkLocationDialog onOpenChange={handleOpenChange} open />;

    case "create-department":
      return <CreateDepartmentDialog onClose={closeDialog} open />;

    case "create-contract-type":
      return <CreateContractTypeDialog onOpenChange={handleOpenChange} open />;

    case "create-agency":
      return <CreateAgencyDialog />;

    case "edit-agency":
      return <EditAgencyDialog />;

    case "delete-agency":
      return <DeleteAgencyDialog />;

    default:
      return null;
  }
}