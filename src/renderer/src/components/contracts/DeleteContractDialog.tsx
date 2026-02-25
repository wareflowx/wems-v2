import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useTranslation } from "react-i18next";

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
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t("contracts.deleteContract") || "Supprimer le contrat"}
      description={`Êtes-vous sûr de vouloir supprimer le contrat ${contract?.type} de ${contract?.employee} (${contract?.startDate}) ? Cette action est irréversible.`}
    />
  );
}
