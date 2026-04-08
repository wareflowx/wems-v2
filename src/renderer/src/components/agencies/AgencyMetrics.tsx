import { Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MetricsSection } from "@/components/ui/metrics-section";

interface AgencyMetricsProps {
  metrics: {
    totalAgencies: number;
    activeAgencies: number;
    inactiveAgencies: number;
  };
  labels: {
    totalAgencies: string;
    active: string;
    inactive: string;
    ofTotal: string;
  };
  icon?: ReactNode;
}

export function AgencyMetrics({ metrics, labels, icon }: AgencyMetricsProps) {
  const { t } = useTranslation();

  return (
    <MetricsSection
      className="lg:grid-cols-3"
      kpis={[
        {
          title: labels.totalAgencies,
          value: metrics.totalAgencies,
          description: `${metrics.activeAgencies} ${labels.active}`,
          icon: icon ?? <Building2 className="h-4 w-4" />,
        },
        {
          title: labels.active,
          value: metrics.activeAgencies,
          description: `${((metrics.activeAgencies / metrics.totalAgencies) * 100 || 0).toFixed(0)}${labels.ofTotal}`,
          icon: icon ?? <Building2 className="h-4 w-4" />,
          iconColor: "text-green-500",
        },
        {
          title: labels.inactive,
          value: metrics.inactiveAgencies,
          description: `${((metrics.inactiveAgencies / metrics.totalAgencies) * 100 || 0).toFixed(0)}${labels.ofTotal}`,
          icon: icon ?? <Building2 className="h-4 w-4" />,
          iconColor: "text-gray-500",
        },
      ]}
    />
  );
}
