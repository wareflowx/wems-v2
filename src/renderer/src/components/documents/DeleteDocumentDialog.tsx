import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
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

interface Document {
  id: string;
  name: string;
  type: string;
  employee: string;
  employeeId: number;
  uploadDate: string;
  size: string;
  category: string;
}

interface DeleteDocumentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  document?: Document;
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  onConfirm,
  document,
}: DeleteDocumentDialogProps) {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState<string>("");

  // Reset confirmation text when dialog opens/closes
  useEffect(() => {
    if (open) {
      setConfirmationText("");
    }
  }, [open]);

  const handleSubmit = () => {
    // TODO: Implement backend logic
    console.log("Deleting document:", { id: document?.id });
    onConfirm?.();
    onOpenChange?.(false);
  };

  const isFormValid = document && confirmationText === document.name;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t("documents.deleteDocument")}
          </DialogTitle>
          <DialogDescription>
            {t("documents.deleteDocumentWarning")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">
                  {t("documents.typeToDelete")}
                </p>
                <p className="mt-1 text-red-700 text-sm">
                  {t("documents.typeToDeleteDescription")}
                </p>
              </div>
            </div>
          </div>

          {document && (
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">
                {t("documents.documentToDelete")}:
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium">{document.name}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {document.type} • {document.employee} • {document.size}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="confirmation">
              {t("documents.confirmDeletion")}
            </Label>
            <Input
              className="w-full"
              id="confirmation"
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={document?.name || ""}
              value={confirmationText}
            />
            <p className="text-muted-foreground text-xs">
              {t("documents.typeDocumentName")}{" "}
              <strong>{document?.name}</strong> {t("documents.toConfirm")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="flex-1"
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="outline"
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="flex-1"
            disabled={!isFormValid}
            onClick={handleSubmit}
            type="button"
            variant="destructive"
          >
            {t("documents.deleteDocument")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
