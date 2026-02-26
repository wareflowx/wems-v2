import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
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
import { AddCacesDialog } from "@/components/caces/AddCacesDialog";
import { EditCacesDialog } from "@/components/caces/EditCacesDialog";
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
  useCaces,
  useCreateCaces,
  useDeleteCaces,
  useEmployees,
  useUpdateCaces,
} from "@/hooks";

export function CacesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCaces, setEditingCaces] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<string>("employee");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use TanStack Query hooks
  const { data: caces = [], isLoading } = useCaces();
  const { data: employees = [] } = useEmployees();
  const createCaces = useCreateCaces();
  const updateCaces = useUpdateCaces();
  const deleteCaces = useDeleteCaces();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalCaces: caces.length,
      expiredCaces: caces.filter((c) => c.status === "expired").length,
      warningCaces: caces.filter((c) => c.status === "warning").length,
      validCaces: caces.filter((c) => c.status === "valid").length,
    }),
    [caces]
  );

  // Get unique categories, statuses and employees
  const uniqueCategories = useMemo(() => {
    const categories = new Set(caces.map((c) => c.category));
    return Array.from(categories);
  }, [caces]);

  const _uniqueStatuses = useMemo(() => {
    const statuses = new Set(caces.map((c) => c.status));
    return Array.from(statuses);
  }, [caces]);

  const uniqueEmployees = useMemo(() => {
    const employees = new Map<number, string>();
    caces.forEach((c) => {
      if (c.employee) {
        employees.set(c.employee.id, `${c.employee.firstName} ${c.employee.lastName}`);
      }
    });
    return Array.from(employees.entries()).map(([id, name]) => ({ id, name }));
  }, [caces]);

  // Filter CACES
  const filteredCaces = useMemo(() => {
    return caces.filter((cace) => {
      const employeeName = cace.employee ? `${cace.employee.firstName} ${cace.employee.lastName}` : "";

      const matchesSearch =
        search === "" ||
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        cace.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || cace.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || cace.status === statusFilter;
      const matchesEmployee =
        employeeFilter === "all" || employeeName === employeeFilter;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesEmployee
      );
    });
  }, [caces, search, categoryFilter, statusFilter, employeeFilter]);

  // Sort CACES
  const sortedCaces = useMemo(() => {
    const sorted = [...filteredCaces].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a];
      let bValue: any = b[sortColumn as keyof typeof b];

      if (sortColumn === "daysLeft") {
        aValue = a.daysLeft;
        bValue = b.daysLeft;
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredCaces, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedCaces.length / itemsPerPage);
  const paginatedCaces = sortedCaces.slice(
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
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    const badgeContent = () => {
      switch (status) {
        case "expired":
          return (
            <span className="inline-flex items-center rounded-md border border-red-500/25 bg-red-500/15 px-2 py-0.5 font-medium text-red-700 text-xs">
              {t("caces.expired")}
            </span>
          );
        case "warning":
          return (
            <span className="inline-flex items-center rounded-md border border-yellow-600/25 bg-yellow-600/15 px-2 py-0.5 font-medium text-xs text-yellow-700">
              {t("caces.expiringSoon")}
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center rounded-md border border-green-600/25 bg-green-600/15 px-2 py-0.5 font-medium text-green-700 text-xs">
              {t("caces.valid")}
            </span>
          );
      }
    };

    const tooltipContent = () => {
      switch (status) {
        case "expired":
          return t("caces.tooltip.statusExpired");
        case "warning":
          return t("caces.tooltip.statusExpiringSoon");
        default:
          return t("caces.tooltip.statusValid");
      }
    };

    return (
      <Tooltip>
        <TooltipTrigger>{badgeContent()}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      "1A": "bg-blue-500",
      "1B": "bg-indigo-500",
      "3": "bg-purple-500",
      "5": "bg-pink-500",
      "7": "bg-teal-500",
    };
    const dotColor = categoryColors[category] || "bg-gray-500";

    const badge = (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        CACES {category}
      </span>
    );

    const tooltipKey = `caces.tooltip.category${category.toLowerCase()}`;

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{t(tooltipKey)}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getDaysBadge = (daysLeft: number) => {
    let dotColor: string;
    let text: string;

    if (daysLeft < 0) {
      dotColor = "bg-red-500";
      text = `${Math.abs(daysLeft)} ${t("caces.daysOverdue")}`;
    } else if (daysLeft <= 30) {
      dotColor = "bg-yellow-600";
      text = `${daysLeft} ${t("caces.daysLeft")}`;
    } else {
      dotColor = "bg-green-600";
      text = `${daysLeft} ${t("caces.daysLeft")}`;
    }

    const tooltipContent = () => {
      if (daysLeft < 0) {
        return t("caces.tooltip.daysOverdue");
      }
      return t("caces.tooltip.daysLeft");
    };

    const badge = (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {text}
      </span>
    );

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleAddCaces = (data: any) => {
    createCaces.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  const handleEditCaces = (data: any) => {
    updateCaces.mutate(
      { id: editingCaces.id, ...data },
      {
        onSuccess: () => {
          setEditingCaces(null);
        },
      }
    );
  };

  const _handleDeleteCaces = (id: number) => {
    deleteCaces.mutate(id, {
      onSuccess: () => {
        // Dialog will be closed by the component calling this
      },
    });
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
            description={t("caces.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("caces.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("caces.totalCaces"),
                value: kpis.totalCaces,
                description: `${kpis.validCaces} ${t("caces.valid")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
              },
              {
                title: t("caces.expired"),
                value: kpis.expiredCaces,
                description: `${((kpis.expiredCaces / kpis.totalCaces) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: t("caces.expiringSoon"),
                value: kpis.warningCaces,
                description: `${((kpis.warningCaces / kpis.totalCaces) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Filter className="h-4 w-4" />,
                iconColor: "text-yellow-500",
              },
              {
                title: t("caces.valid"),
                value: kpis.validCaces,
                description: `${((kpis.validCaces / kpis.totalCaces) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
            ]}
          />

          <div className="flex flex-col gap-2">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="bg-card pl-9"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("caces.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("caces.category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("caces.allCategories")}
                  </SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("caces.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("caces.allStatuses")}</SelectItem>
                  <SelectItem value="expired">{t("caces.expired")}</SelectItem>
                  <SelectItem value="warning">
                    {t("caces.expiringSoon")}
                  </SelectItem>
                  <SelectItem value="valid">{t("caces.valid")}</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setEmployeeFilter} value={employeeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("caces.employee")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("dashboard.allEmployees")}
                  </SelectItem>
                  {uniqueEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("caces.addCaces")}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("employee")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("caces.employee")}
                          {getSortIcon("employee")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("category")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("caces.category")}
                          {getSortIcon("category")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("dateObtained")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("caces.issueDate")}
                          {getSortIcon("dateObtained")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("expirationDate")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("caces.expiryDate")}
                          {getSortIcon("expirationDate")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("daysLeft")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("dashboard.days")}
                          {getSortIcon("daysLeft")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("status")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("caces.status")}
                          {getSortIcon("status")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      {t("caces.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCaces.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-64" colSpan={7}>
                        <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <SearchX className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="font-medium text-lg">
                            {t("common.noData")}
                          </p>
                          <p className="mt-2 max-w-md text-center text-sm">
                            {t("dashboard.noDataFound")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCaces.map((cacesItem) => (
                      <TableRow
                        className="hover:bg-muted/50"
                        key={cacesItem.id}
                      >
                        <TableCell className="px-4">
                          <Link
                            className="text-gray-700 underline transition-opacity hover:opacity-80"
                            to={`/employees_/${cacesItem.employeeId}`}
                          >
                            {cacesItem.employee ? `${cacesItem.employee.firstName} ${cacesItem.employee.lastName}` : "-"}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4">
                          {getCategoryBadge(cacesItem.category)}
                        </TableCell>
                        <TableCell className="px-4 text-gray-700">
                          {cacesItem.dateObtained}
                        </TableCell>
                        <TableCell className="px-4 text-gray-700">
                          {cacesItem.expirationDate}
                        </TableCell>
                        <TableCell className="px-4">
                          {getDaysBadge(cacesItem.daysLeft)}
                        </TableCell>
                        <TableCell className="px-4">
                          {getStatusBadge(cacesItem.status)}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingCaces(cacesItem)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Download className="h-4 w-4" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {t("caces.showing", {
                  from: (currentPage - 1) * itemsPerPage + 1,
                  to: Math.min(currentPage * itemsPerPage, sortedCaces.length),
                  total: sortedCaces.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        className="h-8 w-8"
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        size="icon"
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddCacesDialog
        employees={employees}
        onAdd={handleAddCaces}
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
      />
      <EditCacesDialog
        caces={editingCaces}
        onOpenChange={(open) => !open && setEditingCaces(null)}
        onUpdate={handleEditCaces}
        open={editingCaces !== null}
      />
    </>
  );
}
