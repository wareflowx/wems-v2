import { Edit, Trash2 } from "lucide-react";
import { memo, useMemo } from "react";
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
import type { Agency } from "@/hooks/use-agencies";
import { AgencyCodeBadge } from "./AgencyCodeBadge";
import { AgencyStatusBadge } from "./AgencyStatusBadge";

interface AgencyTableProps {
  agencies: Agency[];
  onEdit: (agency: Agency) => void;
  onDelete: (agency: Agency) => void;
}

export const AgencyTable = memo(function AgencyTable({
  agencies,
  onEdit,
  onDelete,
}: AgencyTableProps) {
  const { t } = useTranslation();

  const labels = useMemo(
    () => ({
      active: t("agencies.active"),
      inactive: t("agencies.inactive"),
    }),
    [t]
  );

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">{t("agencies.code")}</TableHead>
            <TableHead className="px-4">{t("agencies.name")}</TableHead>
            <TableHead className="px-4">{t("agencies.status")}</TableHead>
            <TableHead className="px-4">{t("agencies.createdAt")}</TableHead>
            <TableHead className="px-4">{t("agencies.updatedAt")}</TableHead>
            <TableHead className="px-4 text-right">
              {t("agencies.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => (
            <TableRow className="hover:bg-muted/50" key={agency.id}>
              <TableCell className="px-4">
                <AgencyCodeBadge code={agency.code} />
              </TableCell>
              <TableCell className="max-w-[300px] truncate px-4 font-medium">
                {agency.name}
              </TableCell>
              <TableCell className="px-4">
                <AgencyStatusBadge isActive={agency.isActive} labels={labels} />
              </TableCell>
              <TableCell className="px-4">
                <span className="text-muted-foreground text-xs underline">
                  {agency.createdAt
                    ? new Date(agency.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </TableCell>
              <TableCell className="px-4">
                <span className="text-muted-foreground text-xs underline">
                  {agency.updatedAt
                    ? new Date(agency.updatedAt).toLocaleDateString()
                    : "-"}
                </span>
              </TableCell>
              <TableCell className="px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => onEdit(agency)}
                    size="icon"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(agency)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
