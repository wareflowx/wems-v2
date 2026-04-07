"use client";

import { useCallback } from "react";
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
import { useDeleteAgency } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

export function DeleteAgencyDialog() {
  const { t } = useTranslation();
  const deleteAgency = useDeleteAgency();

  // Use individual selectors to avoid creating new objects on every getSnapshot call
  const dialogData = useDialogStore((state) => state.dialogData);
  const closeDialog = useDialogStore((state) => state.closeDialog);
  const isOpen = useDialogStore(
    (state) => state.activeDialog === "delete-agency"
  );

  const agency = dialogData as { id: number; name: string } | null;
  const isDeleting = deleteAgency.isPending;

  const handleConfirm = useCallback(() => {
    if (agency?.id) {
      deleteAgency.mutate(agency.id, { onSuccess: () => closeDialog() });
    }
  }, [deleteAgency, agency, closeDialog]);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog]
  );

  if (!(isOpen && agency)) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
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
