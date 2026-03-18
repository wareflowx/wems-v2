import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Homepage } from "@/components/home";
import { useAlerts, useEmployees } from "@/hooks";

export function HomePage() {
  const { t } = useTranslation();

  // Use TanStack Query hooks
  const { data: allAlerts = [], isLoading: isAlertsLoading } = useAlerts({});
  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees();

  const isLoading = isAlertsLoading || isEmployeesLoading;

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
      <TooltipProvider>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <PageHeaderSkeleton metricsCount={4} showMetrics />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="min-h-full space-y-3">
          {/* Header */}
          <PageHeaderCard
            description={t("dashboard.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("dashboard.title")}
          />

          {/* KPIs */}
          <Homepage.KPIS kpis={kpis} />

          {/* Table */}
          <Homepage.Table />
        </div>
      </div>
    </TooltipProvider>
  );
}
