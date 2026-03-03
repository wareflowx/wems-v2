import { useTranslation } from "react-i18next";
import { Edit, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedEmpty } from "@/components/ui/animated-empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ContractType {
  id: number;
  name: string;
  code: string;
  color: string;
  isActive: boolean;
}

export interface ContractTypesTableProps {
  contractTypes: ContractType[];
  onEdit: (contractType: ContractType) => void;
  onDelete: (contractType: ContractType) => void;
  onAdd?: () => void;
}

export function ContractTypesTable({
  contractTypes,
  onEdit,
  onDelete,
  onAdd,
}: ContractTypesTableProps) {
  const { t } = useTranslation();

  const getColorName = (color: string) => {
    return color.replace("bg-", "").replace("-500", "").toUpperCase();
  };

  return (
    <>
      {contractTypes.length === 0 ? (
        <div className="flex w-full items-center justify-center">
          <AnimatedEmpty
            title={t("contractTypes.noContractTypes", "No contract types yet")}
            description={t(
              "contractTypes.noContractTypesDescription",
              "Create your first contract type to get started"
            )}
            icons={[FileText, FileText, FileText]}
            action={onAdd ? {
              label: t("contractTypes.addContractType", "Add Contract Type"),
              onClick: onAdd,
            } : undefined}
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">
                  {t("contractTypes.code")}
                </TableHead>
                <TableHead className="px-4">
                  {t("contractTypes.name")}
                </TableHead>
                <TableHead className="px-4">Color</TableHead>
                <TableHead className="px-4">
                  {t("contractTypes.status")}
                </TableHead>
                <TableHead className="px-4 text-right">
                  {t("contractTypes.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractTypes.map((contractType) => (
                <TableRow
                  className="hover:bg-muted/50"
                  key={contractType.id}
                >
              <TableCell className="px-4">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
                  {contractType.code}
                </span>
              </TableCell>
              <TableCell className="max-w-[300px] truncate px-4 font-medium">
                {contractType.name}
              </TableCell>
              <TableCell className="px-4">
                <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-xs">
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${contractType.color}`} />
                  {getColorName(contractType.color)}
                </span>
              </TableCell>
              <TableCell className="px-4">
                {contractType.isActive ? (
                  <span className="inline-flex items-center rounded-md border border-green-500/25 bg-green-500/15 px-2 py-0.5 font-medium text-green-600 text-xs">
                    {t("contractTypes.active")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-gray-500/25 bg-gray-500/15 px-2 py-0.5 font-medium text-gray-600 text-xs">
                    {t("contractTypes.inactive")}
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => onEdit(contractType)}
                    size="icon"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(contractType)}
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
      )}
    </>
  );
}
