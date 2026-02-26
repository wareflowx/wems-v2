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

const COLORS = [
  { name: "Emerald", value: "bg-emerald-500", hex: "#10b981" },
  { name: "Amber", value: "bg-amber-500", hex: "#f59e0b" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Rose", value: "bg-rose-500", hex: "#f43f5e" },
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Violet", value: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
];

export interface EditContractTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType: any;
}

function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");
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
    contractType?.color || COLORS[0].value
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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    className={`h-8 w-8 rounded-md ${color.value} ${
                      selectedColor === color.value
                        ? "ring-2 ring-gray-900 ring-offset-2"
                        : ""
                    } transition-all hover:scale-110`}
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-ct-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="edit-ct-isActive">
                {t("contractTypes.active")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
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
