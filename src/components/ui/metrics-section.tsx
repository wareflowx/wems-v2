import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface KPIProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconColor?: string;
}

interface MetricsSectionProps {
  kpis: KPIProps[];
}

export function MetricsSection({ kpis }: MetricsSectionProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <div className={kpi.iconColor || ""}>{kpi.icon}</div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
