"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, SearchX, Trash2 } from "lucide-react";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/utils/toast";
import { queryKeys } from "@@/lib/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useORPCReady } from "@/hooks";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

type DeletedItemType = "employee" | "position" | "workLocation" | "department" | "contractType";

interface DeletedItem {
  id: number;
  type: DeletedItemType;
  name: string;
  deletedAt: string;
}

export function TrashPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orpcReady = useORPCReady();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DeletedItemType>("employee");
  const [deletingItem, setDeletingItem] = useState<DeletedItem | null>(null);

  // Fetch deleted items based on active tab
  const { data: deletedEmployees = [] } = useQuery({
    queryKey: queryKeys.trash.deletedEmployees(),
    queryFn: () => db.getDeletedEmployees(),
    enabled: orpcReady && activeTab === "employee",
  });

  const { data: deletedPositions = [] } = useQuery({
    queryKey: queryKeys.trash.deletedPositions(),
    queryFn: () => db.getDeletedPositions(),
    enabled: orpcReady && activeTab === "position",
  });

  const { data: deletedWorkLocations = [] } = useQuery({
    queryKey: queryKeys.trash.deletedWorkLocations(),
    queryFn: () => db.getDeletedWorkLocations(),
    enabled: orpcReady && activeTab === "workLocation",
  });

  const { data: deletedDepartments = [] } = useQuery({
    queryKey: queryKeys.trash.deletedDepartments(),
    queryFn: () => db.getDeletedDepartments(),
    enabled: orpcReady && activeTab === "department",
  });

  const { data: deletedContractTypes = [] } = useQuery({
    queryKey: queryKeys.trash.deletedContractTypes(),
    queryFn: () => db.getDeletedContractTypes(),
    enabled: orpcReady && activeTab === "contractType",
  });

  // Restore mutations with proper cache invalidation
  const restoreEmployee = useMutation({
    mutationFn: (id: number) => db.restoreEmployee(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
      await queryClient.refetchQueries({ queryKey: queryKeys.employees.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedEmployees() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedEmployees() });
      toast({ title: t("trash.restoreSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.restoreError"), variant: "destructive" });
    },
  });

  const restorePosition = useMutation({
    mutationFn: (id: number) => db.restorePosition({ id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });
      await queryClient.refetchQueries({ queryKey: queryKeys.positions.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedPositions() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedPositions() });
      toast({ title: t("trash.restoreSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.restoreError"), variant: "destructive" });
    },
  });

  const restoreWorkLocation = useMutation({
    mutationFn: (id: number) => db.restoreWorkLocation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.workLocations.lists() });
      await queryClient.refetchQueries({ queryKey: queryKeys.workLocations.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedWorkLocations() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedWorkLocations() });
      toast({ title: t("trash.restoreSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.restoreError"), variant: "destructive" });
    },
  });

  const restoreDepartment = useMutation({
    mutationFn: (id: number) => db.restoreDepartment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.departments.lists() });
      await queryClient.refetchQueries({ queryKey: queryKeys.departments.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedDepartments() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedDepartments() });
      toast({ title: t("trash.restoreSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.restoreError"), variant: "destructive" });
    },
  });

  const restoreContractType = useMutation({
    mutationFn: (id: number) => db.restoreContractType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.contractTypes.lists() });
      await queryClient.refetchQueries({ queryKey: queryKeys.contractTypes.lists() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedContractTypes() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedContractTypes() });
      toast({ title: t("trash.restoreSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.restoreError"), variant: "destructive" });
    },
  });

  // Permanent delete mutations
  const permanentDeleteEmployee = useMutation({
    mutationFn: (id: number) => db.permanentDeleteEmployee(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedEmployees() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedEmployees() });
      toast({ title: t("trash.deleteSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.deleteError"), variant: "destructive" });
    },
  });

  const permanentDeletePosition = useMutation({
    mutationFn: (id: number) => db.permanentDeletePosition(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedPositions() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedPositions() });
      toast({ title: t("trash.deleteSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.deleteError"), variant: "destructive" });
    },
  });

  const permanentDeleteWorkLocation = useMutation({
    mutationFn: (id: number) => db.permanentDeleteWorkLocation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedWorkLocations() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedWorkLocations() });
      toast({ title: t("trash.deleteSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.deleteError"), variant: "destructive" });
    },
  });

  const permanentDeleteDepartment = useMutation({
    mutationFn: (id: number) => db.permanentDeleteDepartment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedDepartments() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedDepartments() });
      toast({ title: t("trash.deleteSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.deleteError"), variant: "destructive" });
    },
  });

  const permanentDeleteContractType = useMutation({
    mutationFn: (id: number) => db.permanentDeleteContractType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedContractTypes() });
      await queryClient.refetchQueries({ queryKey: queryKeys.trash.deletedContractTypes() });
      toast({ title: t("trash.deleteSuccess") });
    },
    onError: (error) => {
      toast({ title: t("trash.deleteError"), variant: "destructive" });
    },
  });

  // Transform data into unified format
  const deletedItems: DeletedItem[] = useMemo(() => {
    let items: DeletedItem[] = [];

    switch (activeTab) {
      case "employee":
        items = deletedEmployees.map((e: any) => ({
          id: e.id,
          type: "employee" as DeletedItemType,
          name: `${e.firstName} ${e.lastName}`,
          deletedAt: e.deletedAt,
        }));
        break;
      case "position":
        items = deletedPositions.map((p: any) => ({
          id: p.id,
          type: "position" as DeletedItemType,
          name: p.name,
          deletedAt: p.deletedAt,
        }));
        break;
      case "workLocation":
        items = deletedWorkLocations.map((w: any) => ({
          id: w.id,
          type: "workLocation" as DeletedItemType,
          name: w.name,
          deletedAt: w.deletedAt,
        }));
        break;
      case "department":
        items = deletedDepartments.map((d: any) => ({
          id: d.id,
          type: "department" as DeletedItemType,
          name: d.name,
          deletedAt: d.deletedAt,
        }));
        break;
      case "contractType":
        items = deletedContractTypes.map((c: any) => ({
          id: c.id,
          type: "contractType" as DeletedItemType,
          name: c.name,
          deletedAt: c.deletedAt,
        }));
        break;
    }

    if (search) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return items;
  }, [
    activeTab,
    deletedEmployees,
    deletedPositions,
    deletedWorkLocations,
    deletedDepartments,
    deletedContractTypes,
    search,
  ]);

  // Count totals for tabs
  const tabCounts = useMemo(
    () => ({
      employee: deletedEmployees.length,
      position: deletedPositions.length,
      workLocation: deletedWorkLocations.length,
      department: deletedDepartments.length,
      contractType: deletedContractTypes.length,
    }),
    [
      deletedEmployees,
      deletedPositions,
      deletedWorkLocations,
      deletedDepartments,
      deletedContractTypes,
    ]
  );

  const handleRestore = (item: DeletedItem) => {
    switch (item.type) {
      case "employee":
        restoreEmployee.mutate(item.id);
        break;
      case "position":
        restorePosition.mutate(item.id);
        break;
      case "workLocation":
        restoreWorkLocation.mutate(item.id);
        break;
      case "department":
        restoreDepartment.mutate(item.id);
        break;
      case "contractType":
        restoreContractType.mutate(item.id);
        break;
    }
  };

  const handlePermanentDelete = (item: DeletedItem) => {
    switch (item.type) {
      case "employee":
        permanentDeleteEmployee.mutate(item.id);
        break;
      case "position":
        permanentDeletePosition.mutate(item.id);
        break;
      case "workLocation":
        permanentDeleteWorkLocation.mutate(item.id);
        break;
      case "department":
        permanentDeleteDepartment.mutate(item.id);
        break;
      case "contractType":
        permanentDeleteContractType.mutate(item.id);
        break;
    }
  };

  const tabs: { key: DeletedItemType; label: string }[] = [
    { key: "employee", label: t("trash.employees") },
    { key: "position", label: t("trash.positions") },
    { key: "workLocation", label: t("trash.workLocations") },
    { key: "department", label: t("trash.departments") },
    { key: "contractType", label: t("trash.contractTypes") },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        <PageHeaderCard
          description={t("trash.description")}
          icon={<Trash2 className="h-4 w-4 text-gray-600" />}
          title={t("trash.title")}
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("trash.search")}
            value={search}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">{t("trash.name")}</TableHead>
                <TableHead className="px-4">{t("trash.deletedAt")}</TableHead>
                <TableHead className="px-4 text-right">
                  {t("trash.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedItems.length === 0 ? (
                <TableRow>
                  <TableCell className="h-64" colSpan={3}>
                    <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <SearchX className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="font-medium text-lg">
                        {t("trash.empty")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                deletedItems.map((item) => (
                  <TableRow className="hover:bg-muted/50" key={item.id}>
                    <TableCell className="px-4 font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleRestore(item)}
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {t("trash.restore")}
                        </Button>
                        <Button
                          onClick={() => setDeletingItem(item)}
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("trash.delete")}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        description={t("trash.deleteConfirmDescription", {
          name: deletingItem?.name,
          type: deletingItem?.type,
        })}
        onConfirm={() => {
          if (deletingItem) {
            handlePermanentDelete(deletingItem);
            setDeletingItem(null);
          }
        }}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        open={deletingItem !== null}
        title={t("trash.deleteConfirmTitle")}
      />
    </div>
  );
}
