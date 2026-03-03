import { useQueryClient } from "@tanstack/react-query";
import { Building2, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
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
  useCreateAgency,
  useDeleteAgency,
  useAgencies,
  useUpdateAgency,
} from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function AgenciesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [deletingAgency, setDeletingAgency] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: agencies = [], isLoading, error } = useAgencies();
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const deleteAgency = useDeleteAgency();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalAgencies: agencies.length,
      activeAgencies: agencies.filter((a) => a.isActive).length,
      inactiveAgencies: agencies.filter((a) => !a.isActive).length,
    }),
    [agencies]
  );

  // Filter agencies
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const matchesSearch =
        search === "" ||
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        (agency.code && agency.code.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && agency.isActive) ||
        (statusFilter === "inactive" && !agency.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [agencies, search, statusFilter]);

  const _handleCreateAgency = (data: any) => {
    createAgency.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdateAgency = (data: any) => {
    updateAgency.mutate(
      { id: editingAgency.id, ...data },
      {
        onSuccess: () => {
          setEditingAgency(null);
        },
      }
    );
  };

  const handleDeleteAgency = () => {
    if (deletingAgency) {
      deleteAgency.mutate(
        deletingAgency.id,
        {
          onSuccess: () => {
            setDeletingAgency(null);
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
            "agencies.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["agencies"] })
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
                value: kpis.totalAgencies,
                description: `${kpis.activeAgencies} ${t("agencies.active")}`,
                icon: <Building2 className="h-4 w-4" />,
              },
              {
                title: t("agencies.active"),
                value: kpis.activeAgencies,
                description: `${((kpis.activeAgencies / kpis.totalAgencies) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Building2 className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("agencies.inactive"),
                value: kpis.inactiveAgencies,
                description: `${((kpis.inactiveAgencies / kpis.totalAgencies) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
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
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("agencies.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("agencies.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("agencies.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("agencies.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("agencies.addAgency")}
              </Button>
            </div>

            {/* Table */}
            {filteredAgencies.length === 0 ? (
              <div className="flex w-full items-center justify-center">
                <AnimatedEmpty
                  title={t("agencies.noAgencies", "No agencies yet")}
                  description={t(
                    "agencies.noAgenciesDescription",
                    "Create your first agency to get started"
                  )}
                  icons={[Building2, Building2, Building2]}
                  action={{
                    label: t("agencies.addAgency", "Add Agency"),
                    onClick: () => setIsCreateDialogOpen(true),
                  }}
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingAgency(agency)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingAgency(agency)}
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

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <CreateAgencyDialog
          onClose={() => setIsCreateDialogOpen(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingAgency && (
        <EditAgencyDialog
          agency={editingAgency}
          onClose={() => setEditingAgency(null)}
          onSave={handleUpdateAgency}
        />
      )}

      {/* Delete Dialog */}
      {deletingAgency && (
        <DeleteAgencyDialog
          agency={deletingAgency}
          onClose={() => setDeletingAgency(null)}
          onConfirm={handleDeleteAgency}
        />
      )}
    </>
  );
}

function CreateAgencyDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createAgency = useCreateAgency();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = () => {
    createAgency.mutate(
      { name, code: code || undefined, isActive },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("agencies.addAgency")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("agencies.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("agencies.namePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">{t("agencies.code")}</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("agencies.codePlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Label htmlFor="isActive">{t("agencies.active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditAgencyDialog({
  agency,
  onClose,
  onSave,
}: {
  agency: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const { t } = useTranslation();
  const updateAgency = useUpdateAgency();
  const [name, setName] = useState(agency.name);
  const [code, setCode] = useState(agency.code || "");
  const [isActive, setIsActive] = useState(agency.isActive);

  const handleSubmit = () => {
    onSave({ name, code: code || undefined, isActive });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("agencies.editAgency")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t("agencies.name")}</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-code">{t("agencies.code")}</Label>
            <Input
              id="edit-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Label htmlFor="edit-isActive">{t("agencies.active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAgencyDialog({
  agency,
  onClose,
  onConfirm,
}: {
  agency: any;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const deleteAgency = useDeleteAgency();
  const isDeleting = deleteAgency.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("agencies.deleteAgency")}</DialogTitle>
          <DialogDescription>
            {t("agencies.deleteAgencyMessage", {
              name: agency.name,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
