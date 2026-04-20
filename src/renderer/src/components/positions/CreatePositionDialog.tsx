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
import { useCreatePosition } from "@/hooks/use-positions-worklocations";

import { DEFAULT_COLOR } from "@/lib/colors";
import { ColorPicker } from "@/components/ui/color-picker";

export interface CreatePositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePositionDialog({
  open,
  onOpenChange,
}: CreatePositionDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const createPosition = useCreatePosition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    createPosition.mutate(
      {
        code: generateCode(name),
        name: name.trim(),
        color: selectedColor,
      },
      {
        onSuccess: () => {
          setName("");
          setSelectedColor(DEFAULT_COLOR);
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error creating position:", error);
        },
      }
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sidebar.addPosition")}</DialogTitle>
          <DialogDescription>
            {t("settings.createPositionDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="position-name">
                  {t("settings.positionName")}
                </Label>
                <span className="text-muted-foreground text-xs">
                  {name.length}/30
                </span>
              </div>
              <Input
                id="position-name"
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.positionNamePlaceholder")}
                value={name}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.color")}</Label>
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
