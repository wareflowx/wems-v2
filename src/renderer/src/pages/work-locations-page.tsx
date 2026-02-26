import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Search, SearchX, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { CreateWorkLocationDialog } from "@/components/work-locations/CreateWorkLocationDialog";
import { DeleteWorkLocationDialog } from "@/components/work-locations/DeleteWorkLocationDialog";
import { EditWorkLocationDialog } from "@/components/work-locations/EditWorkLocationDialog";
import {
  useCreateWorkLocation,
  useDeleteWorkLocation,
  useUpdateWorkLocation,
  useWorkLocations,
} from "@/hooks";

const getColorName = (color: string) => {
  return color.replace("bg-", "").replace("-500", "").toUpperCase();
};

export function WorkLocationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deletingLocation, setDeletingLocation] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: workLocations = [], isLoading, error } = useWorkLocations();
  const createWorkLocation = useCreateWorkLocation();
  const updateWorkLocation = useUpdateWorkLocation();
  const deleteWorkLocation = useDeleteWorkLocation();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalLocations: workLocations.length,
      activeLocations: workLocations.filter((l) => l.isActive).length,
      inactiveLocations: workLocations.filter((l) => !l.isActive).length,
    }),
    [workLocations]
  );

  // Filter work locations
  const filteredLocations = useMemo(() => {
    return workLocations.filter((location) => {
      const matchesSearch =
        search === "" ||
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && location.isActive) ||
        (statusFilter === "inactive" && !location.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [workLocations, search, statusFilter]);

  const _handleCreateLocation = (data: any) => {
    createWorkLocation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdateLocation = (data: any) => {
    updateWorkLocation.mutate(
      { id: editingLocation.id, ...data },
      {
        onSuccess: () => {
          setEditingLocation(null);
        },
      }
    );
  };

  const handleDeleteLocation = () => {
    if (deletingLocation) {
      deleteWorkLocation.mutate(
        { id: deletingLocation.id },
        {
          onSuccess: () => {
            setDeletingLocation(null);
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
            "workLocations.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["work-locations"] })
          }
          title={t(
            "workLocations.errorLoading",
            "Failed to load work locations"
          )}
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
            description={t("workLocations.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("workLocations.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("workLocations.totalLocations"),
                value: kpis.totalLocations,
                description: `${kpis.activeLocations} ${t("workLocations.active")}`,
                icon: <Sparkles className="h-4 w-4" />,
              },
              {
                title: t("workLocations.active"),
                value: kpis.activeLocations,
                description: `${((kpis.activeLocations / kpis.totalLocations) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Sparkles className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("workLocations.inactive"),
                value: kpis.inactiveLocations,
                description: `${((kpis.inactiveLocations / kpis.totalLocations) * 100).toFixed(0)}${t("common.ofTotal")}`,
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
                  placeholder={t("workLocations.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("workLocations.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("workLocations.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("workLocations.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("workLocations.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("workLocations.addLocation")}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      {t("workLocations.code")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("workLocations.name")}
                    </TableHead>
                    <TableHead className="px-4">
                      Color
                    </TableHead>
                    <TableHead className="px-4">
                      {t("workLocations.status")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("workLocations.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.length === 0 ? (
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
                    filteredLocations.map((location) => (
                      <TableRow className="hover:bg-muted/50" key={location.id}>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                            {location.code}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate px-4 font-medium">
                          {location.name}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-xs">
                            <span className={`mr-1.5 h-2 w-2 rounded-full ${location.color}`} />
                            {getColorName(location.color)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          {location.isActive ? (
                            <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                              {t("workLocations.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                              {t("workLocations.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingLocation(location)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingLocation(location)}
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

      <CreateWorkLocationDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />

      <EditWorkLocationDialog
        location={editingLocation}
        onOpenChange={(open) => !open && setEditingLocation(null)}
        onUpdate={handleUpdateLocation}
        open={editingLocation !== null}
      />

      <DeleteWorkLocationDialog
        location={deletingLocation}
        onConfirm={handleDeleteLocation}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
        open={deletingLocation !== null}
      />
    </>
  );
}
