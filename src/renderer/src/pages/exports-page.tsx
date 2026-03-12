"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderOpen, File, Trash2, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/utils/toast";
import { queryKeys } from "@@/lib/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useORPCReady } from "@/hooks";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { ExportHistoryRecord } from "@/actions/database";

export function ExportsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orpcReady = useORPCReady();
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [deletingRecord, setDeletingRecord] = useState<ExportHistoryRecord | null>(null);

  // Fetch export history
  const { data: history = [], isLoading } = useQuery({
    queryKey: queryKeys.exports.history(),
    queryFn: () => db.getExportHistory(),
    enabled: orpcReady,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteExportFromHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exports.history() });
      toast({
        title: "Export deleted",
        description: "The export has been removed from history",
      });
      setDeletingRecord(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete export",
        variant: "destructive",
      });
    },
  });

  // Open file handler
  const handleOpenFile = async (filePath: string) => {
    try {
      await db.openExportedFile(filePath);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file",
        variant: "destructive",
      });
    }
  };

  // Open folder handler
  const handleOpenFolder = async (filePath: string) => {
    try {
      await db.openExportFolder(filePath);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open folder",
        variant: "destructive",
      });
    }
  };

  // Filter history
  const filteredHistory = history.filter((record) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        record.filePath.toLowerCase().includes(searchLower) ||
        record.types.some((type) => type.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Format filter
    if (formatFilter !== "all" && record.format !== formatFilter) {
      return false;
    }

    return true;
  });

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get format badge color
  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "csv":
        return "bg-green-100 text-green-800";
      case "xlsx":
        return "bg-blue-100 text-blue-800";
      case "pdf":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeaderCard title={t("exports.title", "Export History")} description={t("exports.description", "View and manage your exported files")}>
        <div className="flex gap-2">
          <Input
            placeholder={t("exports.search", "Search...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("exports.filter.format", "Format")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exports.filter.all", "All")}</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeaderCard>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Download className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>{t("exports.empty.title", "No exports yet")}</p>
          <p className="text-sm">{t("exports.empty.description", "Your exports will appear here")}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("exports.columns.date", "Date")}</TableHead>
                <TableHead>{t("exports.columns.types", "Types")}</TableHead>
                <TableHead>{t("exports.columns.format", "Format")}</TableHead>
                <TableHead>{t("exports.columns.records", "Records")}</TableHead>
                <TableHead>{t("exports.columns.path", "Path")}</TableHead>
                <TableHead className="text-right">{t("exports.columns.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(record.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {record.types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getFormatBadgeColor(
                        record.format
                      )}`}
                    >
                      {record.format.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{record.recordCount}</TableCell>
                  <TableCell className="max-w-xs truncate" title={record.filePath}>
                    <span className="text-xs font-mono">{record.filePath}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFile(record.filePath)}
                        title={t("exports.actions.openFile", "Open file")}
                      >
                        <File className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFolder(record.filePath)}
                        title={t("exports.actions.openFolder", "Open folder")}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingRecord(record)}
                        title={t("exports.actions.delete", "Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
        onConfirm={() => deletingRecord && deleteMutation.mutate(deletingRecord.id)}
        title={t("exports.deleteConfirm.title", "Delete export?")}
        description={t("exports.deleteConfirm.description", "This will remove the export from history. The file will not be deleted.")}
        confirmText={t("exports.deleteConfirm.confirm", "Delete")}
        cancelText={t("exports.deleteConfirm.cancel", "Cancel")}
      />
    </div>
  );
}
