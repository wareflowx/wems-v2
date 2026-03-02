"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Download, Search, SearchX, GraduationCap } from "lucide-react";
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
  useOnlineTrainings,
  useDeleteOnlineTraining,
  useEmployees,
} from "@/hooks";
import { useORPCReady } from "@/hooks";

type OnlineTraining = {
  id: number;
  employeeId: number;
  trainingName: string;
  trainingProvider: string;
  completionDate: string;
  expirationDate?: string;
  status: "in_progress" | "completed" | "expired";
  attachmentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function OnlineTrainingsPage() {
  const { t } = useTranslation();
  const orpcReady = useORPCReady();
  const [search, setSearch] = useState("");

  const { data: trainings = [], isLoading } = useOnlineTrainings();
  const { data: employees = [] } = useEmployees();
  const deleteTraining = useDeleteOnlineTraining();

  const employeeMap = useMemo(() => {
    return new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));
  }, [employees]);

  const filteredTrainings = useMemo(() => {
    if (!search) return trainings;
    return trainings.filter((training) => {
      const employeeName = employeeMap.get(training.employeeId) || "";
      return (
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        training.trainingName.toLowerCase().includes(search.toLowerCase()) ||
        training.trainingProvider.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [trainings, search, employeeMap]);

  const getStatus = (training: OnlineTraining) => {
    if (training.status === "in_progress") return "in_progress";

    if (training.expirationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(training.expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil(
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft < 0) return "expired";
      if (daysLeft <= 30) return "warning";
    }

    return training.status;
  };

  const kpis = useMemo(
    () => ({
      total: trainings.length,
      inProgress: trainings.filter((t) => t.status === "in_progress").length,
      completed: trainings.filter(
        (t) =>
          t.status === "completed" && getStatus(t) !== "expired" && getStatus(t) !== "warning"
      ).length,
      expired: trainings.filter((t) => getStatus(t) === "expired").length,
    }),
    [trainings]
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this training?")) {
      deleteTraining.mutate(id);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <PageHeaderCard
        description={t("onlineTrainings.description")}
        icon={<GraduationCap className="h-4 w-4 text-gray-600" />}
        title={t("onlineTrainings.title")}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{kpis.total}</div>
          <div className="text-sm text-muted-foreground">
            {t("onlineTrainings.total")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-blue-500">{kpis.inProgress}</div>
          <div className="text-sm text-muted-foreground">
            {t("onlineTrainings.inProgress")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-500">{kpis.completed}</div>
          <div className="text-sm text-muted-foreground">
            {t("onlineTrainings.completed")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-red-500">{kpis.expired}</div>
          <div className="text-sm text-muted-foreground">
            {t("onlineTrainings.expired")}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("onlineTrainings.search")}
          value={search}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">
                {t("onlineTrainings.employee")}
              </TableHead>
              <TableHead className="px-4">
                {t("onlineTrainings.trainingName")}
              </TableHead>
              <TableHead className="px-4">
                {t("onlineTrainings.provider")}
              </TableHead>
              <TableHead className="px-4">
                {t("onlineTrainings.completionDate")}
              </TableHead>
              <TableHead className="px-4">
                {t("onlineTrainings.expirationDate")}
              </TableHead>
              <TableHead className="px-4">
                {t("onlineTrainings.status")}
              </TableHead>
              <TableHead className="px-4 text-right">
                {t("onlineTrainings.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="h-64" colSpan={7}>
                  <div className="flex items-center justify-center">
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell className="h-64" colSpan={7}>
                  <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <SearchX className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium text-lg">
                      {t("onlineTrainings.empty")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainings.map((training) => {
                const status = getStatus(training);
                return (
                  <TableRow
                    className="hover:bg-muted/50"
                    key={training.id}
                  >
                    <TableCell className="px-4 font-medium">
                      {employeeMap.get(training.employeeId) || "Unknown"}
                    </TableCell>
                    <TableCell className="px-4">{training.trainingName}</TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {training.trainingProvider}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(training.completionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {training.expirationDate
                        ? new Date(training.expirationDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          status === "expired"
                            ? "bg-red-100 text-red-800"
                            : status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {t(`onlineTrainings.${status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-end gap-2">
                        {training.attachmentId && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(training.id)}
                        >
                          {t("onlineTrainings.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
