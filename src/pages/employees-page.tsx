import {
  Filter,
  Edit,
  UserPlus,
  Users,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { CreateEmployeeDialog, type CreateEmployeeData } from "@/components/employees/CreateEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { MetricsSection } from "@/components/ui/metrics-section";
import { EmployeesTable } from "@/components/employees/employees-table";
import { useEmployees, useCreateEmployee, useDeleteEmployee, usePositions, useWorkLocations, useContracts } from "@/hooks";

export function EmployeesPage() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Use TanStack Query hooks
  const { data: employees = [], isLoading } = useEmployees()
  const { data: positions = [] } = usePositions()
  const { data: workLocations = [] } = useWorkLocations()
  const { data: contracts = [] } = useContracts()
  const createEmployee = useCreateEmployee()
  const deleteEmployee = useDeleteEmployee()

  // KPIs - calculated dynamically
  const kpis = useMemo(() => {
    // Calculate new hires this month
    const now = new Date()
    const newHiresThisMonth = employees.filter((e) => {
      const hireDate = new Date(e.hireDate)
      return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
    }).length

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      onLeaveEmployees: employees.filter((e) => e.status === "on_leave").length,
      newHiresThisMonth,
    }
  }, [employees])

  const handleAddEmployee = (data: CreateEmployeeData) => {
    createEmployee.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
      }
    })
  }

  const handleDeleteEmployee = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setEmployeeToDelete(null)
        }
      })
    }
  }

  const handleDeleteClick = (employee: { id: number; name: string }) => {
    setEmployeeToDelete(employee)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("employees.title")}
            description={t("employees.description")}
          />
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6 bg-sidebar">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("employees.title")}
            description={t("employees.description")}
          />

          {/* Key Metrics */}
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
                  (kpis.activeEmployees / kpis.totalEmployees) *
                  100
                ).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Edit className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("employees.onLeave"),
                value: kpis.onLeaveEmployees,
                description: `${(
                  (kpis.onLeaveEmployees / kpis.totalEmployees) *
                  100
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

          {/* Employees Table */}
          <EmployeesTable
            employees={employees}
            positions={positions}
            workLocations={workLocations}
            contracts={contracts}
            onDeleteClick={handleDeleteClick}
            onAddClick={() => setIsCreateDialogOpen(true)}
          />
        </div>
      </div>
      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleAddEmployee}
      />
      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteEmployee}
        employeeId={employeeToDelete?.id}
        employeeName={employeeToDelete?.name}
      />
    </>
  );
}
