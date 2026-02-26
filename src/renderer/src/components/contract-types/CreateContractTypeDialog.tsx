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

export interface CreateContractTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateCode(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");
}

export function CreateContractTypeDialog({
  open,
  onOpenChange,
}: CreateContractTypeDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
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
          setSelectedColor(COLORS[0].value);
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setSelectedColor(COLORS[0].value);
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CDI"
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
