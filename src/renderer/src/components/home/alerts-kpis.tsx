import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Kpis {
  totalEmployees: number;
  activeEmployees: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  totalAlerts: number;
}

interface AlertsKPIsProps {
  kpis: Kpis;
}

export function AlertsKPIs({ kpis }: AlertsKPIsProps) {
  const { t } = useTranslation();

  return (
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
  );
}
