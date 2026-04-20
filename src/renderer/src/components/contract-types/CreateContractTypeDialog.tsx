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
import { useCreateContractType } from "@/hooks/use-positions-worklocations";

import { DEFAULT_COLOR } from "@/lib/colors";
import { ColorPicker } from "@/components/ui/color-picker";

export interface CreateContractTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateContractTypeDialog({
  open,
  onOpenChange,
}: CreateContractTypeDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const createContractType = useCreateContractType();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    createContractType.mutate(
      {
        code: generateCode(name),
        name: name.trim(),
        color: selectedColor,
        isActive: true,
      },
      {
        onSuccess: () => {
          setName("");
          setSelectedColor(DEFAULT_COLOR);
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setSelectedColor(DEFAULT_COLOR);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contractTypes.addContractType")}</DialogTitle>
          <DialogDescription>
            {t("contractTypes.addContractTypeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ct-name">{t("contractTypes.name")}</Label>
              <Input
                id="ct-name"
                onChange={(e) => setName(e.target.value)}
                placeholder="CDI"
                value={name}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <ColorPicker value={selectedColor} onChange={setSelectedColor} />
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
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
