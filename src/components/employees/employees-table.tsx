import {
  Search,
  SearchX,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Link } from "@tanstack/react-router";
import type { Employee } from "@/db/schema/employees";
import type { Position } from "@/db/schema/positions";
import type { WorkLocation } from "@/db/schema/work-locations";

interface EmployeesTableProps {
  employees: Employee[];
  positions: Position[];
  workLocations: WorkLocation[];
  onDeleteClick: (employee: { id: number; name: string }) => void;
}

export function EmployeesTable({
  employees,
  positions,
  workLocations,
  onDeleteClick,
}: EmployeesTableProps) {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get unique contracts and statuses
  const uniqueContracts = useMemo(() => {
    const contracts = new Set(employees.map((e) => e.contract));
    return Array.from(contracts);
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(employees.map((e) => e.status));
    return Array.from(statuses);
  }, [employees]);

  // Filter data manually for contract and status, use TanStack for search
  const filteredData = useMemo(() => {
    return employees.filter((employee) => {
      const matchesContract =
        contractFilter === "all" || employee.contract === contractFilter;
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      return matchesContract && matchesStatus;
    });
  }, [employees, contractFilter, statusFilter]);

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: t("employeeDetail.fullName"),
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <>
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
            </>
          );
        },
      },
      {
        accessorKey: "contract",
        header: t("employees.currentContract"),
        cell: ({ getValue }) => {
          const contract = getValue() as string;
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
        },
      },
      {
        accessorKey: "positionId",
        header: t("employees.position"),
        cell: ({ getValue }) => {
          const positionId = getValue() as number | null;
          if (!positionId) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                -
              </span>
            );
          }
          const position = positions.find((p) => p.id === positionId);
          const dotColor = position?.color || "bg-gray-500";
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
              {position?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "workLocationId",
        header: t("employees.workLocation"),
        cell: ({ getValue }) => {
          const workLocationId = getValue() as number | null;
          if (!workLocationId) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                -
              </span>
            );
          }
          const location = workLocations.find((w) => w.id === workLocationId);
          const dotColor = location?.color || "bg-gray-500";
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
              {location?.name || "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("employeeDetail.status"),
        cell: ({ getValue }) => {
          const status = getValue() as string;
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
        },
      },
      {
        accessorKey: "hireDate",
        header: t("employeeDetail.startDate"),
        cell: ({ getValue }) => {
          return <span className="text-gray-700">{getValue() as string}</span>;
        },
      },
      {
        id: "actions",
        header: t("employees.actions"),
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onDeleteClick({
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t, positions, workLocations, onDeleteClick]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="flex gap-2 flex-col">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("employees.search")}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={contractFilter} onValueChange={setContractFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("employees.currentContract")} />
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
          <SelectTrigger className="w-[140px]">
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
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64">
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <SearchX className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">{t("common.noData")}</p>
                    <p className="text-sm mt-2 max-w-md text-center">
                      {t("dashboard.noDataFound")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("common.view")} de {table.getRowModel().rows.length > 0 ? (currentPage - 1) * 10 + 1 : 0} à{" "}
          {Math.min(currentPage * 10, filteredData.length)} sur{" "}
          {filteredData.length} {t("common.employees")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
