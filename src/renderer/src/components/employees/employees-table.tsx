import type { Agency } from "@@/db/schema/agencies";
import type { Contract } from "@@/db/schema/contracts";
import type { Employee } from "@@/db/schema/employees";
import type { Position } from "@@/db/schema/positions";
import type { WorkLocation } from "@@/db/schema/work-locations";
import type { DrivingAuthorizationStatusResult } from "@/core/lib/driving-authorization";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  SearchX,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import { DrivingAuthorizationBadge } from "./driving-authorization-badge";

interface EmployeesTableProps {
  employees: Employee[];
  positions: Position[];
  workLocations: WorkLocation[];
  agencies?: Agency[];
  contracts: Contract[];
  authorizationStatuses?: Map<number, DrivingAuthorizationStatusResult>;
  onDeleteClick: (employee: { id: number; name: string }) => void;
  onAddClick?: () => void;
  onEditClick?: (employee: Employee) => void;
}

export function EmployeesTable({
  employees,
  positions,
  workLocations,
  agencies,
  contracts,
  authorizationStatuses,
  onDeleteClick,
  onAddClick,
  onEditClick,
}: EmployeesTableProps) {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get contract for an employee - stabilized with useCallback to prevent infinite re-renders
  const getEmployeeContract = useCallback(
    (employeeId: number): Contract | undefined => {
      const now = new Date();
      return contracts.find((c) => {
        if (c.employeeId !== employeeId || !c.isActive) {
          return false;
        }
        // Check if contract has ended
        if (c.endDate && new Date(c.endDate) < now) {
          return false;
        }
        return true;
      });
    },
    [contracts]
  );

  // Get unique contracts and statuses
  const uniqueContracts = useMemo(() => {
    const contractTypes = new Set(contracts.map((c) => c.contractType));
    return Array.from(contractTypes);
  }, [contracts]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(employees.map((e) => e.status));
    return Array.from(statuses);
  }, [employees]);

  // Filter data manually for contract and status, use TanStack for search
  const filteredData = useMemo(() => {
    return employees.filter((employee) => {
      const employeeContract = getEmployeeContract(employee.id);
      const matchesContract =
        contractFilter === "all" ||
        employeeContract?.contractType === contractFilter;
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;
      return matchesContract && matchesStatus;
    });
  }, [employees, contractFilter, statusFilter, getEmployeeContract]);

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
                className="text-gray-700 underline transition-opacity hover:opacity-80"
                to={`/employees/${employee.id}`}
              >
                {employee.firstName} {employee.lastName}
              </Link>
              <p className="mt-0.5 text-gray-500 text-sm">
                {t("common.employeeId")}
                {employee.id.toString().padStart(4, "0")}
              </p>
            </>
          );
        },
      },
      {
        id: "currentContract",
        header: t("employees.currentContract"),
        cell: ({ row }) => {
          const employee = row.original;
          const contract = getEmployeeContract(employee.id);
          const contractType = contract?.contractType || "-";
          const contractColors: { [key: string]: string } = {
            CDI: "bg-blue-500/15 border border-blue-500/25 text-blue-600",
            CDD: "bg-orange-500/15 border border-orange-500/25 text-orange-600",
            Intérim: "bg-teal-500/15 border border-teal-500/25 text-teal-600",
            Alternance:
              "bg-purple-500/15 border border-purple-500/25 text-purple-600",
          };
          const colors =
            contractColors[contractType] ||
            "bg-gray-500/15 border border-gray-500/25 text-gray-600";
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs ${colors}`}
            >
              {contractType}
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
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />-
              </span>
            );
          }
          const position = positions.find((p) => p.id === positionId);
          const dotColor = position?.color || "bg-gray-500";
          return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
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
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />-
              </span>
            );
          }
          const location = workLocations.find((w) => w.id === workLocationId);
          const dotColor = location?.color || "bg-gray-500";
          return (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              {location?.name || "-"}
            </span>
          );
        },
      },
      {
        id: "agency",
        header: t("employees.agency"),
        cell: ({ row }) => {
          const employee = row.original;
          const contract = getEmployeeContract(employee.id);
          const agencyId = contract?.agencyId ?? null;
          if (!agencyId) {
            return (
              <span className="text-muted-foreground text-xs">-</span>
            );
          }
          const agency = agencies?.find((a) => a.id === agencyId);
          return (
            <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-medium text-purple-600 text-xs">
              {agency?.name || "-"}
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
                <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                  {t("employees.active")}
                </span>
              );
            case "on_leave":
              return (
                <span className="inline-flex items-center rounded-md border border-yellow-500/25 bg-yellow-500/15 px-2 py-0.5 font-medium text-xs text-yellow-600">
                  {t("employees.onLeave")}
                </span>
              );
            default:
              return (
                <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                  {status}
                </span>
              );
          }
        },
      },
      {
        id: "drivingAuthorization",
        header: t("employees.drivingAuthorizationStatus"),
        cell: ({ row }) => {
          const employee = row.original;
          const status = authorizationStatuses?.get(employee.id);
          return <DrivingAuthorizationBadge status={status ?? null} />;
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
        id: "contractEndDate",
        header: t("contracts.endDate"),
        cell: ({ row }) => {
          const employee = row.original;
          const contract = getEmployeeContract(employee.id);
          if (!contract || !contract.endDate) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }
          return (
            <span className="text-gray-700 text-xs">
              {new Date(contract.endDate).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: t("employees.actions"),
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              {onEditClick && (
                <Button
                  onClick={() => onEditClick(employee)}
                  size="icon"
                  variant="ghost"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => {
                  onDeleteClick({
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                  });
                }}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      t,
      positions,
      workLocations,
      agencies,
      onDeleteClick,
      getEmployeeContract,
      onEditClick,
    ]
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
  const _totalPages = table.getPageCount();

  return (
    <div className="flex flex-col gap-2">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={t("employees.search")}
            value={globalFilter}
          />
        </div>
        <Select onValueChange={setContractFilter} value={contractFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("employees.currentContract")} />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">{t("common.allContracts")}</SelectItem>
            {uniqueContracts.map((contract) => (
              <SelectItem key={contract} value={contract}>
                {contract}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setStatusFilter} value={statusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("employeeDetail.status")} />
          </SelectTrigger>
          <SelectContent position="popper">
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
        {onAddClick && (
          <Button className="ml-auto gap-2" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            {t("employees.addEmployee")}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="px-4" key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow className="hover:bg-muted/50" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4" key={cell.id}>
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
        <p className="text-muted-foreground text-sm">
          {t("common.view")} de{" "}
          {table.getRowModel().rows.length > 0 ? (currentPage - 1) * 10 + 1 : 0}{" "}
          à {Math.min(currentPage * 10, filteredData.length)} sur{" "}
          {filteredData.length} {t("common.employees")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
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
