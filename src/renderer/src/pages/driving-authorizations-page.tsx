"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Car, Download, Edit, Plus, Search, SearchX } from "lucide-react";
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
  useDrivingAuthorizations,
  useDeleteDrivingAuthorization,
  useEmployees,
} from "@/hooks";
import { useORPCReady } from "@/hooks";

type DrivingAuthorization = {
  id: number;
  employeeId: number;
  licenseCategory: string;
  dateObtained: string;
  expirationDate: string;
  attachmentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function DrivingAuthorizationsPage() {
  const { t } = useTranslation();
  const orpcReady = useORPCReady();
  const [search, setSearch] = useState("");

  const { data: authorizations = [], isLoading } = useDrivingAuthorizations();
  const { data: employees = [] } = useEmployees();
  const deleteAuthorization = useDeleteDrivingAuthorization();

  const employeeMap = useMemo(() => {
    return new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));
  }, [employees]);

  const filteredAuthorizations = useMemo(() => {
    if (!search) return authorizations;
    return authorizations.filter((auth) => {
      const employeeName = employeeMap.get(auth.employeeId) || "";
      return (
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        auth.licenseCategory.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [authorizations, search, employeeMap]);

  const getStatus = (expirationDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return "expired";
    if (daysLeft <= 30) return "warning";
    return "valid";
  };

  const kpis = useMemo(
    () => ({
      total: authorizations.length,
      expired: authorizations.filter(
        (a) => getStatus(a.expirationDate) === "expired"
      ).length,
      warning: authorizations.filter(
        (a) => getStatus(a.expirationDate) === "warning"
      ).length,
      valid: authorizations.filter(
        (a) => getStatus(a.expirationDate) === "valid"
      ).length,
    }),
    [authorizations]
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this driving authorization?")) {
      deleteAuthorization.mutate(id);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <PageHeaderCard
        description={t("drivingAuthorizations.description")}
        icon={<Car className="h-4 w-4 text-gray-600" />}
        title={t("drivingAuthorizations.title")}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{kpis.total}</div>
          <div className="text-sm text-muted-foreground">
            {t("drivingAuthorizations.total")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-red-500">{kpis.expired}</div>
          <div className="text-sm text-muted-foreground">
            {t("drivingAuthorizations.expired")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-yellow-500">{kpis.warning}</div>
          <div className="text-sm text-muted-foreground">
            {t("drivingAuthorizations.warning")}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-green-500">{kpis.valid}</div>
          <div className="text-sm text-muted-foreground">
            {t("drivingAuthorizations.valid")}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("drivingAuthorizations.search")}
          value={search}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">
                {t("drivingAuthorizations.employee")}
              </TableHead>
              <TableHead className="px-4">
                {t("drivingAuthorizations.category")}
              </TableHead>
              <TableHead className="px-4">
                {t("drivingAuthorizations.dateObtained")}
              </TableHead>
              <TableHead className="px-4">
                {t("drivingAuthorizations.expirationDate")}
              </TableHead>
              <TableHead className="px-4">
                {t("drivingAuthorizations.status")}
              </TableHead>
              <TableHead className="px-4 text-right">
                {t("drivingAuthorizations.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="h-64" colSpan={6}>
                  <div className="flex items-center justify-center">
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAuthorizations.length === 0 ? (
              <TableRow>
                <TableCell className="h-64" colSpan={6}>
                  <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <SearchX className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium text-lg">
                      {t("drivingAuthorizations.empty")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAuthorizations.map((auth) => {
                const status = getStatus(auth.expirationDate);
                return (
                  <TableRow
                    className="hover:bg-muted/50"
                    key={auth.id}
                  >
                    <TableCell className="px-4 font-medium">
                      {employeeMap.get(auth.employeeId) || "Unknown"}
                    </TableCell>
                    <TableCell className="px-4">{auth.licenseCategory}</TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(auth.dateObtained).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 text-muted-foreground">
                      {new Date(auth.expirationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          status === "expired"
                            ? "bg-red-100 text-red-800"
                            : status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {t(`drivingAuthorizations.${status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-end gap-2">
                        {auth.attachmentId && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(auth.id)}
                        >
                          {t("drivingAuthorizations.delete")}
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
