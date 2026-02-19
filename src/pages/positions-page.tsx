import { Search, Plus, Sparkles, SearchX, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { MetricsSection } from "@/components/ui/metrics-section";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
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
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from "@/hooks";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { CreatePositionDialog } from "@/components/positions/CreatePositionDialog";
import { EditPositionDialog } from "@/components/positions/EditPositionDialog";
import { DeletePositionDialog } from "@/components/positions/DeletePositionDialog";

export function PositionsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [deletingPosition, setDeletingPosition] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: positions = [], isLoading } = usePositions();
  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();
  const deletePosition = useDeletePosition();

  // KPIs - calculated dynamically
  const kpis = useMemo(() => ({
    totalPositions: positions.length,
    activePositions: positions.filter((p) => p.isActive).length,
    inactivePositions: positions.filter((p) => !p.isActive).length,
  }), [positions]);

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

  const handleCreatePosition = (data: any) => {
    createPosition.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdatePosition = (data: any) => {
    updatePosition.mutate({ id: editingPosition.id, ...data }, {
      onSuccess: () => {
        setEditingPosition(null);
      },
    });
  };

  const handleDeletePosition = () => {
    if (deletingPosition) {
      deletePosition.mutate({ id: deletingPosition.id }, {
        onSuccess: () => {
          setDeletingPosition(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderSkeleton showMetrics metricsCount={3} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("positions.title")}
            description={t("positions.description")}
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

          <div className="flex gap-2 flex-col">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("positions.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("positions.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("positions.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("positions.active")}</SelectItem>
                  <SelectItem value="inactive">{t("positions.inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 ml-auto"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("positions.addPosition")}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">{t("positions.code")}</TableHead>
                    <TableHead className="px-4">{t("positions.name")}</TableHead>
                    <TableHead className="px-4">{t("positions.status")}</TableHead>
                    <TableHead className="px-4 text-right">{t("positions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64">
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
                    filteredPositions.map((position) => (
                      <TableRow key={position.id} className="hover:bg-muted/50">
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
                            <span className={`w-1.5 h-1.5 rounded-full ${position.color}`}></span>
                            {position.code}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 font-medium truncate max-w-[300px]">{position.name}</TableCell>
                        <TableCell className="px-4">
                          {position.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/15 border border-green-500/25 text-green-600">
                              {t("positions.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/15 border border-gray-500/25 text-gray-600">
                              {t("positions.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPosition(position)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPosition(position)}
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
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditPositionDialog
        open={editingPosition !== null}
        onOpenChange={(open) => !open && setEditingPosition(null)}
        position={editingPosition}
        onUpdate={handleUpdatePosition}
      />

      <DeletePositionDialog
        open={deletingPosition !== null}
        onOpenChange={(open) => !open && setDeletingPosition(null)}
        position={deletingPosition}
        onConfirm={handleDeletePosition}
      />
    </>
  );
}
