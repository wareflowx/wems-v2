import { Plus } from "lucide-react";
import { useState } from "react";
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

interface AddItemDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (value: string) => void;
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
}

export function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
  title = "Ajouter",
  description,
  label,
  placeholder,
}: AddItemDialogProps) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (value.trim()) {
      onAdd?.(value.trim());
      setValue("");
      onOpenChange?.(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setValue("");
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-item">{label}</Label>
            <Input
              className="w-full"
              id="new-item"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={placeholder}
              value={value}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            disabled={!value.trim()}
            onClick={handleAdd}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
