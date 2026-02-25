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

export interface CreatePositionDialogProps {
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

export function CreatePositionDialog({
  open,
  onOpenChange,
}: CreatePositionDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const createPosition = useCreatePosition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    console.log("Submitting position:", {
      code: generateCode(name),
      name: name.trim(),
      color: selectedColor,
    });

    createPosition.mutate(
      {
        code: generateCode(name),
        name: name.trim(),
        color: selectedColor,
      },
      {
        onSuccess: () => {
          console.log("Position created successfully");
          setName("");
          setSelectedColor(COLORS[0].value);
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
