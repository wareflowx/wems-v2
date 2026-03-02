import { useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { ContractTypesTable } from "@/components/contract-types/ContractTypesTable";
import { CreateContractTypeDialog } from "@/components/contract-types/CreateContractTypeDialog";
import { DeleteContractTypeDialog } from "@/components/contract-types/DeleteContractTypeDialog";
import { EditContractTypeDialog } from "@/components/contract-types/EditContractTypeDialog";
import {
  useContractTypes,
} from "@/hooks";

export function ContractTypesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContractType, setEditingContractType] = useState<any>(null);
  const [deletingContractType, setDeletingContractType] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: contractTypes = [], isLoading, error } = useContractTypes();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalContractTypes: contractTypes.length,
      activeContractTypes: contractTypes.filter((c) => c.isActive).length,
      inactiveContractTypes: contractTypes.filter((c) => !c.isActive).length,
    }),
    [contractTypes]
  );

  // Filter contract types
  const filteredContractTypes = useMemo(() => {
    return contractTypes.filter((contractType) => {
      const matchesSearch =
        search === "" ||
        contractType.name.toLowerCase().includes(search.toLowerCase()) ||
        contractType.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && contractType.isActive) ||
        (statusFilter === "inactive" && !contractType.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [contractTypes, search, statusFilter]);

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
            "contractTypes.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["contract-types"] })
          }
          title={t("contractTypes.errorLoading", "Failed to load contract types")}
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
            description={t("contractTypes.description")}
            icon={<FileText className="h-4 w-4 text-gray-600" />}
            title={t("contractTypes.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("contractTypes.totalContractTypes"),
                value: kpis.totalContractTypes,
                description: `${kpis.activeContractTypes} ${t("contractTypes.active")}`,
                icon: <FileText className="h-4 w-4" />,
              },
              {
                title: t("contractTypes.active"),
                value: kpis.activeContractTypes,
                description: `${((kpis.activeContractTypes / kpis.totalContractTypes) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <FileText className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("contractTypes.inactive"),
                value: kpis.inactiveContractTypes,
                description: `${((kpis.inactiveContractTypes / kpis.totalContractTypes) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <FileText className="h-4 w-4" />,
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
                  placeholder={t("contractTypes.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("contractTypes.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("contractTypes.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("contractTypes.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("contractTypes.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("contractTypes.addContractType")}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-card">
              <ContractTypesTable
                contractTypes={filteredContractTypes}
                onEdit={setEditingContractType}
                onDelete={setDeletingContractType}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateContractTypeDialog
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />

      {/* Edit Dialog */}
      <EditContractTypeDialog
        contractType={editingContractType}
        onOpenChange={(open) => !open && setEditingContractType(null)}
        open={editingContractType !== null}
      />

      {/* Delete Dialog */}
      <DeleteContractTypeDialog
        contractType={deletingContractType}
        onOpenChange={(open) => !open && setDeletingContractType(null)}
        open={deletingContractType !== null}
      />
    </>
  );
}
