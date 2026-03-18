import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Search,
  SearchX,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAlerts } from "@/hooks";

interface AlertsPageTableProps {
  itemsPerPage?: number;
}

export function AlertsPageTable({
  itemsPerPage: initialItemsPerPage = 10,
}: AlertsPageTableProps) {
  const { t } = useTranslation();

  // Filter states
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Sort and pagination states
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = initialItemsPerPage;

  // Use TanStack Query hook for alerts with internal filters
  const result = useAlerts({
    search: search || undefined,
    severity: severityFilter,
    type: typeFilter,
  });

  console.log("AlertsPageTable:", result);

  const { data: alerts = [], isLoading, error } = result;


  // Get unique types from alerts
  const uniqueTypes = useMemo(() => {
    const types = new Set(alerts.map((a) => a.type));
    return Array.from(types);
  }, [alerts]);

  // Sort alerts (client-side)
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortColumn) {
        case "employee":
          aVal = a.employee.toLowerCase();
          bVal = b.employee.toLowerCase();
          break;
        case "type":
          aVal = a.type.toLowerCase();
          bVal = b.type.toLowerCase();
          break;
        case "severity": {
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          aVal = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          bVal = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          break;
        }
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [alerts, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage);
  const paginatedAlerts = sortedAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const getSeverityBadge = (severity: string) => {
    let colors: string;
    let label: string;

    switch (severity) {
      case "critical":
        colors = "bg-red-500/15 border border-red-500/25 text-red-700";
        label = t("alerts.critical");
        break;
      case "warning":
        colors = "bg-yellow-600/15 border border-yellow-600/25 text-yellow-700";
        label = t("alerts.warning");
        break;
      case "info":
        colors = "bg-blue-500/15 border border-blue-500/25 text-blue-700";
        label = t("alerts.info");
        break;
      default:
        colors = "bg-gray-500/15 border border-gray-500/25 text-gray-700";
        label = severity;
    }

    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs ${colors}`}
      >
        {label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    let dotColor: string;

    if (type.includes("CACES")) {
      dotColor = "bg-purple-600";
    } else if (type.includes("Visite")) {
      dotColor = "bg-green-600";
    } else {
      dotColor = "bg-gray-600";
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {type}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">Error: {String(error)}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("common.search")}
              value={search}
            />
          </div>
          <Select
            onValueChange={(value) => {
              setSeverityFilter(value);
              setCurrentPage(1);
            }}
            value={severityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("alerts.severity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("alerts.allSeverities")}
              </SelectItem>
              <SelectItem value="critical">
                {t("alerts.critical")}
              </SelectItem>
              <SelectItem value="warning">{t("alerts.warning")}</SelectItem>
              <SelectItem value="info">{t("alerts.info")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
            value={typeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("alerts.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("alerts.allTypes")}</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      {t("alerts.employee")}
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
                      {t("alerts.type")}
                      {getSortIcon("type")}
                    </div>
                  </Button>
                </TableHead>
                <TableHead className="px-4">
                  <Button
                    className="-ml-4 h-8 font-medium hover:bg-muted"
                    onClick={() => handleSort("severity")}
                    size="sm"
                    variant="ghost"
                  >
                    <div className="flex items-center gap-1">
                      {t("alerts.severity")}
                      {getSortIcon("severity")}
                    </div>
                  </Button>
                </TableHead>
                <TableHead className="px-4">
                  <Button
                    className="-ml-4 h-8 font-medium hover:bg-muted"
                    onClick={() => handleSort("date")}
                    size="sm"
                    variant="ghost"
                  >
                    <div className="flex items-center gap-1">
                      {t("alerts.date")}
                      {getSortIcon("date")}
                    </div>
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlerts.length === 0 ? (
                <TableRow>
                  <TableCell className="h-64" colSpan={4}>
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
                paginatedAlerts.map((alert) => (
                  <TableRow className="hover:bg-muted/50" key={alert.id}>
                    <TableCell className="px-4 font-medium">
                      <span className="text-gray-700">
                        {alert.employee}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      {getTypeBadge(alert.type)}
                    </TableCell>
                    <TableCell className="px-4">
                      {getSeverityBadge(alert.severity)}
                    </TableCell>
                    <TableCell className="px-4 text-gray-700">
                      {alert.date}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {t("alerts.showing", {
                from: (currentPage - 1) * itemsPerPage + 1,
                to: Math.min(currentPage * itemsPerPage, sortedAlerts.length),
                total: sortedAlerts.length,
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
                      variant={currentPage === pageNum ? "default" : "outline"}
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
    </TooltipProvider>
  );
}