import { useQueryClient } from "@tanstack/react-query";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Input } from "@/components/ui/input";
import { MetricsSection } from "@/components/ui/metrics-section";
import { PageHeaderCard } from "@/components/ui/page-header-card";
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
  useAgencies,
  useDialogState,
  useFilteredData,
  useMetrics,
} from "@/hooks";
import { queryKeys } from "@@/lib/query-keys";
import type { Agency } from "@/hooks/use-agencies";

export function AgenciesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Dialog state using useDialog
  const createDialog = useDialogState("create-agency");
  const editDialog = useDialogState("edit-agency");
  const deleteDialog = useDialogState("delete-agency");

  // Fetch agencies
  const { data: agencies = [], isLoading, error } = useAgencies();

  // Use useMetrics for KPIs
  const metrics = useMetrics(agencies, {
    totalAgencies: { value: (items) => items.length },
    activeAgencies: { value: (items) => items.filter((a) => a.isActive).length },
    inactiveAgencies: { value: (items) => items.filter((a) => !a.isActive).length },
  });

  // Use useFilteredData for filtering
  const filteredAgencies = useFilteredData(agencies, {
    search,
    searchFields: ["name", "code"] as (keyof Agency)[],
    filters: {
      isActive:
        search === "active" ? true : search === "inactive" ? false : undefined,
    } as Partial<Record<keyof Agency, boolean | undefined>>,
  });

  // Handler to open edit dialog with agency data
  const handleEditClick = (agency: Agency) => {
    editDialog.open({ ...agency });
  };

  // Handler to open delete dialog with agency data
  const handleDeleteClick = (agency: Agency) => {
    deleteDialog.open({ id: agency.id, name: agency.name });
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
            "agencies.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: queryKeys.agencies.lists() })
          }
          title={t("agencies.errorLoading", "Failed to load agencies")}
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
            description={t("agencies.description")}
            icon={<Building2 className="h-4 w-4 text-gray-600" />}
            title={t("agencies.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            className="lg:grid-cols-3"
            kpis={[
              {
                title: t("agencies.totalAgencies"),
                value: metrics.totalAgencies,
                description: `${metrics.activeAgencies} ${t("agencies.active")}`,
                icon: <Building2 className="h-4 w-4" />,
              },
              {
                title: t("agencies.active"),
                value: metrics.activeAgencies,
                description: `${((metrics.activeAgencies / metrics.totalAgencies) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Building2 className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("agencies.inactive"),
                value: metrics.inactiveAgencies,
                description: `${((metrics.inactiveAgencies / metrics.totalAgencies) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Building2 className="h-4 w-4" />,
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
                  placeholder={t("agencies.search")}
                  value={search}
                />
              </div>
              <Button
                className="ml-auto gap-2"
                onClick={() => createDialog.open()}
              >
                <Plus className="h-4 w-4" />
                {t("agencies.addAgency")}
              </Button>
            </div>

            {/* Table */}
            {filteredAgencies.length === 0 ? (
              <div className="flex w-full items-center justify-center">
                <AnimatedEmpty
                  action={{
                    label: t("agencies.addAgency", "Add Agency"),
                    onClick: () => createDialog.open(),
                  }}
                  description={t(
                    "agencies.noAgenciesDescription",
                    "Create your first agency to get started"
                  )}
                  icons={[Building2, Building2, Building2]}
                  title={t("agencies.noAgencies", "No agencies yet")}
                />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">
                        {t("agencies.code")}
                      </TableHead>
                      <TableHead className="px-4">
                        {t("agencies.name")}
                      </TableHead>
                      <TableHead className="px-4">
                        {t("agencies.status")}
                      </TableHead>
                      <TableHead className="px-4">
                        {t("agencies.createdAt")}
                      </TableHead>
                      <TableHead className="px-4">
                        {t("agencies.updatedAt")}
                      </TableHead>
                      <TableHead className="px-4 text-right">
                        {t("agencies.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgencies.map((agency) => (
                      <TableRow className="hover:bg-muted/50" key={agency.id}>
                        <TableCell className="px-4">
                          {agency.code ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                              {agency.code}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate px-4 font-medium">
                          {agency.name}
                        </TableCell>
                        <TableCell className="px-4">
                          {agency.isActive ? (
                            <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                              {t("agencies.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                              {t("agencies.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-muted-foreground text-xs underline">
                            {agency.createdAt
                              ? new Date(agency.createdAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-muted-foreground text-xs underline">
                            {agency.updatedAt
                              ? new Date(agency.updatedAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleEditClick(agency)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(agency)}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs are managed by DialogManager based on dialog store state */}
    </>
  );
}
