"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateAgency } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";
import { generateCode } from "@@/lib/utils";

export function CreateAgencyDialog() {
  const { t } = useTranslation();
  const createAgency = useCreateAgency();
  const closeDialog = useDialogStore((state) => state.closeDialog);

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = () => {
    createAgency.mutate(
      { name, code: generateCode(name), isActive },
      { onSuccess: () => closeDialog() }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  return (
    <Dialog onOpenChange={handleClose} open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("agencies.addAgency")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("agencies.name")}</Label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder={t("agencies.namePlaceholder")}
              value={name}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              checked={isActive}
              id="isActive"
              onChange={(e) => setIsActive(e.target.checked)}
              type="checkbox"
            />
            <Label htmlFor="isActive">{t("agencies.active")}</Label>
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
