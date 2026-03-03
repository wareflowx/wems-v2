import { useQueryClient } from "@tanstack/react-query";
import { Edit, Filter, Sparkles, UserPlus, Users } from "lucide-react";
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
  useAgencies,
  useContracts,
  useCreateEmployee,
  useDeleteEmployee,
  useDepartments,
  useEmployees,
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
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<any | null>(null);

  // Use TanStack Query hooks
  const { data: employees = [], isLoading, error } = useEmployees();
  const { data: positions = [] } = usePositions();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: contracts = [] } = useContracts();
  const { data: departments = [] } = useDepartments();
  const { data: agencies = [] } = useAgencies();
  const { data: authorizationStatusesData = [] } = useAllDrivingAuthorizationStatuses();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();

  // Convert authorization statuses array to a Map
  const authorizationStatuses = useMemo(() => {
    const map = new Map<number, import("@/core/lib/driving-authorization").DrivingAuthorizationStatusResult>();
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
            "Make sure the application is running correctly. If the problem persists, please restart."
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        <PageHeaderCard
          description={t("employees.description")}
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("employees.title")}
        />

        <MetricsSection
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
                (kpis.activeEmployees / kpis.totalEmployees) * 100
              ).toFixed(0)}${t("common.ofTotal")}`,
              icon: <Edit className="h-4 w-4" />,
              iconColor: "text-green-500",
            },
            {
              title: t("employees.onLeave"),
              value: kpis.onLeaveEmployees,
              description: `${(
                (kpis.onLeaveEmployees / kpis.totalEmployees) * 100
              ).toFixed(0)}${t("common.ofTotal")}`,
              icon: <Filter className="h-4 w-4" />,
              iconColor: "text-yellow-500",
            },
            {
              title: t("dashboard.newHires"),
              value: kpis.newHiresThisMonth,
              description: t("dashboard.thisMonth"),
              icon: <UserPlus className="h-4 w-4" />,
              iconColor: "text-green-500",
            },
          ]}
        />

        <EmployeesTable
          authorizationStatuses={authorizationStatuses}
          contracts={contracts}
          employees={employees}
          onAddClick={() => setIsCreateDialogOpen(true)}
          onDeleteClick={handleDeleteClick}
          onEditClick={handleEditClick}
          positions={positions}
          workLocations={workLocations}
        />
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
        contract={employeeToEdit ? contracts.find((c: any) => c.employeeId === employeeToEdit.id && c.isActive) : undefined}
        departments={departments}
        agencies={agencies}
        onEdit={handleEditSubmit}
        onOpenChange={(open) => !open && setEmployeeToEdit(null)}
        open={!!employeeToEdit}
        positions={positions}
        workLocations={workLocations}
      />
    </div>
  );
}
