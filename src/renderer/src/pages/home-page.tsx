import { ShieldAlert, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertsKPIs } from "@/components/home/alerts-kpis";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { useAlerts, useEmployees } from "@/hooks";
import { AlertsPageTable } from "@/components/alerts/alerts-page-table";


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

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageHeaderCard
          description={t("dashboard.description")}
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("dashboard.title")}
        />
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 p-4">
      {/* Header */}
      <PageHeaderCard
        description={t("dashboard.description")}
        icon={<Sparkles className="h-4 w-4 text-gray-600" />}
        title={t("dashboard.title")}
      />

      {/* Key Metrics */}
      <AlertsKPIs kpis={kpis} />


      {/* Table */}
      <AlertsPageTable />
    </div>
  );
}
