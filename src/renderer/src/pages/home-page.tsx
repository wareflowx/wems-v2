import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  FileText,
  Search,
  SearchX,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useAlerts, useEmployees } from "@/hooks";

export function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [detailFilter, setDetailFilter] = useState<string>("all");

  // Use TanStack Query hook for alerts
  const { data: allAlerts = [], isLoading } = useAlerts({
    search,
    severity: severityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
  });

  // Use TanStack Query hook for employees
  const { data: employees = [] } = useEmployees();

  // Client-side filtering for employee and detail filters only
  // (search, severity, and type are already filtered by API)
  const recentAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      const matchesEmployee =
        employeeFilter === "all" || alert.employee === employeeFilter;

      const matchesDetail =
        detailFilter === "all" ||
        (alert.category && detailFilter === `CACES ${alert.category}`) ||
        (alert.visitType && detailFilter === alert.visitType);

      return matchesEmployee && matchesDetail;
    });
  }, [allAlerts, employeeFilter, detailFilter]);

  // Get unique employees and details
  const uniqueEmployees = useMemo(() => {
    const employees = new Set(allAlerts.map((a) => a.employee));
    return Array.from(employees);
  }, [allAlerts]);

  const uniqueDetails = useMemo(() => {
    const details = new Set<string>();
    allAlerts.forEach((a) => {
      if (a.category) {
        details.add(`CACES ${a.category}`);
      }
      if (a.visitType) {
        details.add(a.visitType);
      }
    });
    return Array.from(details);
  }, [allAlerts]);

  // Calculate KPIs dynamically from alerts data
  const kpis = useMemo(() => {
    const criticalAlerts = allAlerts.filter(
      (a) => a.severity === "critical"
    ).length;
    const warningAlerts = allAlerts.filter(
      (a) => a.severity === "warning"
    ).length;
    const infoAlerts = allAlerts.filter((a) => a.severity === "info").length;

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      criticalAlerts,
      warningAlerts,
      infoAlerts,
      totalAlerts: allAlerts.length,
    };
  }, [allAlerts, employees]);

  const getAlertBadge = (severity: string, _daysLeft?: number) => {
    if (severity === "critical") {
      return (
        <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-medium text-red-500 text-xs">
          {t("alerts.critical")}
        </span>
      );
    }
    if (severity === "warning") {
      return (
        <span className="inline-flex items-center rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 font-medium text-xs text-yellow-500">
          {t("alerts.warning")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-medium text-blue-500 text-xs">
        {t("alerts.info")}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type.includes("CACES")) {
      return (
        <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-medium text-purple-500 text-xs">
          {t("caces.title")}
        </span>
      );
    }
    if (type.includes("Visite")) {
      return (
        <span className="inline-flex items-center rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 font-medium text-teal-500 text-xs">
          {t("medicalVisits.title")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-gray-500/20 bg-gray-500/10 px-2 py-0.5 font-medium text-gray-500 text-xs">
        {type}
      </span>
    );
  };

  const getDetailBadge = (category?: string, visitType?: string) => {
    if (category) {
      return (
        <span className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-500 text-xs">
          CACES {category}
        </span>
      );
    }
    if (visitType) {
      return (
        <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-500 text-xs">
          {visitType}
        </span>
      );
    }
    return <span className="text-gray-400">-</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 py-6">
        <div className="min-h-full space-y-3">
          <Card className="rounded-md bg-background p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  <span className="font-medium">{t("dashboard.title")}</span> -
                  Vue d'ensemble de votre entreprise et alertes importantes
                </p>
              </div>
            </div>
          </Card>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 bg-sidebar p-4 py-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <div className="mb-2">
          <Card className="rounded-md bg-card p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  <span className="font-medium">{t("dashboard.title")}</span> -
                  Vue d'ensemble de votre entreprise et alertes importantes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-background p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="font-medium text-sm">
                {t("dashboard.totalEmployees")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="font-bold text-2xl">{kpis.totalEmployees}</div>
              <p className="text-muted-foreground text-xs">
                {kpis.activeEmployees} actifs
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="font-medium text-sm">
                {t("alerts.critical")}
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="font-bold text-2xl">{kpis.criticalAlerts}</div>
              <p className="text-muted-foreground text-xs">
                {kpis.totalAlerts > 0
                  ? `${((kpis.criticalAlerts / kpis.totalAlerts) * 100).toFixed(0)}% du total`
                  : "-"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="font-medium text-sm">
                {t("alerts.warning")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="font-bold text-2xl">{kpis.warningAlerts}</div>
              <p className="text-muted-foreground text-xs">
                {kpis.totalAlerts > 0
                  ? `${((kpis.warningAlerts / kpis.totalAlerts) * 100).toFixed(0)}% du total`
                  : "-"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Toutes les alertes
              </CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="font-bold text-2xl">{kpis.totalAlerts}</div>
              <p className="text-muted-foreground text-xs">Total alertes</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("employees.search")}
              value={search}
            />
          </div>
          <Select onValueChange={setTypeFilter} value={typeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.allTypes")}</SelectItem>
              <SelectItem value="caces">{t("caces.title")}</SelectItem>
              <SelectItem value="medical">
                {t("medicalVisits.title")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setSeverityFilter} value={severityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.filterBySeverity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("dashboard.allSeverities")}
              </SelectItem>
              <SelectItem value="critical">{t("alerts.critical")}</SelectItem>
              <SelectItem value="warning">{t("alerts.warning")}</SelectItem>
              <SelectItem value="info">{t("alerts.info")}</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setEmployeeFilter} value={employeeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.filterByEmployee")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.allEmployees")}</SelectItem>
              {uniqueEmployees.map((employee) => (
                <SelectItem key={employee} value={employee}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setDetailFilter} value={detailFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.filterByDetail")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.allDetails")}</SelectItem>
              {uniqueDetails.map((detail) => (
                <SelectItem key={detail} value={detail}>
                  {detail}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.filterByType")}</TableHead>
                <TableHead>{t("dashboard.filterByEmployee")}</TableHead>
                <TableHead>{t("dashboard.filterByDetail")}</TableHead>
                <TableHead>{t("caces.date")}</TableHead>
                <TableHead>{t("caces.status")}</TableHead>
                <TableHead className="text-right">
                  {t("employees.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAlerts.length === 0 ? (
                <TableRow>
                  <TableCell className="h-64" colSpan={6}>
                    <AnimatedEmpty
                      title={t("common.noData")}
                      description={t("dashboard.noDataFound")}
                      icons={[SearchX, SearchX, SearchX]}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                recentAlerts.map((alert) => (
                  <TableRow className="hover:bg-muted/50" key={alert.id}>
                    <TableCell>{getTypeBadge(alert.type)}</TableCell>
                    <TableCell>
                      <Link
                        className="text-gray-700 underline transition-opacity hover:opacity-80"
                        to={`/employees/${alert.employeeId}`}
                      >
                        {alert.employee}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {getDetailBadge(alert.category, alert.visitType)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {alert.date}
                    </TableCell>
                    <TableCell>{getAlertBadge(alert.severity)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost">
                          <FileText className="h-4 w-4" />
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
  );
}
