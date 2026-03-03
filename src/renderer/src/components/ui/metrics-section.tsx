import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/tailwind";

interface KPIProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconColor?: string;
}

interface MetricsSectionProps {
  kpis: KPIProps[];
  className?: string;
}

export function MetricsSection({ kpis, className }: MetricsSectionProps) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2 lg:grid-cols-4", className)}>
      {kpis.map((kpi, index) => (
        <Card className="p-4" key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="font-medium text-sm">{kpi.title}</CardTitle>
            <div className={kpi.iconColor || ""}>{kpi.icon}</div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="font-bold text-2xl">{kpi.value}</div>
            <p className="text-muted-foreground text-xs">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
