import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DetailBadge, StatusBadge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Contract {
  id: number;
  employee: string;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string | null;
  status: string;
  isActive: boolean;
  duration: number;
  renewable: boolean;
  renewalCount: number;
  salary: number;
  department: string;
  agency?: string;
  trialPeriod?: boolean;
  trialEndDate?: string;
  renewed?: boolean;
}

interface ContractTableProps {
  contracts: Contract[];
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onAddContract: () => void;
  onEdit?: (contract: Contract) => void;
  onView?: (contract: Contract) => void;
  onRenew?: (contract: Contract) => void;
}

export function ContractTable({
  contracts,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  onAddContract,
  onEdit,
  onView,
  onRenew,
}: ContractTableProps) {
  const { t } = useTranslation();

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(contracts.map((c) => c.type)));
  const uniqueStatuses = Array.from(new Set(contracts.map((c) => c.status)));

  // Filter contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      search === "" ||
      contract.employee.toLowerCase().includes(search.toLowerCase()) ||
      contract.department?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || contract.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || contract.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, "blue" | "orange" | "teal"> = {
      CDI: "blue",
      CDD: "orange",
      Intérim: "teal",
    };
    return <DetailBadge color={colors[type] || "gray"}>{type}</DetailBadge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "green" as const, label: "Actif" },
      ending_soon: { color: "yellow" as const, label: "Bientôt terminé" },
      completed: { color: "gray" as const, label: "Terminé" },
      trial_period: { color: "blue" as const, label: "Période essai" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <StatusBadge color={config.color}>{config.label}</StatusBadge>;
  };

  const getTimelineStatus = (contract: Contract) => {
    const today = new Date();
    const start = new Date(contract.startDate);

    // Check if contract hasn't started yet (future)
    if (start > today) {
      return {
        type: "future" as const,
        icon: <Clock className="h-4 w-4 text-blue-500" />,
        tooltip: t("contracts.timelineStatus.future"),
      };
    }

    // Check if contract is inactive/completed
    if (!contract.isActive || contract.status === "completed") {
      return {
        type: "inactive" as const,
        icon: <XCircle className="h-4 w-4 text-gray-400" />,
        tooltip: t("contracts.timelineStatus.inactive"),
      };
    }

    // Contract is in progress
    return {
      type: "in_progress" as const,
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      tooltip: t("contracts.timelineStatus.inProgress"),
    };
  };

  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) {
      return "-";
    }
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? `${diff} jours` : "Expiré";
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="bg-card pl-9"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("contracts.search")}
            value={search}
          />
        </div>
        <Select onValueChange={onTypeFilterChange} value={typeFilter}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder={t("contracts.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("contracts.allTypes")}</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={onStatusFilterChange} value={statusFilter}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder={t("contracts.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("contracts.allStatuses")}</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "active"
                  ? "Actif"
                  : status === "ending_soon"
                    ? "Bientôt terminé"
                    : status === "completed"
                      ? "Terminé"
                      : status === "trial_period"
                        ? "Période essai"
                        : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="ml-auto gap-2" onClick={onAddContract}>
          <Plus className="h-4 w-4" />
          {t("contracts.addContract")}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 px-2" />
              <TableHead className="px-4">
                {t("employeeDetail.fullName")}
              </TableHead>
              <TableHead className="px-4">{t("contracts.type")}</TableHead>
              <TableHead className="px-4">{t("contracts.startDate")}</TableHead>
              <TableHead className="px-4">{t("contracts.endDate")}</TableHead>
              <TableHead className="px-4">{t("contracts.status")}</TableHead>
              <TableHead className="px-4 text-right">
                {t("employees.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContracts.length === 0 ? (
              <TableRow>
                <TableCell className="h-64" colSpan={7}>
                  <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <SearchX className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium text-lg">{t("common.noData")}</p>
                    <p className="mt-2 max-w-md text-center text-sm">
                      {t("dashboard.noDataFound")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedContracts.map((contract) => (
                <TableRow className="hover:bg-muted/50" key={contract.id}>
                  <TableCell className="pr-2 pl-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-default">
                            {getTimelineStatus(contract).icon}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getTimelineStatus(contract).tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="px-4">
                    <Link
                      className="text-gray-700 underline transition-opacity hover:opacity-80"
                      to={`/employees/${contract.employeeId}`}
                    >
                      {contract.employee}
                    </Link>
                    {contract.renewalCount > 0 && (
                      <div className="mt-1 flex gap-1">
                        <DetailBadge color="blue">
                          {contract.renewalCount} renouvellement
                          {contract.renewalCount > 1 ? "s" : ""}
                        </DetailBadge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    {getTypeBadge(contract.type)}
                  </TableCell>
                  <TableCell className="px-4 text-gray-700">
                    {contract.startDate}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-col">
                      <span className="text-gray-700">
                        {contract.endDate || "-"}
                      </span>
                      {contract.endDate && contract.status === "active" && (
                        <span className="font-medium text-xs text-yellow-600">
                          {getDaysUntilEnd(contract.endDate)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          onClick={() => onView(contract)}
                          size="icon"
                          title="Voir détails"
                          variant="ghost"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          onClick={() => onEdit(contract)}
                          size="icon"
                          title="Éditer"
                          variant="ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onRenew &&
                        (contract.status === "ending_soon" ||
                          (contract.type === "CDD" && contract.renewable)) && (
                          <Button
                            className="text-green-600 hover:text-green-700"
                            onClick={() => onRenew(contract)}
                            size="icon"
                            title="Renouveler"
                            variant="ghost"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("common.view")} de {startIndex + 1} à{" "}
          {Math.min(endIndex, filteredContracts.length)} sur{" "}
          {filteredContracts.length} {t("contracts.contracts")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
