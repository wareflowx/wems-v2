import type { Employee } from "@@/db/schema/employees";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Filter, Sparkles, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type CreateEmployeeData,
  CreateEmployeeDialog,
} from "@/components/employees/CreateEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { EmployeesTable } from "@/components/employees/employees-table";
import { ErrorDisplay } from "@/components/ui/error-display";
import { MetricsSection } from "@/components/ui/metrics-section";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useAgencies,
  useCaces,
  useContracts,
  useCreateEmployee,
  useDeleteEmployee,
  useDepartments,
  useDrivingAuthorizations,
  useEmployees,
  useMedicalVisits,
  useOnlineTrainings,
  usePositions,
  useUpdateEmployee,
  useWorkLocations,
  useAllDrivingAuthorizationStatuses,
} from "@/hooks";
import { useToast } from "@/utils/toast";

// Stable empty arrays to prevent infinite re-render loops when data is loading
const EMPTY_ARRAY: never[] = [];

export function EmployeesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { setOpen } = useSidebar();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Auto-close sidebar when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      setOpen(false);
    }
  }, [selectedEmployee, setOpen]);

  // Use TanStack Query hooks
  const { data: employees = [], isLoading, error } = useEmployees();
  const { data: positions = [] } = usePositions();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: contracts = [] } = useContracts();
  const { data: departments = [] } = useDepartments();
  const { data: agencies = [] } = useAgencies();
  const { data: authorizationStatusesData = [] } =
    useAllDrivingAuthorizationStatuses();
  const { data: caces = [] } = useCaces();
  const { data: medicalVisits = [] } = useMedicalVisits();
  const { data: drivingAuthorizations = [] } = useDrivingAuthorizations();
  const { data: onlineTrainings = [] } = useOnlineTrainings();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();

  // Convert authorization statuses array to a Map
  const authorizationStatuses = useMemo(() => {
    const map = new Map<
      number,
      import("@/core/lib/driving-authorization").DrivingAuthorizationStatusResult
    >();
    for (const item of authorizationStatusesData) {
      map.set(item.employeeId, item.status);
    }
    return map;
  }, [authorizationStatusesData]);

  // KPIs - calculated dynamically
  const kpis = useMemo(() => {
    // Calculate new hires this month
    const now = new Date();
    const newHiresThisMonth = employees.filter((e) => {
      const hireDate = new Date(e.hireDate);
      return (
        hireDate.getMonth() === now.getMonth() &&
        hireDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      onLeaveEmployees: employees.filter((e) => e.status === "on_leave").length,
      newHiresThisMonth,
    };
  }, [employees]);

  const handleAddEmployee = (data: CreateEmployeeData) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setEmployeeToDelete(null);
        },
      });
    }
  };

  const handleDeleteClick = (employee: { id: number; name: string }) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (employee: any) => {
    setEmployeeToEdit(employee);
  };

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditSubmit = (data: any) => {
    updateEmployee.mutate(data, {
      onSuccess: () => {
        setEmployeeToEdit(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            description={t("employees.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("employees.title")}
          />
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderCard
          description={t("employees.description")}
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("employees.title")}
        />
        <ErrorDisplay
          message={t(
            "employees.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart.",
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["employees"] })
          }
          title={t("employees.errorLoading", "Failed to load employees")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full overflow-hidden">
        <ResizablePanelGroup
        className={`h-full w-full ${selectedEmployee ? "bg-sidebar gap-0.5 p-1.5" : "gap-0.5 p-1.5"}`}
        direction="horizontal"
      >
        <ResizablePanel
          defaultSize={selectedEmployee ? 50 : 100}
          minSize={30}
          className={
            selectedEmployee
              ? "border border-border rounded-md bg-background"
              : "bg-background"
          }
        >
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
            <div className="min-h-full space-y-2">
              <PageHeaderCard
                description={t("employees.description")}
                icon={<Sparkles className="h-4 w-4 text-gray-600" />}
                title={t("employees.title")}
              />

              <MetricsSection
                className={selectedEmployee ? "lg:grid-cols-2" : ""}
                kpis={[
                  {
                    title: t("dashboard.totalEmployees"),
                    value: kpis.totalEmployees,
                    description: `${kpis.activeEmployees} ${t("employees.active")}`,
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    title: t("employees.active"),
                    value: kpis.activeEmployees,
                    description: `${(
                      (kpis.activeEmployees / kpis.totalEmployees) *
                      100
                    ).toFixed(0)}${t("common.ofTotal")}`,
                    icon: <Edit className="h-4 w-4" />,
                  },
                  {
                    title: t("employees.onLeave"),
                    value: kpis.onLeaveEmployees,
                    description: `${(
                      (kpis.onLeaveEmployees / kpis.totalEmployees) *
                      100
                    ).toFixed(0)}${t("common.ofTotal")}`,
                    icon: <Filter className="h-4 w-4" />,
                  },
                  {
                    title: t("dashboard.newHires"),
                    value: kpis.newHiresThisMonth,
                    description: t("dashboard.thisMonth"),
                    icon: <UserPlus className="h-4 w-4" />,
                  },
                ]}
              />

              <div className="flex flex-col gap-2">
                <EmployeesTable
                  agencies={agencies}
                  authorizationStatuses={authorizationStatuses}
                  contracts={contracts}
                  employees={employees}
                  onAddClick={() => setIsCreateDialogOpen(true)}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={handleEditClick}
                  onRowClick={handleRowClick}
                  positions={positions}
                  workLocations={workLocations}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>

        {selectedEmployee && (
          <ResizableHandle className="w-1 bg-transparent hover:bg-border rounded-md transition-all duration-200" />
        )}

        {selectedEmployee && (
          <ResizablePanel
            defaultSize={50}
            minSize={25}
            className="overflow-hidden border border-border rounded-md bg-background"
          >
            <EmployeeDetailPanel
              employee={selectedEmployee}
              agencies={agencies}
              caces={caces}
              contracts={contracts}
              departments={departments}
              drivingAuthorizations={drivingAuthorizations}
              medicalVisits={medicalVisits}
              onlineTrainings={onlineTrainings}
              positions={positions}
              workLocations={workLocations}
              onClose={() => setSelectedEmployee(null)}
            />
          </ResizablePanel>
        )}
        </ResizablePanelGroup>
    </div>

    <CreateEmployeeDialog
        departments={departments}
        onCreate={handleAddEmployee}
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
        positions={positions}
        workLocations={workLocations}
      />
      <DeleteEmployeeDialog
        employeeId={employeeToDelete?.id}
        employeeName={employeeToDelete?.name}
        onConfirm={handleDeleteEmployee}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
      <EditEmployeeDialog
        employee={employeeToEdit}
        contract={
          employeeToEdit
            ? contracts.find(
                (c: any) => c.employeeId === employeeToEdit.id && c.isActive,
              )
            : undefined
        }
        departments={departments}
        agencies={agencies}
        onEdit={handleEditSubmit}
        onOpenChange={(open) => !open && setEmployeeToEdit(null)}
        open={!!employeeToEdit}
        positions={positions}
        workLocations={workLocations}
      />
    </>
  );
}

interface EmployeeDetailPanelProps {
  employee: Employee;
  agencies: any[];
  caces: any[];
  contracts: any[];
  departments: any[];
  drivingAuthorizations: any[];
  medicalVisits: any[];
  onlineTrainings: any[];
  positions: any[];
  workLocations: any[];
  onClose: () => void;
}

function EmployeeDetailPanel({
  employee,
  agencies,
  caces,
  contracts,
  departments,
  drivingAuthorizations,
  medicalVisits,
  onlineTrainings,
  positions,
  workLocations,
  onClose,
}: EmployeeDetailPanelProps) {
  const { t } = useTranslation();

  // Get employee's current contract
  const currentContract = useMemo(() => {
    const now = new Date();
    return contracts.find((c) => {
      if (c.employeeId !== employee.id || !c.isActive) {
        return false;
      }
      if (c.endDate && new Date(c.endDate) < now) {
        return false;
      }
      return true;
    });
  }, [contracts, employee.id]);

  // Get employee's CACES
  const employeeCaces = useMemo(() => {
    return caces.filter((c) => c.employeeId === employee.id);
  }, [caces, employee.id]);

  // Get employee's medical visits
  const employeeMedicalVisits = useMemo(() => {
    return medicalVisits.filter((m) => m.employeeId === employee.id);
  }, [medicalVisits, employee.id]);

  // Get employee's driving authorizations
  const employeeDrivingAuthorizations = useMemo(() => {
    return drivingAuthorizations.filter((d) => d.employeeId === employee.id);
  }, [drivingAuthorizations, employee.id]);

  // Get employee's online trainings
  const employeeTrainings = useMemo(() => {
    return onlineTrainings.filter((t) => t.employeeId === employee.id);
  }, [onlineTrainings, employee.id]);

  // Get position and work location
  const position = positions.find((p) => p.id === employee.positionId);
  const workLocation = workLocations.find(
    (w) => w.id === employee.workLocationId,
  );
  const department = departments.find((d) => d.id === employee.department);
  const agency = agencies.find((a) => a.id === currentContract?.agencyId);

  // Check if certifications are valid (not expired)
  const now = new Date();

  // Valid CACES: at least one not expired
  const validCaces = employeeCaces.some((c: any) => c.expirationDate && new Date(c.expirationDate) > now);

  // Valid medical visit: at least one not expired and completed
  const validMedicalVisit = employeeMedicalVisits.some(
    (m: any) => m.status === "completed" && m.expirationDate && new Date(m.expirationDate) > now
  );

  // Valid driving authorization: at least one not expired
  const validDrivingAuth = employeeDrivingAuthorizations.some(
    (d: any) => d.expirationDate && new Date(d.expirationDate) > now
  );

  // Valid training: at least one completed
  const validTraining = employeeTrainings.some((t: any) => t.status === "completed");

  // Can drive: all 4 conditions met
  const canDrive = validCaces && validMedicalVisit && validDrivingAuth && validTraining;
  const partialDriving = (validCaces ? 1 : 0) + (validMedicalVisit ? 1 : 0) + (validDrivingAuth ? 1 : 0) + (validTraining ? 1 : 0);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-md">
      <Button className="absolute left-2 bottom-2 z-10" onClick={onClose}>
        Close panel
      </Button>

      {/* Header */}
      <div className="border-b p-4 pt-6">
        <PageHeaderCard
          description={employee.email || "-"}
          icon={<Users className="h-4 w-4" />}
          title={`${employee.firstName} ${employee.lastName}`}
        />

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-muted-foreground text-xs">
              {t("common.employeeId")}
            </p>
            <p className="mt-0.5 font-medium text-sm">
              {employee.id.toString().padStart(4, "0")}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-muted-foreground text-xs">
              {t("employees.position")}
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {position?.name || "-"}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-muted-foreground text-xs">
              {t("employees.workLocation")}
            </p>
            <p className="mt-0.5 text-sm">
              {workLocation?.name || "-"}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-muted-foreground text-xs">
              {t("employeeDetail.startDate")}
            </p>
            <p className="mt-0.5 text-sm">
              {employee.hireDate}
            </p>
          </Card>
        </div>
      </div>

      {/* Certifications */}
      <div className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Driving Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* Can Drive Status */}
            <div className="mb-2">
              {canDrive ? (
                <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-3 py-1.5 font-medium text-green-600 text-xs">
                  Authorized to drive
                </span>
              ) : partialDriving > 0 ? (
                <span className="inline-flex items-center rounded-md border border-yellow-500/25 bg-yellow-500/15 px-3 py-1.5 font-medium text-yellow-600 text-xs">
                  Partial ({partialDriving}/4)
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md border border-red-500/25 bg-red-500/15 px-3 py-1.5 font-medium text-red-600 text-xs">
                  Not authorized
                </span>
              )}
            </div>

            {/* CACES */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CACES</span>
              <span className={`font-medium ${validCaces ? "text-green-600" : "text-red-600"}`}>
                {validCaces ? "Valid" : "Invalid"}
              </span>
            </div>
            {/* Medical Visits */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Medical Visit</span>
              <span className={`font-medium ${validMedicalVisit ? "text-green-600" : "text-red-600"}`}>
                {validMedicalVisit ? "Valid" : "Invalid"}
              </span>
            </div>
            {/* Driving Authorizations */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Driving Auth.</span>
              <span className={`font-medium ${validDrivingAuth ? "text-green-600" : "text-red-600"}`}>
                {validDrivingAuth ? "Valid" : "Invalid"}
              </span>
            </div>
            {/* Trainings */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Training</span>
              <span className={`font-medium ${validTraining ? "text-green-600" : "text-red-600"}`}>
                {validTraining ? "Completed" : "Missing"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
