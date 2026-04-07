"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAgency } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

export function EditAgencyDialog() {
  const { t } = useTranslation();
  const updateAgency = useUpdateAgency();

  // Use individual selectors to avoid creating new objects on every getSnapshot call
  const dialogData = useDialogStore((state) => state.dialogData);
  const closeDialog = useDialogStore((state) => state.closeDialog);
  const isOpen = useDialogStore(
    (state) => state.activeDialog === "edit-agency"
  );

  const agency = dialogData as {
    id: number;
    name: string;
    code?: string | null;
    isActive: boolean;
  };

  const [name, setName] = useState(agency?.name || "");
  const [code, setCode] = useState(agency?.code || "");
  const [isActive, setIsActive] = useState(agency?.isActive ?? true);

  useEffect(() => {
    if (agency) {
      setName(agency.name);
      setCode(agency.code || "");
      setIsActive(agency.isActive);
    }
  }, [agency]);

  const handleSubmit = useCallback(() => {
    updateAgency.mutate(
      { id: agency.id, name, code: code || undefined, isActive },
      { onSuccess: () => closeDialog() }
    );
  }, [updateAgency, agency, name, code, isActive, closeDialog]);

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
          <DialogTitle>{t("agencies.editAgency")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">{t("agencies.name")}</Label>
            <Input
              id="edit-name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-code">{t("agencies.code")}</Label>
            <Input
              id="edit-code"
              onChange={(e) => setCode(e.target.value)}
              value={code}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              checked={isActive}
              id="edit-isActive"
              onChange={(e) => setIsActive(e.target.checked)}
              type="checkbox"
            />
            <Label htmlFor="edit-isActive">{t("agencies.active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => closeDialog()} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button disabled={!name} onClick={handleSubmit}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
