import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const COLORS = [
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Amber", value: "bg-amber-500", hex: "#f59e0b" },
  { name: "Violet", value: "bg-violet-500", hex: "#8b5cf6" },
  { name: "Emerald", value: "bg-emerald-500", hex: "#10b981" },
  { name: "Rose", value: "bg-rose-500", hex: "#f43f5e" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
];

export interface CreateWorkLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkLocationDialog({
  open,
  onOpenChange,
}: CreateWorkLocationDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Create work location in database
    console.log("Creating work location:", { name, color: selectedColor });
    setName("");
    setSelectedColor(COLORS[0].value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sidebar.addWorkLocation")}</DialogTitle>
          <DialogDescription>
            {t("settings.createWorkLocationDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location-name">{t("settings.locationName")}</Label>
              <Input
                id="location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.locationNamePlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.color")}</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-md ${color.value} ${
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-gray-900"
                        : ""
                    } transition-all hover:scale-110`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
