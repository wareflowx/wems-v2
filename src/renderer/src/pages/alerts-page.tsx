import { AlertTriangle, Bell, ShieldAlert, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AlertsPageTable } from "@/components/alerts/alerts-page-table";
import { MetricsSection } from "@/components/ui/metrics-section";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { PageHeaderSkeleton } from "@/components/ui/table-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAlerts } from "@/hooks";

interface Alert {
  id: number;
  type: string;
  employee: string;
  employeeId: number;
  category?: string;
  visitType?: string;
  daysLeft?: number;
  severity: string;
  date: string;
}

export function AlertsPage() {
  const { t } = useTranslation();

  // Use TanStack Query hook for alerts (get all, filters handled by component)
  const { data: alerts = [], isLoading } = useAlerts({});

  // KPIs
  const kpis = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
    warningAlerts: alerts.filter((a) => a.severity === "warning").length,
    infoAlerts: alerts.filter((a) => a.severity === "info").length,
  };

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
            description={t("alerts.description")}
            icon={<Sparkles className="h-4 w-4 text-gray-600" />}
            title={t("alerts.title")}
          />

          {/* Key Metrics */}
          <MetricsSection
            kpis={[
              {
                title: t("alerts.all"),
                value: kpis.totalAlerts,
                description: t("alerts.totalAlerts"),
                icon: <Bell className="h-4 w-4" />,
              },
              {
                title: t("alerts.critical"),
                value: kpis.criticalAlerts,
                description: `${((kpis.criticalAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <ShieldAlert className="h-4 w-4" />,
                iconColor: "text-red-500",
              },
              {
                title: t("alerts.warning"),
                value: kpis.warningAlerts,
                description: `${((kpis.warningAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <AlertTriangle className="h-4 w-4" />,
                iconColor: "text-yellow-500",
              },
              {
                title: t("alerts.info"),
                value: kpis.infoAlerts,
                description: `${((kpis.infoAlerts / kpis.totalAlerts) * 100).toFixed(0)}${t("common.ofTotal")}`,
                icon: <Bell className="h-4 w-4" />,
                iconColor: "text-blue-500",
              },
            ]}
          />

          <div className="flex flex-col gap-2">
            <AlertsPageTable />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
