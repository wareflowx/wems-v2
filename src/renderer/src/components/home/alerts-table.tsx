import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Alert {
  id: number;
  type: string;
  employee: string;
  employeeId: number;
  category?: string;
  visitType?: string;
  date: string;
  severity: string;
}

interface AlertsTableProps {
  alerts: Alert[];
  getTypeBadge: (type: string) => React.ReactNode;
  getDetailBadge: (category?: string, visitType?: string) => React.ReactNode;
  getAlertBadge: (severity: string) => React.ReactNode;
}

export function AlertsTable({
  alerts,
  getTypeBadge,
  getDetailBadge,
  getAlertBadge,
}: AlertsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
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
          {alerts.map((alert) => (
            <TableRow className="hover:bg-muted/50" key={alert.id}>
              <TableCell>{getTypeBadge(alert.type)}</TableCell>
              <TableCell>
                <Link
                  className="text-gray-700 underline transition-opacity hover:opacity-80"
                  to={`/employees/${alert.employeeId}`}
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
                  <Button size="icon" variant="ghost">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
