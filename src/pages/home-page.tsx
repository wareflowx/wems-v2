import {
  Users,
  ShieldAlert,
  Stethoscope,
  FileText,
  Sparkles,
  Bell,
  AlertTriangle,
  ArrowRight,
  Search,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useAlerts } from "@/hooks";

export function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [detailFilter, setDetailFilter] = useState<string>("all");

  // Use TanStack Query hook for alerts
  const { data: allAlerts = [], isLoading } = useAlerts({ search, severity: severityFilter, type: typeFilter === 'all' ? undefined : typeFilter });

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
      if (a.category) details.add(`CACES ${a.category}`);
      if (a.visitType) details.add(a.visitType);
    });
    return Array.from(details);
  }, [allAlerts]);

  // Calculate KPIs dynamically from alerts data
  const kpis = useMemo(() => {
    const criticalAlerts = allAlerts.filter(a => a.severity === 'critical').length
    const warningAlerts = allAlerts.filter(a => a.severity === 'warning').length
    const infoAlerts = allAlerts.filter(a => a.severity === 'info').length

    return {
      totalEmployees: 42, // This would come from employees API in future
      activeEmployees: 38, // This would come from employees API in future
      criticalAlerts,
      warningAlerts,
      infoAlerts,
      totalAlerts: allAlerts.length,
    }
  }, [allAlerts])

  const getAlertBadge = (severity: string, daysLeft?: number) => {
    if (severity === "critical")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-500">
          {t("alerts.critical")}
        </span>
      );
    if (severity === "warning")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
          {t("alerts.warning")}
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-500">
        {t("alerts.info")}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type.includes("CACES"))
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-500">
          {t("caces.title")}
        </span>
      );
    if (type.includes("Visite"))
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-500/10 border border-teal-500/20 text-teal-500">
          {t("medicalVisits.title")}
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/10 border border-gray-500/20 text-gray-500">
        {type}
      </span>
    );
  };

  const getDetailBadge = (category?: string, visitType?: string) => {
    if (category)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
          CACES {category}
        </span>
      );
    if (visitType)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
          {visitType}
        </span>
      );
    return <span className="text-gray-400">-</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 py-6">
        <div className="min-h-full space-y-3">
          <Card className="p-3 bg-background shadow-sm rounded-md">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  <span className="font-medium">{t("dashboard.title")}</span> - Vue d'ensemble de votre entreprise et alertes importantes
                </p>
              </div>
            </div>
          </Card>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 py-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <div className="mb-2">
          <Card className="p-3 bg-background shadow-sm rounded-md">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  <span className="font-medium">{t("dashboard.title")}</span> - Vue d'ensemble de votre entreprise et alertes importantes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.totalEmployees")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">{kpis.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.activeEmployees} actifs
              </p>
            </CardContent>
          </Card>
          <Card className="p-4 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                {t("alerts.critical")}
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">{kpis.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.totalAlerts > 0
                  ? `${((kpis.criticalAlerts / kpis.totalAlerts) * 100).toFixed(0)}% du total`
                  : '-'}
              </p>
            </CardContent>
          </Card>
          <Card className="p-4 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                {t("alerts.warning")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">{kpis.warningAlerts}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.totalAlerts > 0
                  ? `${((kpis.warningAlerts / kpis.totalAlerts) * 100).toFixed(0)}% du total`
                  : '-'}
              </p>
            </CardContent>
          </Card>
          <Card className="p-4 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-sm font-medium">
                Toutes les alertes
              </CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-2xl font-bold">{kpis.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">Total alertes</p>
            </CardContent>
          </Card>
        </div>


        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("employees.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("dashboard.filterByEmployee")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("dashboard.allEmployees")}
              </SelectItem>
              {uniqueEmployees.map((employee) => (
                <SelectItem key={employee} value={employee}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={detailFilter} onValueChange={setDetailFilter}>
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
                  <TableCell colSpan={6} className="h-64">
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <SearchX className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium">
                        {t("common.noData")}
                      </p>
                      <p className="text-sm mt-2 max-w-md text-center">
                        {t("dashboard.noDataFound")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentAlerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-muted/50">
                    <TableCell>{getTypeBadge(alert.type)}</TableCell>
                    <TableCell>
                      <Link
                        to={`/employees/${alert.employeeId}`}
                        className="text-gray-700 underline hover:opacity-80 transition-opacity"
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
                        <Button variant="ghost" size="icon">
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
