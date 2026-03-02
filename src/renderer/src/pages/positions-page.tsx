import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, SearchX, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreatePositionDialog } from "@/components/positions/CreatePositionDialog";
import { DeletePositionDialog } from "@/components/positions/DeletePositionDialog";
import { EditPositionDialog } from "@/components/positions/EditPositionDialog";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ui/error-display";
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
  useCreatePosition,
  useDeletePosition,
  usePositions,
  useUpdatePosition,
} from "@/hooks";

const getColorName = (color: string) => {
  return color.replace("bg-", "").replace("-500", "").toUpperCase();
};

export function PositionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [deletingPosition, setDeletingPosition] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: positions = [], isLoading, error } = usePositions();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalPositions: positions.length,
      activePositions: positions.filter((p) => p.isActive).length,
      inactivePositions: positions.filter((p) => !p.isActive).length,
    }),
    [positions]
  );

  // Filter positions
  const filteredPositions = useMemo(() => {
    return positions.filter((position) => {
      const matchesSearch =
        search === "" ||
        position.name.toLowerCase().includes(search.toLowerCase()) ||
        position.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && position.isActive) ||
        (statusFilter === "inactive" && !position.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [positions, search, statusFilter]);

  const _handleCreatePosition = (data: any) => {
    createPosition.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdatePosition = (data: any) => {
    updatePosition.mutate(
      { id: editingPosition.id, ...data },
      {
        onSuccess: () => {
          setEditingPosition(null);
        },
      }
    );
  };

  const handleDeletePosition = () => {
    if (deletingPosition) {
      deletePosition.mutate(
        { id: deletingPosition.id },
        {
          onSuccess: () => {
            setDeletingPosition(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderSkeleton metricsCount={3} showMetrics />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <ErrorDisplay
          message={t(
            "positions.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["positions"] })
          }
          title={t("positions.errorLoading", "Failed to load positions")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            description={t("positions.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("positions.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("positions.totalPositions"),
                value: kpis.totalPositions,
                description: `${kpis.activePositions} ${t("positions.active")}`,
                icon: <Sparkles className="h-4 w-4" />,
              },
              {
                title: t("positions.active"),
                value: kpis.activePositions,
                description: `${((kpis.activePositions / kpis.totalPositions) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Sparkles className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("positions.inactive"),
                value: kpis.inactivePositions,
                description: `${((kpis.inactivePositions / kpis.totalPositions) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Sparkles className="h-4 w-4" />,
                iconColor: "text-gray-500",
              },
            ]}
          />

          <div className="flex flex-col gap-2">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("positions.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("positions.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("positions.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("positions.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("positions.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("positions.addPosition")}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      {t("positions.code")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("positions.name")}
                    </TableHead>
                    <TableHead className="px-4">
                      Color
                    </TableHead>
                    <TableHead className="px-4">
                      {t("positions.status")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("positions.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length === 0 ? (
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
                    filteredPositions.map((position) => (
                      <TableRow className="hover:bg-muted/50" key={position.id}>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                            {position.code}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate px-4 font-medium">
                          {position.name}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-xs">
                            <span className={`mr-1.5 h-2 w-2 rounded-full ${position.color}`} />
                            {getColorName(position.color)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          {position.isActive ? (
                            <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                              {t("positions.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                              {t("positions.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingPosition(position)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingPosition(position)}
                              size="icon"
                              variant="ghost"
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
        </div>
      </div>

      <CreatePositionDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />

      <EditPositionDialog
        onOpenChange={(open) => !open && setEditingPosition(null)}
        onUpdate={handleUpdatePosition}
        open={editingPosition !== null}
        position={editingPosition}
      />

      <DeletePositionDialog
        onConfirm={handleDeletePosition}
        onOpenChange={(open) => !open && setDeletingPosition(null)}
        open={deletingPosition !== null}
        position={deletingPosition}
      />
    </>
  );
}
