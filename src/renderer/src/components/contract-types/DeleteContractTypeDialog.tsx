import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteContractType } from "@/hooks/use-positions-worklocations";

export interface DeleteContractTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType: any;
}

export function DeleteContractTypeDialog({
  open,
  onOpenChange,
  contractType,
}: DeleteContractTypeDialogProps) {
  const { t } = useTranslation();
  const deleteContractType = useDeleteContractType();
  const isDeleting = deleteContractType.isPending;

  const handleConfirm = () => {
    deleteContractType.mutate(
      { id: contractType.id },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contractTypes.deleteContractType")}</DialogTitle>
          <DialogDescription>
            {t("contractTypes.deleteContractTypeMessage", {
              name: contractType?.name,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button
            disabled={isDeleting}
            onClick={handleConfirm}
            variant="destructive"
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
