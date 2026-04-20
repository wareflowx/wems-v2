import { generateCode } from "@@/lib/utils";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDepartment } from "@/hooks";

import { DEFAULT_COLOR } from "@/lib/colors";
import { ColorPicker } from "@/components/ui/color-picker";

interface CreateDepartmentDialogProps {
  open?: boolean;
  onClose?: () => void;
}

export function CreateDepartmentDialog({
  open,
  onClose,
}: CreateDepartmentDialogProps) {
  const { t } = useTranslation();
  const createDepartment = useCreateDepartment();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  const handleSubmit = () => {
    createDepartment.mutate(
      { name, code: generateCode(name), color: selectedColor, isActive: true },
      {
        onSuccess: () => {
          setName("");
          setSelectedColor(DEFAULT_COLOR);
          onClose?.();
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("departments.addDepartment")}</DialogTitle>
          <DialogDescription>
            {t("departments.addDepartmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("departments.name")}</Label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Production"
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <ColorPicker value={selectedColor} onChange={setSelectedColor} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button disabled={!name} onClick={handleSubmit}>
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
