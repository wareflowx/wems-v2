import { Save } from "lucide-react";
import { useEffect, useState } from "react";
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

interface EditItemDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: (value: string) => void;
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
}

export function EditItemDialog({
  open,
  onOpenChange,
  onUpdate,
  title = "Modifier",
  description,
  label,
  placeholder,
  initialValue,
}: EditItemDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  const handleUpdate = () => {
    if (value.trim()) {
      onUpdate?.(value.trim());
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-item">{label}</Label>
            <Input
              className="w-full"
              id="edit-item"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              placeholder={placeholder}
              value={value}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="outline"
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            disabled={!value.trim()}
            onClick={handleUpdate}
            type="button"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
