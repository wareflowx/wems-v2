import { queryKeys } from "@@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AgencyMetrics,
  AgencySearchBar,
  AgencyTable,
} from "@/components/agencies";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
import { ErrorDisplay } from "@/components/ui/error-display";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { useAgencies, useFilteredData, useMetrics } from "@/hooks";
import type { Agency } from "@/hooks/use-agencies";
import { useDialogStore } from "@/stores/dialog-store";

export function AgenciesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Fetch agencies
  const { data: agencies = [], isLoading, error } = useAgencies();

  // Use useMetrics for KPIs
  const metrics = useMetrics(agencies, {
    totalAgencies: { value: (items) => items.length },
    activeAgencies: {
      value: (items) => items.filter((a) => a.isActive).length,
    },
    inactiveAgencies: {
      value: (items) => items.filter((a) => !a.isActive).length,
    },
  });

  // Use useFilteredData for filtering
  const filteredAgencies = useFilteredData(agencies, {
    search,
    searchFields: ["name", "code"] as (keyof Agency)[],
    filters: {
      isActive:
        statusFilter === "all"
          ? undefined
          : statusFilter === "active"
            ? true
            : false,
    } as Partial<Record<keyof Agency, boolean | undefined>>,
  });

  // Handler to open edit dialog with agency data
  // Using store.getState() directly to avoid dependency on useDialogState's
  // returned object which changes reference on every store update
  const handleEditClick = useCallback((agency: Agency) => {
    useDialogStore.getState().openDialog("edit-agency", { ...agency });
  }, []);

  // Handler to open delete dialog with agency data
  const handleDeleteClick = useCallback((agency: Agency) => {
    useDialogStore
      .getState()
      .openDialog("delete-agency", { id: agency.id, name: agency.name });
  }, []);

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
            queryClient.invalidateQueries({
              queryKey: queryKeys.agencies.lists(),
            })
          }
          title={t("agencies.errorLoading", "Failed to load agencies")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          description={t("agencies.description")}
          icon={<Building2 className="h-4 w-4 text-gray-600" />}
          title={t("agencies.title")}
        />

        {/* Key Metrics */}
        <AgencyMetrics
          icon={<Building2 className="h-4 w-4" />}
          labels={{
            totalAgencies: t("agencies.totalAgencies"),
            active: t("agencies.active"),
            inactive: t("agencies.inactive"),
            ofTotal: t("common.ofTotal"),
          }}
          metrics={metrics}
        />

        <div className="flex flex-col gap-2">
          {/* Search and Filters */}
          <AgencySearchBar
            onAddClick={() =>
              useDialogStore.getState().openDialog("create-agency")
            }
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            search={search}
            statusFilter={statusFilter}
          />

          {/* Table */}
          {filteredAgencies.length === 0 ? (
            <div className="flex w-full items-center justify-center">
              {agencies.length === 0 ? (
                <AnimatedEmpty
                  action={{
                    label: t("agencies.addAgency"),
                    onClick: () =>
                      useDialogStore.getState().openDialog("create-agency"),
                  }}
                  description={t(
                    "agencies.noAgenciesDescription",
                    "Creez votre premiere agence pour commencer"
                  )}
                  icons={[Building2, Building2, Building2]}
                  title={t("agencies.noAgencies", "Aucune agence")}
                />
              ) : (
                <AnimatedEmpty
                  action={{
                    label: t("agencies.clearFilters", "Effacer les filtres"),
                    onClick: () => {
                      setSearch("");
                      setStatusFilter("all");
                    },
                  }}
                  description={t(
                    "agencies.noAgenciesFoundDescription",
                    "Aucune agence ne correspond a vos filtres actuels"
                  )}
                  icons={[Building2, Building2, Building2]}
                  title={t("agencies.noAgenciesFound", "Aucune agence trouvee")}
                />
              )}
            </div>
          ) : (
            <AgencyTable
              agencies={filteredAgencies}
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
