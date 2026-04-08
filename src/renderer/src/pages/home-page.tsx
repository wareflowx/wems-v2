import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Homepage } from "@/components/home";
import { Page } from "@/components/pages";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { useAlerts, useEmployees } from "@/hooks";

export function HomePage() {
  const { t } = useTranslation();

  // Use TanStack Query hooks
  const { data: allAlerts = [], isLoading: isAlertsLoading } = useAlerts({});
  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployees();

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
      <Page.Root>
        <PageHeaderSkeleton metricsCount={4} showMetrics />
      </Page.Root>
    );
  }

  return (
    <Page.Root>
      <PageHeaderCard
        description={t("dashboard.description")}
        icon={<Sparkles className="h-4 w-4 text-gray-600" />}
        title={t("dashboard.title")}
      />

      <Page.Content>
        <Homepage.KPIS kpis={kpis} />

        <Homepage.Table />
      </Page.Content>
    </Page.Root>
  );
}
