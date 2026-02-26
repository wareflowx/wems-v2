import { useQueryClient } from "@tanstack/react-query";
import { FileText, Edit, Plus, Search, SearchX, Trash2 } from "lucide-react";
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
import {
  useCreateContractType,
  useDeleteContractType,
  useContractTypes,
  useUpdateContractType,
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
  const createContractType = useCreateContractType();
  const updateContractType = useUpdateContractType();
  const deleteContractType = useDeleteContractType();

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

  const handleDeleteContractType = () => {
    if (deletingContractType) {
      deleteContractType.mutate(
        { id: deletingContractType.id },
        {
          onSuccess: () => {
            setDeletingContractType(null);
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
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      {t("contractTypes.code")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("contractTypes.name")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("contractTypes.status")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("contractTypes.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContractTypes.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-64" colSpan={4}>
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
                    filteredContractTypes.map((contractType) => (
                      <TableRow className="hover:bg-muted/50" key={contractType.id}>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                            <span className={`h-1.5 w-1.5 rounded-full ${contractType.color}`} />
                            {contractType.code}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate px-4 font-medium">
                          {contractType.name}
                        </TableCell>
                        <TableCell className="px-4">
                          {contractType.isActive ? (
                            <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                              {t("contractTypes.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                              {t("contractTypes.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingContractType(contractType)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingContractType(contractType)}
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

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <CreateContractTypeDialog
          onClose={() => setIsCreateDialogOpen(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingContractType && (
        <EditContractTypeDialog
          contractType={editingContractType}
          onClose={() => setEditingContractType(null)}
          onSave={(data) => {
            updateContractType.mutate(
              { id: editingContractType.id, ...data },
              {
                onSuccess: () => {
                  setEditingContractType(null);
                },
              }
            );
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingContractType && (
        <DeleteContractTypeDialog
          contractType={deletingContractType}
          onClose={() => setDeletingContractType(null)}
          onConfirm={handleDeleteContractType}
        />
      )}
    </>
  );
}

// Dialog Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const COLORS = [
  { name: "Emerald", value: "bg-emerald-500", hex: "#10b981" },
  { name: "Amber", value: "bg-amber-500", hex: "#f59e0b" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Rose", value: "bg-rose-500", hex: "#f43f5e" },
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Violet", value: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
];

function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");
}

function CreateContractTypeDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const createContractType = useCreateContractType();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = () => {
    createContractType.mutate(
      { name, code: generateCode(name), color: selectedColor, isActive: true },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contractTypes.addContractType")}</DialogTitle>
          <DialogDescription>
            {t("contractTypes.addContractTypeDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ct-name">{t("contractTypes.name")}</Label>
            <Input
              id="ct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="CDI"
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  className={`h-8 w-8 rounded-md ${color.value} ${
                    selectedColor === color.value
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : ""
                  } transition-all hover:scale-110`}
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditContractTypeDialog({
  contractType,
  onClose,
  onSave,
}: {
  contractType: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(contractType.name);
  const [selectedColor, setSelectedColor] = useState(contractType.color || COLORS[0].value);
  const [isActive, setIsActive] = useState(contractType.isActive);

  const handleSubmit = () => {
    onSave({ name, code: generateCode(name), color: selectedColor, isActive });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contractTypes.editContractType")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-ct-name">{t("contractTypes.name")}</Label>
            <Input
              id="edit-ct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  className={`h-8 w-8 rounded-md ${color.value} ${
                    selectedColor === color.value
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : ""
                  } transition-all hover:scale-110`}
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-ct-isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Label htmlFor="edit-ct-isActive">{t("contractTypes.active")}</Label>
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

function DeleteContractTypeDialog({
  contractType,
  onClose,
  onConfirm,
}: {
  contractType: any;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const deleteContractType = useDeleteContractType();
  const isDeleting = deleteContractType.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contractTypes.deleteContractType")}</DialogTitle>
          <DialogDescription>
            {t("contractTypes.deleteContractTypeMessage", {
              name: contractType.name,
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
