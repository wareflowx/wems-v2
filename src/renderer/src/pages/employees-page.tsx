import type { Employee } from "@@/db/schema/employees";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Filter, Maximize2, Minimize2, Sparkles, UserPlus, Users, X } from "lucide-react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          defaultSize={isFullscreen ? 0 : selectedEmployee ? 50 : 100}
          minSize={isFullscreen ? 0 : 30}
          className={
            selectedEmployee && !isFullscreen
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

        {selectedEmployee && !isFullscreen && (
          <ResizableHandle className="w-1 bg-transparent hover:bg-border rounded-md transition-all duration-200" />
        )}

        {selectedEmployee && (
          <ResizablePanel
            defaultSize={isFullscreen ? 100 : 50}
            minSize={isFullscreen ? 100 : 25}
            className={`overflow-hidden border border-border rounded-md bg-background`}
          >
            <EmployeeDetailPanel
              employee={selectedEmployee}
              agencies={agencies}
              caces={caces}
              contracts={contracts}
              departments={departments}
              drivingAuthorizations={drivingAuthorizations}
              isFullscreen={isFullscreen}
              medicalVisits={medicalVisits}
              onlineTrainings={onlineTrainings}
              positions={positions}
              workLocations={workLocations}
              onClose={() => setSelectedEmployee(null)}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
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
  isFullscreen: boolean;
  medicalVisits: any[];
  onlineTrainings: any[];
  positions: any[];
  workLocations: any[];
  onClose: () => void;
  onToggleFullscreen: () => void;
}

function EmployeeDetailPanel({
  employee,
  agencies,
  caces,
  contracts,
  departments,
  drivingAuthorizations,
  isFullscreen,
  medicalVisits,
  onlineTrainings,
  positions,
  workLocations,
  onClose,
  onToggleFullscreen,
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Can Drive Status */}
        <div>
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

        {/* CACES Table */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
            CACES
            {validCaces ? (
              <span className="text-green-600 text-xs font-normal">Valid</span>
            ) : (
              <span className="text-red-600 text-xs font-normal">Invalid</span>
            )}
          </h3>
          {employeeCaces.length === 0 ? (
            <p className="text-muted-foreground text-sm">No CACES records</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Obtained</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeCaces.map((c: any) => {
                    const isExpired = c.expirationDate && new Date(c.expirationDate) < now;
                    return (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-medium">{c.category}</td>
                        <td className="px-3 py-2">{c.dateObtained}</td>
                        <td className="px-3 py-2">{c.expirationDate}</td>
                        <td className="px-3 py-2">
                          {isExpired ? (
                            <span className="text-red-600 font-medium">Expired</span>
                          ) : (
                            <span className="text-green-600 font-medium">Valid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Medical Visits Table */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
            Medical Visits
            {validMedicalVisit ? (
              <span className="text-green-600 text-xs font-normal">Valid</span>
            ) : (
              <span className="text-red-600 text-xs font-normal">Invalid</span>
            )}
          </h3>
          {employeeMedicalVisits.length === 0 ? (
            <p className="text-muted-foreground text-sm">No medical visits</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Scheduled</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Completed</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fitness</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeMedicalVisits.map((m: any) => {
                    const isExpired = m.expirationDate && new Date(m.expirationDate) < now;
                    return (
                      <tr key={m.id}>
                        <td className="px-3 py-2 font-medium">{m.type}</td>
                        <td className="px-3 py-2">{m.scheduledDate}</td>
                        <td className="px-3 py-2">{m.actualDate || "-"}</td>
                        <td className="px-3 py-2">{m.fitnessStatus || "-"}</td>
                        <td className="px-3 py-2">
                          {m.status === "completed" ? (
                            isExpired ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : (
                              <span className="text-green-600 font-medium">Valid</span>
                            )
                          ) : m.status === "scheduled" ? (
                            <span className="text-blue-600 font-medium">Scheduled</span>
                          ) : m.status === "overdue" ? (
                            <span className="text-orange-600 font-medium">Overdue</span>
                          ) : (
                            <span className="text-muted-foreground">{m.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Driving Authorizations Table */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
            Driving Authorizations
            {validDrivingAuth ? (
              <span className="text-green-600 text-xs font-normal">Valid</span>
            ) : (
              <span className="text-red-600 text-xs font-normal">Invalid</span>
            )}
          </h3>
          {employeeDrivingAuthorizations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No driving authorizations</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">License</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Obtained</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeDrivingAuthorizations.map((d: any) => {
                    const isExpired = d.expirationDate && new Date(d.expirationDate) < now;
                    return (
                      <tr key={d.id}>
                        <td className="px-3 py-2 font-medium">{d.licenseCategory}</td>
                        <td className="px-3 py-2">{d.dateObtained}</td>
                        <td className="px-3 py-2">{d.expirationDate}</td>
                        <td className="px-3 py-2">
                          {isExpired ? (
                            <span className="text-red-600 font-medium">Expired</span>
                          ) : (
                            <span className="text-green-600 font-medium">Valid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Online Trainings Table */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
            Trainings
            {validTraining ? (
              <span className="text-green-600 text-xs font-normal">Completed</span>
            ) : (
              <span className="text-red-600 text-xs font-normal">Missing</span>
            )}
          </h3>
          {employeeTrainings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trainings</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Training</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Completed</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Expires</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeTrainings.map((t: any) => {
                    const isExpired = t.expirationDate && new Date(t.expirationDate) < now;
                    return (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-medium">{t.trainingName}</td>
                        <td className="px-3 py-2">{t.trainingProvider || "-"}</td>
                        <td className="px-3 py-2">{t.completionDate}</td>
                        <td className="px-3 py-2">{t.expirationDate || "-"}</td>
                        <td className="px-3 py-2">
                          {t.status === "completed" ? (
                            isExpired ? (
                              <span className="text-orange-600 font-medium">Expired</span>
                            ) : (
                              <span className="text-green-600 font-medium">Completed</span>
                            )
                          ) : t.status === "in_progress" ? (
                            <span className="text-blue-600 font-medium">In Progress</span>
                          ) : (
                            <span className="text-red-600 font-medium">{t.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {isFullscreen ? (
            <Button onClick={onToggleFullscreen}>
              <Minimize2 className="mr-1 h-4 w-4" />
              Exit Fullscreen
            </Button>
          ) : (
            <>
              <Button onClick={onToggleFullscreen}>
                <Maximize2 className="mr-1 h-4 w-4" />
                Fullscreen
              </Button>
              <Button onClick={onClose}>
                <X className="mr-1 h-4 w-4" />
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
