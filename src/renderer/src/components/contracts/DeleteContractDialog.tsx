import { useTranslation } from "react-i18next";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface Contract {
  id: number;
  employee: string;
  type: string;
  startDate: string;
}

interface DeleteContractDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contract?: Contract | null;
  onConfirm?: () => void;
}

export function DeleteContractDialog({
  open,
  onOpenChange,
  contract,
  onConfirm,
}: DeleteContractDialogProps) {
  const { t } = useTranslation();

  return (
    <DeleteConfirmDialog
      description={`Êtes-vous sûr de vouloir supprimer le contrat ${contract?.type} de ${contract?.employee} (${contract?.startDate}) ? Cette action est irréversible.`}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("contracts.deleteContract") || "Supprimer le contrat"}
    />
  );
}
