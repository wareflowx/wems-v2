import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"
import { type ReactNode } from "react"
import { Activity } from "lucide-react"

export interface KpiItem {
  title: string
  value: string | number
  description: string
  icon: ReactNode
  iconColor?: string
}

export interface MetricsSectionProps {
  kpis: KpiItem[]
  className?: string
}

export function MetricsSection({ kpis, className }: MetricsSectionProps) {
  return (
    <Card className={cn("py-0 gap-0 bg-background", className)}>
      <CardHeader className="pt-2 px-4">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-gray-600" />
          <CardTitle className="text-sm font-medium">
            Key indicators
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Card className="overflow-hidden py-0">
          <div className="flex flex-row divide-x divide-border">
            {kpis.map((kpi, index) => (
              <div key={index} className="flex-1 p-4">
                <div className="flex flex-row items-center justify-between mb-3">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <div className={kpi.iconColor || "text-muted-foreground"}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </CardContent>
    </Card>
  )
}
