import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Edit,
  FileText,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddMedicalVisitDialog } from "@/components/medical-visits/AddMedicalVisitDialog";
import { DeleteMedicalVisitDialog } from "@/components/medical-visits/DeleteMedicalVisitDialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateMedicalVisit,
  useDeleteMedicalVisit,
  useMedicalVisits,
} from "@/hooks";

interface MedicalVisit {
  id: number;
  employee: string;
  employeeId: number;
  type: string;
  scheduledDate: string;
  status: string;
  daysUntil?: number;
  actualDate?: string;
  fitnessStatus?: string;
}

export function MedicalVisitsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("employee");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<MedicalVisit | undefined>(
    undefined
  );
  const itemsPerPage = 10;

  // Use TanStack Query hooks
  const { data: visits = [], isLoading } = useMedicalVisits();
  const createMedicalVisit = useCreateMedicalVisit();
  const deleteMedicalVisit = useDeleteMedicalVisit();

  // Get unique types, statuses and employees
  const uniqueTypes = useMemo(() => {
    const types = new Set(visits.map((v) => v.type));
    return Array.from(types);
  }, [visits]);

  const _uniqueStatuses = useMemo(() => {
    const statuses = new Set(visits.map((v) => v.status));
    return Array.from(statuses);
  }, [visits]);

  const uniqueEmployees = useMemo(() => {
    const employees = new Set(visits.map((v) => v.employee));
    return Array.from(employees);
  }, [visits]);

  // Filter visits
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matchesSearch =
        search === "" ||
        visit.employee.toLowerCase().includes(search.toLowerCase()) ||
        visit.type.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || visit.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || visit.status === statusFilter;
      const matchesEmployee =
        employeeFilter === "all" || visit.employee === employeeFilter;

      return matchesSearch && matchesType && matchesStatus && matchesEmployee;
    });
  }, [visits, search, typeFilter, statusFilter, employeeFilter]);

  // Sort visits
  const sortedVisits = useMemo(() => {
    const sorted = [...filteredVisits].sort((a, b) => {
      const aValue: any = a[sortColumn as keyof typeof a];
      const bValue: any = b[sortColumn as keyof typeof b];

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredVisits, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedVisits.length / itemsPerPage);
  const paginatedVisits = sortedVisits.slice(
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

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalVisits: visits.length,
      overdueVisits: visits.filter((v) => v.status === "overdue").length,
      upcomingVisits: visits.filter((v) => v.status === "scheduled").length,
      completedVisits: visits.filter((v) => v.status === "completed").length,
    }),
    [visits]
  );

  const getStatusBadge = (status: string, _daysUntil?: number) => {
    const statusMap = {
      scheduled: {
        label: t("medicalVisits.scheduled"),
        variant: "default" as const,
        color: "bg-blue-600/10 border border-blue-600/20 text-blue-700",
        tooltip: t("medicalVisits.tooltip.statusScheduled"),
      },
      overdue: {
        label: t("medicalVisits.overdue"),
        variant: "destructive" as const,
        color: "bg-red-600/10 border border-red-600/20 text-red-700",
        tooltip: t("medicalVisits.tooltip.statusOverdue"),
      },
      completed: {
        label: t("medicalVisits.completed"),
        variant: "secondary" as const,
        color: "bg-green-600/10 border border-green-600/20 text-green-700",
        tooltip: t("medicalVisits.tooltip.statusCompleted"),
      },
      cancelled: {
        label: t("medicalVisits.cancelled"),
        variant: "outline" as const,
        color: "bg-gray-600/10 border border-gray-600/20 text-gray-700",
        tooltip: t("medicalVisits.tooltip.statusCancelled"),
      },
    };
    const { label, color, tooltip } =
      statusMap[status as keyof typeof statusMap] || statusMap.scheduled;

    return (
      <Tooltip>
        <TooltipTrigger>{badgeContent(label, color)}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const badgeContent = (label: string, color: string) => (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs ${color}`}
    >
      {label}
    </span>
  );

  const getTypeBadge = (type: string) => {
    const typeMap = {
      "Visite périodique": {
        label: t("medicalVisits.periodicVisit"),
        dotColor: "bg-purple-600",
        tooltip: t("medicalVisits.tooltip.periodicVisit"),
      },
      "Visite de reprise": {
        label: t("medicalVisits.returnVisit"),
        dotColor: "bg-orange-600",
        tooltip: t("medicalVisits.tooltip.returnVisit"),
      },
      "Visite initiale": {
        label: t("medicalVisits.initialVisit"),
        dotColor: "bg-teal-600",
        tooltip: t("medicalVisits.tooltip.initialVisit"),
      },
    };
    const config = typeMap[type as keyof typeof typeMap] || {
      label: type,
      dotColor: "bg-gray-600",
      tooltip: type,
    };

    const badge = (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
        {config.label}
      </span>
    );

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleDelete = (visit: MedicalVisit) => {
    setSelectedVisit(visit);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (visit: MedicalVisit) => {
    // TODO: Implement edit functionality
    console.log("Edit visit:", visit);
  };

  const handleAddMedicalVisit = (data: any) => {
    createMedicalVisit.mutate(data, {
      onSuccess: () => {
        setAddDialogOpen(false);
      },
    });
  };

  const handleDeleteMedicalVisit = () => {
    if (selectedVisit) {
      deleteMedicalVisit.mutate(selectedVisit.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedVisit(undefined);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="min-h-full space-y-3">
            <PageHeaderCard
              description={t("medicalVisits.description")}
              icon={<Sparkles className="h-4 w-4 text-gray-600" />}
              title={t("medicalVisits.title")}
            />
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            description="Planifiez et suivez les visites médicales obligatoires de vos employés"
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("medicalVisits.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("medicalVisits.total"),
                value: kpis.totalVisits,
                description: "Total visites",
                icon: <FileText className="h-4 w-4" />,
              },
              {
                title: t("medicalVisits.overdue"),
                value: kpis.overdueVisits,
                description: `${((kpis.overdueVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <AlertTriangle className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: t("medicalVisits.upcoming"),
                value: kpis.upcomingVisits,
                description: `${((kpis.upcomingVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <Calendar className="h-4 w-4" />,
                iconColor: "text-blue-500",
              },
              {
                title: t("medicalVisits.completed"),
                value: kpis.completedVisits,
                description: `${((kpis.completedVisits / kpis.totalVisits) * 100).toFixed(0)}% du total`,
                icon: <CheckCircle2 className="h-4 w-4" />,
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
                  placeholder={t("common.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setTypeFilter} value={typeFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("medicalVisits.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px] bg-card">
                  <SelectValue placeholder={t("medicalVisits.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="scheduled">
                    {t("medicalVisits.scheduled")}
                  </SelectItem>
                  <SelectItem value="overdue">
                    {t("medicalVisits.overdue")}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("medicalVisits.completed")}
                  </SelectItem>
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
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("medicalVisits.newVisit")}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card">
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
                          {t("medicalVisits.employee")}
                          {getSortIcon("employee")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("type")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("medicalVisits.type")}
                          {getSortIcon("type")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="px-4">
                      <Button
                        className="-ml-4 h-8 font-medium hover:bg-muted"
                        onClick={() => handleSort("scheduledDate")}
                        size="sm"
                        variant="ghost"
                      >
                        <div className="flex items-center gap-1">
                          {t("medicalVisits.scheduledDate")}
                          {getSortIcon("scheduledDate")}
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
                          {t("medicalVisits.status")}
                          {getSortIcon("status")}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVisits.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-64" colSpan={5}>
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
                    paginatedVisits.map((visit) => (
                      <TableRow className="hover:bg-muted/50" key={visit.id}>
                        <TableCell className="font-medium">
                          <Link
                            className="text-gray-700 underline transition-opacity hover:opacity-80"
                            to={`/employees_/${visit.employeeId}`}
                          >
                            {visit.employee}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4">
                          {getTypeBadge(visit.type)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {visit.scheduledDate}
                        </TableCell>
                        <TableCell className="px-4">
                          {getStatusBadge(visit.status, visit.daysUntil)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleEdit(visit)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(visit)}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
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
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, sortedVisits.length)} sur{" "}
                {sortedVisits.length}
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

      {/* Dialogs */}
      <AddMedicalVisitDialog
        onAdd={handleAddMedicalVisit}
        onOpenChange={setAddDialogOpen}
        open={addDialogOpen}
      />
      <DeleteMedicalVisitDialog
        onConfirm={handleDeleteMedicalVisit}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        visit={selectedVisit}
      />
    </TooltipProvider>
  );
}
