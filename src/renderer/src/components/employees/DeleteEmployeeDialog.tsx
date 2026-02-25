import { AlertTriangle } from "lucide-react";
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

interface DeleteEmployeeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  employeeName?: string;
  employeeId?: number;
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  employeeId,
}: DeleteEmployeeDialogProps) {
  const { t } = useTranslation();
  const [confirmationName, setConfirmationName] = useState("");

  const handleDelete = () => {
    // TODO: Implement backend logic
    console.log(`Deleting employee: ${employeeId} - ${employeeName}`);
    onConfirm?.();
    onOpenChange?.(false);
    setConfirmationName("");
  };

  const isConfirmed = confirmationName === employeeName;

  // Reset confirmation when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationName("");
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>{t("employees.deleteEmployee")}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pl-[60px]">
            {t("employees.deleteEmployeeWarning")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="confirmationName">
              {t("employees.typeToDelete")}
            </Label>
            <Input
              className="w-full"
              id="confirmationName"
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={employeeName}
              value={confirmationName}
            />
            <p className="text-muted-foreground text-xs">
              {t("employees.typeToDeleteDescription")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={!isConfirmed}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
