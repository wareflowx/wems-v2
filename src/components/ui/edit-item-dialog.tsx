import { useState, useEffect } from "react";
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

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (value: string) => void;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  initialValue: string;
}

export const EditItemDialog = ({
  open,
  onOpenChange,
  onUpdate,
  title,
  description,
  label,
  placeholder,
  initialValue,
}: EditItemDialogProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onUpdate(value.trim());
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setValue(initialValue);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-value">{label}</Label>
              <Input
                id="edit-item-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
