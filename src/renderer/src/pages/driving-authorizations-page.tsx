"use client";

import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Filter,
  Plus,
  Search,
  SearchX,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddDrivingAuthorizationDialog } from "@/components/driving-authorizations/AddDrivingAuthorizationDialog";
import { EditDrivingAuthorizationDialog } from "@/components/driving-authorizations/EditDrivingAuthorizationDialog";
import { useToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricsSection } from "@/components/ui/metrics-section";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useDrivingAuthorizations,
  useCreateDrivingAuthorization,
  useDeleteDrivingAuthorization,
  useUpdateDrivingAuthorization,
  useEmployees,
} from "@/hooks";

export function DrivingAuthorizationsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAuthorization, setEditingAuthorization] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<string>("employee");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use TanStack Query hooks
  const { data: authorizations = [], isLoading } = useDrivingAuthorizations();
  const { data: employees = [] } = useEmployees();
  const createAuthorization = useCreateDrivingAuthorization();
  const updateAuthorization = useUpdateDrivingAuthorization();
  const deleteAuthorization = useDeleteDrivingAuthorization();

  // Calculate status for each authorization
  const authorizationsWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return authorizations.map((auth: any) => {
      const expDate = new Date(auth.expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status = "valid";
      if (daysLeft < 0) status = "expired";
      else if (daysLeft <= 30) status = "warning";

      return { ...auth, status, daysLeft };
    });
  }, [authorizations]);

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalAuthorizations: authorizationsWithStatus.length,
      expiredAuthorizations: authorizationsWithStatus.filter((a: any) => a.status === "expired").length,
      warningAuthorizations: authorizationsWithStatus.filter((a: any) => a.status === "warning").length,
      validAuthorizations: authorizationsWithStatus.filter((a: any) => a.status === "valid").length,
    }),
    [authorizationsWithStatus]
  );

  // Get unique categories and employees
  const uniqueCategories = useMemo(() => {
    const categories = new Set(authorizations.map((a: any) => a.licenseCategory));
    return Array.from(categories);
  }, [authorizations]);

  const uniqueEmployees = useMemo(() => {
    const employeeMap = new Map<number, string>();
    authorizations.forEach((a: any) => {
      const emp = employees.find((e) => e.id === a.employeeId);
      if (emp) {
        employeeMap.set(emp.id, `${emp.firstName} ${emp.lastName}`);
      }
    });
    return Array.from(employeeMap.entries()).map(([id, name]) => ({ id, name }));
  }, [authorizations, employees]);

  // Filter authorizations
  const filteredAuthorizations = useMemo(() => {
    return authorizationsWithStatus.filter((auth: any) => {
      const emp = employees.find((e) => e.id === auth.employeeId);
      const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : "";

      const matchesSearch =
        search === "" ||
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        auth.licenseCategory.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || auth.licenseCategory === categoryFilter;
      const matchesStatus = statusFilter === "all" || auth.status === statusFilter;
      const matchesEmployee =
        employeeFilter === "all" || employeeName === employeeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesEmployee;
    });
  }, [authorizationsWithStatus, search, categoryFilter, statusFilter, employeeFilter, employees]);

  // Sort authorizations
  const sortedAuthorizations = useMemo(() => {
    const sorted = [...filteredAuthorizations].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === "employee") {
        const empA = employees.find((e) => e.id === a.employeeId);
        const empB = employees.find((e) => e.id === b.employeeId);
        aValue = empA ? `${empA.firstName} ${empA.lastName}` : "";
        bValue = empB ? `${empB.firstName} ${empB.lastName}` : "";
      } else if (sortColumn === "daysLeft") {
        aValue = a.daysLeft;
        bValue = b.daysLeft;
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredAuthorizations, sortColumn, sortDirection, employees]);

  // Paginate
  const totalPages = Math.ceil(sortedAuthorizations.length / itemsPerPage);
  const paginatedAuthorizations = sortedAuthorizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAdd = (data: any) => {
    createAuthorization.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  const handleEdit = (data: any) => {
    updateAuthorization.mutate(data, {
      onSuccess: () => {
        setEditingAuthorization(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("drivingAuthorizations.confirmDelete"))) {
      deleteAuthorization.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "expired":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderSkeleton metricsCount={4} showMetrics />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            description={t("drivingAuthorizations.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("drivingAuthorizations.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("drivingAuthorizations.totalDrivingAuthorizations"),
                value: kpis.totalAuthorizations,
                description: `${kpis.validAuthorizations} ${t("drivingAuthorizations.valid")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
              },
              {
                title: t("drivingAuthorizations.expired"),
                value: kpis.expiredAuthorizations,
                description: `${((kpis.expiredAuthorizations / kpis.totalAuthorizations) * 100).toFixed(0)}${t("drivingAuthorizations.ofTotal")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: t("drivingAuthorizations.expiringSoon"),
                value: kpis.warningAuthorizations,
                description: `${((kpis.warningAuthorizations / kpis.totalAuthorizations) * 100).toFixed(0)}${t("drivingAuthorizations.ofTotal")}`,
                icon: <Filter className="h-4 w-4" />,
                iconColor: "text-yellow-500",
              },
              {
                title: t("drivingAuthorizations.valid"),
                value: kpis.validAuthorizations,
                description: `${((kpis.validAuthorizations / kpis.totalAuthorizations) * 100).toFixed(0)}${t("drivingAuthorizations.ofTotal")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
            ]}
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t("drivingAuthorizations.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("drivingAuthorizations.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {uniqueCategories.map((cat: any) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("drivingAuthorizations.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="valid">{t("drivingAuthorizations.valid")}</SelectItem>
                <SelectItem value="warning">{t("drivingAuthorizations.warning")}</SelectItem>
                <SelectItem value="expired">{t("drivingAuthorizations.expired")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("drivingAuthorizations.employee")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {uniqueEmployees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("drivingAuthorizations.add")}
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4" onClick={() => handleSort("employee")} >
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("drivingAuthorizations.employee")}
                      {sortColumn === "employee" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("licenseCategory")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("drivingAuthorizations.category")}
                      {sortColumn === "licenseCategory" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("dateObtained")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("drivingAuthorizations.dateObtained")}
                      {sortColumn === "dateObtained" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("expirationDate")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("drivingAuthorizations.expirationDate")}
                      {sortColumn === "expirationDate" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("daysLeft")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("drivingAuthorizations.status")}
                      {sortColumn === "daysLeft" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4 text-right">
                    {t("drivingAuthorizations.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAuthorizations.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-64" colSpan={6}>
                      <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <SearchX className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="font-medium text-lg">
                          {t("drivingAuthorizations.empty")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAuthorizations.map((auth: any) => {
                    const emp = employees.find((e) => e.id === auth.employeeId);
                    return (
                      <TableRow className="hover:bg-muted/50" key={auth.id}>
                        <TableCell className="px-4 font-medium">
                          {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown"}
                        </TableCell>
                        <TableCell className="px-4">{auth.licenseCategory}</TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {new Date(auth.dateObtained).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {new Date(auth.expirationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className={`font-medium ${getStatusColor(auth.status)}`}>
                            {auth.status === "expired" && t("drivingAuthorizations.expired")}
                            {auth.status === "warning" && t("drivingAuthorizations.warning")}
                            {auth.status === "valid" && t("drivingAuthorizations.valid")}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingAuthorization(auth)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("drivingAuthorizations.edit")}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(auth.id)}
                                >
                                  {t("drivingAuthorizations.delete")}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("drivingAuthorizations.delete")}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("common.showing")} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedAuthorizations.length)} {t("common.of")} {sortedAuthorizations.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddDrivingAuthorizationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
        employees={employees}
      />
      <EditDrivingAuthorizationDialog
        open={!!editingAuthorization}
        onOpenChange={(open) => !open && setEditingAuthorization(null)}
        onEdit={handleEdit}
        employees={employees}
        authorization={editingAuthorization}
      />
    </>
  );
}
