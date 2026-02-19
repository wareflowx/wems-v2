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
import { useWorkLocations, useCreateWorkLocation, useUpdateWorkLocation, useDeleteWorkLocation } from "@/hooks";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { CreateWorkLocationDialog } from "@/components/work-locations/CreateWorkLocationDialog";
import { EditWorkLocationDialog } from "@/components/work-locations/EditWorkLocationDialog";
import { DeleteWorkLocationDialog } from "@/components/work-locations/DeleteWorkLocationDialog";

export function WorkLocationsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deletingLocation, setDeletingLocation] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: workLocations = [], isLoading } = useWorkLocations();
  const createWorkLocation = useCreateWorkLocation();
  const updateWorkLocation = useUpdateWorkLocation();
  const deleteWorkLocation = useDeleteWorkLocation();

  // KPIs - calculated dynamically
  const kpis = useMemo(() => ({
    totalLocations: workLocations.length,
    activeLocations: workLocations.filter((l) => l.isActive).length,
    inactiveLocations: workLocations.filter((l) => !l.isActive).length,
  }), [workLocations]);

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

  const handleCreateLocation = (data: any) => {
    createWorkLocation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdateLocation = (data: any) => {
    updateWorkLocation.mutate({ id: editingLocation.id, ...data }, {
      onSuccess: () => {
        setEditingLocation(null);
      },
    });
  };

  const handleDeleteLocation = () => {
    if (deletingLocation) {
      deleteWorkLocation.mutate({ id: deletingLocation.id }, {
        onSuccess: () => {
          setDeletingLocation(null);
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
            title={t("workLocations.title")}
            description={t("workLocations.description")}
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

          <div className="flex gap-2 flex-col">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("workLocations.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("workLocations.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workLocations.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("workLocations.active")}</SelectItem>
                  <SelectItem value="inactive">{t("workLocations.inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="gap-2 ml-auto"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("workLocations.addLocation")}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">{t("workLocations.code")}</TableHead>
                    <TableHead className="px-4">{t("workLocations.name")}</TableHead>
                    <TableHead className="px-4">{t("workLocations.status")}</TableHead>
                    <TableHead className="px-4 text-right">{t("workLocations.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.length === 0 ? (
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
                    filteredLocations.map((location) => (
                      <TableRow key={location.id} className="hover:bg-muted/50">
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border">
                            <span className={`w-1.5 h-1.5 rounded-full ${location.color}`}></span>
                            {location.code}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 font-medium">{location.name}</TableCell>
                        <TableCell className="px-4">
                          {location.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/15 border border-green-500/25 text-green-600">
                              {t("workLocations.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/15 border border-gray-500/25 text-gray-600">
                              {t("workLocations.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingLocation(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingLocation(location)}
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
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditWorkLocationDialog
        open={editingLocation !== null}
        onOpenChange={(open) => !open && setEditingLocation(null)}
        location={editingLocation}
        onUpdate={handleUpdateLocation}
      />

      <DeleteWorkLocationDialog
        open={deletingLocation !== null}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
        location={deletingLocation}
        onConfirm={handleDeleteLocation}
      />
    </>
  );
}
