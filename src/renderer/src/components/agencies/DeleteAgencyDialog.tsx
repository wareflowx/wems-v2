"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteAgency } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

export function DeleteAgencyDialog() {
  const { t } = useTranslation();
  const deleteAgency = useDeleteAgency();
  const { dialogData, closeDialog } = useDialogStore((state) => ({
    dialogData: state.dialogData,
    closeDialog: state.closeDialog,
  }));

  const agency = dialogData as { id: number; name: string } | null;
  const isDeleting = deleteAgency.isPending;

  const handleConfirm = () => {
    if (agency?.id) {
      deleteAgency.mutate(agency.id, { onSuccess: () => closeDialog() });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  if (!agency) return null;

  return (
    <Dialog onOpenChange={handleClose} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("agencies.deleteAgency")}</DialogTitle>
          <DialogDescription>
            {t("agencies.deleteAgencyMessage", {
              name: agency.name,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => closeDialog()} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button
            disabled={isDeleting}
            onClick={handleConfirm}
            variant="destructive"
          >
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
