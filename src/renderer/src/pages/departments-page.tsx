import { useQueryClient } from "@tanstack/react-query";
import { Building2, Edit, Plus, Search, SearchX, Trash2 } from "lucide-react";
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
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

const getColorName = (color: string) => {
  return color.replace("bg-", "").replace("-500", "").toUpperCase();
};

export function DepartmentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Dialog store sync
  const activeDialog = useDialogStore((state) => state.activeDialog);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  useEffect(() => {
    if (activeDialog === "create-department") {
      setIsCreateDialogOpen(true);
    }
  }, [activeDialog]);

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    closeDialog();
  };
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<any>(null);

  // Use TanStack Query hooks
  const { data: departments = [], isLoading, error } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  // KPIs - calculated dynamically
  const kpis = useMemo(
    () => ({
      totalDepartments: departments.length,
      activeDepartments: departments.filter((d) => d.isActive).length,
      inactiveDepartments: departments.filter((d) => !d.isActive).length,
    }),
    [departments]
  );

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        search === "" ||
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        department.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && department.isActive) ||
        (statusFilter === "inactive" && !department.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const _handleCreateDepartment = (data: any) => {
    createDepartment.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleUpdateDepartment = (data: any) => {
    updateDepartment.mutate(
      { id: editingDepartment.id, ...data },
      {
        onSuccess: () => {
          setEditingDepartment(null);
        },
      }
    );
  };

  const handleDeleteDepartment = () => {
    if (deletingDepartment) {
      deleteDepartment.mutate(
        { id: deletingDepartment.id },
        {
          onSuccess: () => {
            setDeletingDepartment(null);
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
            "departments.errorLoadingMessage",
            "Make sure the application is running correctly. If the problem persists, please restart."
          )}
          onRetry={() =>
            queryClient.invalidateQueries({ queryKey: ["departments"] })
          }
          title={t("departments.errorLoading", "Failed to load departments")}
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
            description={t("departments.description")}
            icon={<Building2 className="h-4 w-4 text-gray-600" />}
            title={t("departments.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("departments.totalDepartments"),
                value: kpis.totalDepartments,
                description: `${kpis.activeDepartments} ${t("departments.active")}`,
                icon: <Building2 className="h-4 w-4" />,
              },
              {
                title: t("departments.active"),
                value: kpis.activeDepartments,
                description: `${((kpis.activeDepartments / kpis.totalDepartments) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Building2 className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
              {
                title: t("departments.inactive"),
                value: kpis.inactiveDepartments,
                description: `${((kpis.inactiveDepartments / kpis.totalDepartments) * 100 || 0).toFixed(0)}${t("common.ofTotal")}`,
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
                  placeholder={t("departments.search")}
                  value={search}
                />
              </div>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("departments.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("departments.allStatuses")}
                  </SelectItem>
                  <SelectItem value="active">
                    {t("departments.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("departments.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="ml-auto gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("departments.addDepartment")}
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">
                      {t("departments.code")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("departments.name")}
                    </TableHead>
                    <TableHead className="px-4">
                      Color
                    </TableHead>
                    <TableHead className="px-4">
                      {t("departments.status")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("departments.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
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
                    filteredDepartments.map((department) => (
                      <TableRow className="hover:bg-muted/50" key={department.id}>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                            {department.code}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate px-4 font-medium">
                          {department.name}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-xs">
                            <span className={`mr-1.5 h-2 w-2 rounded-full ${department.color}`} />
                            {getColorName(department.color)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          {department.isActive ? (
                            <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                              {t("departments.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                              {t("departments.inactive")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => setEditingDepartment(department)}
                              size="icon"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setDeletingDepartment(department)}
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
        <CreateDepartmentDialog
          onClose={handleCreateDialogClose}
        />
      )}

      {/* Edit Dialog */}
      {editingDepartment && (
        <EditDepartmentDialog
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onSave={handleUpdateDepartment}
        />
      )}

      {/* Delete Dialog */}
      {deletingDepartment && (
        <DeleteDepartmentDialog
          department={deletingDepartment}
          onClose={() => setDeletingDepartment(null)}
          onConfirm={handleDeleteDepartment}
        />
      )}
    </>
  );
}

// Simple Dialog Components (inline for now)
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

function CreateDepartmentDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const createDepartment = useCreateDepartment();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = () => {
    createDepartment.mutate(
      { name, code: generateCode(name), color: selectedColor, isActive: true },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("departments.addDepartment")}</DialogTitle>
          <DialogDescription>
            {t("departments.addDepartmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("departments.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production"
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

function EditDepartmentDialog({
  department,
  onClose,
  onSave,
}: {
  department: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const { t } = useTranslation();
  const updateDepartment = useUpdateDepartment();
  const [name, setName] = useState(department.name);
  const [selectedColor, setSelectedColor] = useState(department.color || COLORS[0].value);
  const [isActive, setIsActive] = useState(department.isActive);

  const handleSubmit = () => {
    onSave({ name, code: generateCode(name), color: selectedColor, isActive });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("departments.editDepartment")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t("departments.name")}</Label>
            <Input
              id="edit-name"
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
              id="edit-isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Label htmlFor="edit-isActive">{t("departments.active")}</Label>
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

function DeleteDepartmentDialog({
  department,
  onClose,
  onConfirm,
}: {
  department: any;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const deleteDepartment = useDeleteDepartment();
  const isDeleting = deleteDepartment.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("departments.deleteDepartment")}</DialogTitle>
          <DialogDescription>
            {t("departments.deleteDepartmentMessage", {
              name: department.name,
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
