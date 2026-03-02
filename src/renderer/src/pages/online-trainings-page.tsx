"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Filter,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddOnlineTrainingDialog } from "@/components/online-trainings/AddOnlineTrainingDialog";
import { EditOnlineTrainingDialog } from "@/components/online-trainings/EditOnlineTrainingDialog";
import { useToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useOnlineTrainings,
  useCreateOnlineTraining,
  useDeleteOnlineTraining,
  useUpdateOnlineTraining,
  useEmployees,
} from "@/hooks";
import * as db from "@/actions/database";

export function OnlineTrainingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<string>("employee");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: trainings = [], isLoading } = useOnlineTrainings();
  const { data: employees = [] } = useEmployees();
  const createTraining = useCreateOnlineTraining();
  const updateTraining = useUpdateOnlineTraining();
  const deleteTraining = useDeleteOnlineTraining();

  // Calculate status for each training
  const trainingsWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return trainings.map((training: any) => {
      let status = training.status;

      if (training.status !== "in_progress" && training.expirationDate) {
        const expDate = new Date(training.expirationDate);
        expDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) status = "expired";
        else if (daysLeft <= 30) status = "warning";
      }

      return { ...training, computedStatus: status };
    });
  }, [trainings]);

  // KPIs
  const kpis = useMemo(
    () => ({
      totalTrainings: trainingsWithStatus.length,
      inProgressTrainings: trainingsWithStatus.filter((t: any) => t.status === "in_progress").length,
      completedTrainings: trainingsWithStatus.filter((t: any) => t.status === "completed" && t.computedStatus !== "expired" && t.computedStatus !== "warning").length,
      expiredTrainings: trainingsWithStatus.filter((t: any) => t.computedStatus === "expired").length,
    }),
    [trainingsWithStatus]
  );

  // Get unique employees
  const uniqueEmployees = useMemo(() => {
    const employeeMap = new Map<number, string>();
    trainings.forEach((t: any) => {
      const emp = employees.find((e) => e.id === t.employeeId);
      if (emp) {
        employeeMap.set(emp.id, `${emp.firstName} ${emp.lastName}`);
      }
    });
    return Array.from(employeeMap.entries()).map(([id, name]) => ({ id, name }));
  }, [trainings, employees]);

  // Filter
  const filteredTrainings = useMemo(() => {
    return trainingsWithStatus.filter((training: any) => {
      const emp = employees.find((e) => e.id === training.employeeId);
      const employeeName = emp ? `${emp.firstName} ${emp.lastName}` : "";

      const matchesSearch =
        search === "" ||
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        training.trainingName.toLowerCase().includes(search.toLowerCase()) ||
        training.trainingProvider.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || training.computedStatus === statusFilter;
      const matchesEmployee = employeeFilter === "all" || employeeName === employeeFilter;

      return matchesSearch && matchesStatus && matchesEmployee;
    });
  }, [trainingsWithStatus, search, statusFilter, employeeFilter, employees]);

  // Sort
  const sortedTrainings = useMemo(() => {
    const sorted = [...filteredTrainings].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === "employee") {
        const empA = employees.find((e) => e.id === a.employeeId);
        const empB = employees.find((e) => e.id === b.employeeId);
        aValue = empA ? `${empA.firstName} ${empA.lastName}` : "";
        bValue = empB ? `${empB.firstName} ${empB.lastName}` : "";
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTrainings, sortColumn, sortDirection, employees]);

  // Paginate
  const totalPages = Math.ceil(sortedTrainings.length / itemsPerPage);
  const paginatedTrainings = sortedTrainings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleAdd = async (data: {
    employeeId: number;
    trainingName: string;
    trainingProvider: string;
    completionDate: string;
    expirationDate?: string;
    status: "in_progress" | "completed" | "expired";
    document: {
      name: string;
      data: string;
      mimeType: string;
      size: number;
    } | null;
  }) => {
    let attachmentId: string | undefined;

    // If there's a document, create the attachment first
    if (data.document) {
      try {
        // Get employee name for the folder path
        const employee = employees.find((e) => e.id === data.employeeId);
        const employeeName = employee
          ? `${employee.firstName} ${employee.lastName}`
          : undefined;

        const attachment = await db.createAttachment({
          employeeId: data.employeeId,
          employeeName,
          entityType: "online_training",
          originalName: data.document.name,
          mimeType: data.document.mimeType,
          size: data.document.size,
          fileData: data.document.data,
        });
        attachmentId = attachment?.id;
      } catch (error) {
        console.error("Failed to create attachment:", error);
        toast({
          title: "Failed to upload document",
          description: "The document could not be uploaded. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Then create the training with the attachmentId
    createTraining.mutate(
      {
        employeeId: data.employeeId,
        trainingName: data.trainingName,
        trainingProvider: data.trainingProvider,
        completionDate: data.completionDate,
        expirationDate: data.expirationDate,
        status: data.status,
        attachmentId,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
        },
      }
    );
  };

  const handleEdit = (data: any) => {
    updateTraining.mutate(data, {
      onSuccess: () => {
        setEditingTraining(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("onlineTrainings.confirmDelete"))) {
      deleteTraining.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeContent = () => {
      switch (status) {
        case "expired":
          return (
            <span className="inline-flex items-center rounded-md border border-red-500/25 bg-red-500/15 px-2 py-0.5 font-medium text-red-700 text-xs">
              {t("onlineTrainings.expired")}
            </span>
          );
        case "warning":
          return (
            <span className="inline-flex items-center rounded-md border border-yellow-600/25 bg-yellow-600/15 px-2 py-0.5 font-medium text-xs text-yellow-700">
              {t("onlineTrainings.expiringSoon")}
            </span>
          );
        case "in_progress":
          return (
            <span className="inline-flex items-center rounded-md border border-blue-600/25 bg-blue-600/15 px-2 py-0.5 font-medium text-blue-700 text-xs">
              {t("onlineTrainings.inProgress")}
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center rounded-md border border-green-600/25 bg-green-600/15 px-2 py-0.5 font-medium text-green-700 text-xs">
              {t("onlineTrainings.completed")}
            </span>
          );
      }
    };

    const tooltipContent = () => {
      switch (status) {
        case "expired":
          return t("onlineTrainings.expired");
        case "warning":
          return t("onlineTrainings.expiringSoon");
        case "in_progress":
          return t("onlineTrainings.inProgress");
        default:
          return t("onlineTrainings.completed");
      }
    };

    return (
      <Tooltip>
        <TooltipTrigger>{badgeContent()}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getDaysBadge = (expirationDate: string | null) => {
    if (!expirationDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let dotColor: string;
    let text: string;

    if (daysLeft < 0) {
      dotColor = "bg-red-500";
      text = `${Math.abs(daysLeft)} days overdue`;
    } else if (daysLeft <= 30) {
      dotColor = "bg-yellow-600";
      text = `${daysLeft} days left`;
    } else {
      dotColor = "bg-green-600";
      text = `${daysLeft} days left`;
    }

    const tooltipContent = () => {
      if (daysLeft < 0) {
        return "Training has expired";
      }
      return "Days until expiration";
    };

    const badge = (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {text}
      </span>
    );

    return (
      <Tooltip>
        <TooltipTrigger>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <PageHeaderSkeleton metricsCount={4} showMetrics />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          <PageHeaderCard
            description={t("onlineTrainings.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("onlineTrainings.title")}
          />

          <MetricsSection
            kpis={[
              {
                title: t("onlineTrainings.totalOnlineTrainings"),
                value: kpis.totalTrainings,
                description: `${kpis.completedTrainings} ${t("onlineTrainings.completed")}`,
                icon: <Sparkles className="h-4 w-4" />,
              },
              {
                title: t("onlineTrainings.inProgress"),
                value: kpis.inProgressTrainings,
                description: `${((kpis.inProgressTrainings / kpis.totalTrainings) * 100).toFixed(0)}${t("onlineTrainings.ofTotal")}`,
                icon: <Filter className="h-4 w-4" />,
                iconColor: "text-blue-500",
              },
              {
                title: t("onlineTrainings.expired"),
                value: kpis.expiredTrainings,
                description: `${((kpis.expiredTrainings / kpis.totalTrainings) * 100).toFixed(0)}${t("onlineTrainings.ofTotal")}`,
                icon: <Sparkles className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: t("onlineTrainings.completed"),
                value: kpis.completedTrainings,
                description: `${((kpis.completedTrainings / kpis.totalTrainings) * 100).toFixed(0)}${t("onlineTrainings.ofTotal")}`,
                icon: <Sparkles className="h-4 w-4" />,
                iconColor: "text-green-500",
              },
            ]}
          />

          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t("onlineTrainings.search")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("onlineTrainings.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="in_progress">{t("onlineTrainings.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("onlineTrainings.completed")}</SelectItem>
                <SelectItem value="expired">{t("onlineTrainings.expired")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={(v) => { setEmployeeFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("onlineTrainings.employee")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {uniqueEmployees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("onlineTrainings.add")}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4" onClick={() => handleSort("employee")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.employee")}
                      {sortColumn === "employee" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("trainingName")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.trainingName")}
                      {sortColumn === "trainingName" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("trainingProvider")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.provider")}
                      {sortColumn === "trainingProvider" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("completionDate")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.completionDate")}
                      {sortColumn === "completionDate" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("expirationDate")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.expirationDate")}
                      {sortColumn === "expirationDate" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      {t("onlineTrainings.status")}
                      {sortColumn === "status" && (
                        sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="px-4 text-right">{t("onlineTrainings.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrainings.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-64" colSpan={7}>
                      <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <SearchX className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="font-medium text-lg">{t("onlineTrainings.empty")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTrainings.map((training: any) => {
                    const emp = employees.find((e) => e.id === training.employeeId);
                    return (
                      <TableRow className="hover:bg-muted/50" key={training.id}>
                        <TableCell className="px-4 font-medium">
                          {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown"}
                        </TableCell>
                        <TableCell className="px-4">{training.trainingName}</TableCell>
                        <TableCell className="px-4 text-muted-foreground">{training.trainingProvider || "-"}</TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {new Date(training.completionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4">
                          {training.expirationDate ? getDaysBadge(training.expirationDate) : "-"}
                        </TableCell>
                        <TableCell className="px-4">
                          {getStatusBadge(training.computedStatus)}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => setEditingTraining(training)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("onlineTrainings.edit")}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(training.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("onlineTrainings.delete")}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("common.showing")} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedTrainings.length)} {t("common.of")} {sortedTrainings.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{currentPage} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddOnlineTrainingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
        employees={employees}
      />
      <EditOnlineTrainingDialog
        open={!!editingTraining}
        onOpenChange={(open) => !open && setEditingTraining(null)}
        onEdit={handleEdit}
        training={editingTraining}
      />
    </>
  );
}
