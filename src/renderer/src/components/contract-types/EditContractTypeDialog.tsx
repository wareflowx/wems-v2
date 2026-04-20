import { generateCode } from "@@/lib/utils";
import { useState } from "react";
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
import { useUpdateContractType } from "@/hooks/use-positions-worklocations";

import { DEFAULT_COLOR } from "@/lib/colors";
import { ColorPicker } from "@/components/ui/color-picker";

export interface EditContractTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType: any;
}

export function EditContractTypeDialog({
  open,
  onOpenChange,
  contractType,
}: EditContractTypeDialogProps) {
  const { t } = useTranslation();
  const updateContractType = useUpdateContractType();
  const [name, setName] = useState(contractType?.name || "");
  const [selectedColor, setSelectedColor] = useState(
    contractType?.color || DEFAULT_COLOR
  );
  const [isActive, setIsActive] = useState(contractType?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    updateContractType.mutate(
      {
        id: contractType.id,
        name: name.trim(),
        code: generateCode(name),
        color: selectedColor,
        isActive,
      },
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
          <DialogTitle>{t("contractTypes.editContractType")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ct-name">{t("contractTypes.name")}</Label>
              <Input
                id="edit-ct-name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
            </div>
            <div className="flex items-center gap-2">
              <input
                checked={isActive}
                id="edit-ct-isActive"
                onChange={(e) => setIsActive(e.target.checked)}
                type="checkbox"
              />
              <Label htmlFor="edit-ct-isActive">
                {t("contractTypes.active")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <Button disabled={!name.trim()} type="submit">
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
