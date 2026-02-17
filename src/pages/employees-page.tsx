import {
  Search,
  SearchX,
  Filter,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { MetricsSection } from "@/components/ui/metrics-section";
import { Link } from "@tanstack/react-router";

export function EmployeesPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const itemsPerPage = 10;

  const employees = [
    {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      contract: "CDI",
      jobTitle: "operator",
      workLocation: "Site A",
      status: "active",
      startDate: "2023-01-15",
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Martin",
      contract: "CDD",
      jobTitle: "accountant",
      workLocation: "Site B",
      status: "active",
      startDate: "2022-06-01",
    },
    {
      id: 3,
      firstName: "Pierre",
      lastName: "Bernard",
      contract: "Intérim",
      jobTitle: "technician",
      workLocation: "Site A",
      status: "on_leave",
      startDate: "2021-03-10",
    },
    {
      id: 4,
      firstName: "Sophie",
      lastName: "Petit",
      contract: "CDI",
      jobTitle: "hrManager",
      workLocation: "Site C",
      status: "active",
      startDate: "2020-09-20",
    },
    {
      id: 5,
      firstName: "Luc",
      lastName: "Dubois",
      contract: "CDD",
      jobTitle: "operator",
      workLocation: "Site A",
      status: "active",
      startDate: "2024-01-08",
    },
  ];

  // KPIs
  const kpis = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.status === "active").length,
    onLeaveEmployees: employees.filter((e) => e.status === "on_leave").length,
    newHiresThisMonth: 3,
  };

  // Get unique contracts and statuses
  const uniqueContracts = useMemo(() => {
    const contracts = new Set(employees.map((e) => e.contract));
    return Array.from(contracts);
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(employees.map((e) => e.status));
    return Array.from(statuses);
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        search === "" ||
        employee.firstName.toLowerCase().includes(search.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
        `${employee.firstName} ${employee.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesContract =
        departmentFilter === "all" || employee.contract === departmentFilter;
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;

      return matchesSearch && matchesContract && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/15 border border-green-500/25 text-green-600">
            {t("employees.active")}
          </span>
        );
      case "on_leave":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/15 border border-yellow-500/25 text-yellow-600">
            {t("employees.onLeave")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/15 border border-gray-500/25 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const getContractBadge = (contract: string) => {
    const contractColors: { [key: string]: string } = {
      CDI: "bg-blue-500/15 border border-blue-500/25 text-blue-600",
      CDD: "bg-orange-500/15 border border-orange-500/25 text-orange-600",
      Intérim: "bg-teal-500/15 border border-teal-500/25 text-teal-600",
    };
    const colors =
      contractColors[contract] ||
      "bg-gray-500/15 border border-gray-500/25 text-gray-600";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors}`}
      >
        {contract}
      </span>
    );
  };

  const getPositionBadge = (position: string) => {
    const positionColors: { [key: string]: string } = {
      operator: "bg-emerald-500",
      technician: "bg-amber-500",
      accountant: "bg-indigo-500",
      hrManager: "bg-rose-500",
    };
    const dotColor = positionColors[position] || "bg-gray-500";
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {t(`positions.${position}`)}
      </span>
    );
  };

  const getWorkLocationBadge = (location: string) => {
    const locationColors: { [key: string]: string } = {
      "Site A": "bg-cyan-500",
      "Site B": "bg-amber-500",
      "Site C": "bg-violet-500",
    };
    const dotColor = locationColors[location] || "bg-gray-500";
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {location}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
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

          <div className="flex gap-2 flex-col">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("employees.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("employeeDetail.contractType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allContracts")}</SelectItem>
                  {uniqueContracts.map((contract) => (
                    <SelectItem key={contract} value={contract}>
                      {contract}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder={t("employeeDetail.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "active"
                        ? t("employees.active")
                        : status === "on_leave"
                          ? t("employees.onLeave")
                          : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="gap-2 ml-auto"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                {t("employees.addEmployee")}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      {t("employeeDetail.fullName")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("employeeDetail.contractType")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("employees.position")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("employees.workLocation")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("employeeDetail.status")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("employeeDetail.startDate")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("employees.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64">
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <SearchX className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">
                            {t("common.noData")}
                          </p>
                          <p className="text-sm mt-2 max-w-md text-center">
                            {t("dashboard.noDataFound")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/50">
                        <TableCell className="px-4">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="text-gray-700 underline hover:opacity-80 transition-opacity"
                          >
                            {employee.firstName} {employee.lastName}
                          </Link>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {t("common.employeeId")}
                            {employee.id.toString().padStart(4, "0")}
                          </p>
                        </TableCell>
                        <TableCell className="px-4">
                          {getContractBadge(employee.contract)}
                        </TableCell>
                        <TableCell className="px-4">
                          {getPositionBadge(employee.jobTitle)}
                        </TableCell>
                        <TableCell className="px-4">
                          {getWorkLocationBadge(employee.workLocation)}
                        </TableCell>
                        <TableCell className="px-4">
                          {getStatusBadge(employee.status)}
                        </TableCell>
                        <TableCell className="px-4 text-gray-700">
                          {employee.startDate}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEmployeeToDelete({
                                  id: employee.id,
                                  name: `${employee.firstName} ${employee.lastName}`,
                                });
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("common.view")} de {startIndex + 1} à{" "}
              {Math.min(endIndex, filteredEmployees.length)} sur{" "}
              {filteredEmployees.length} {t("common.employees")}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // TODO: Refresh employees list
        }}
      />
      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          // TODO: Refresh employees list
        }}
        employeeId={employeeToDelete?.id}
        employeeName={employeeToDelete?.name}
      />
    </>
  );
}
