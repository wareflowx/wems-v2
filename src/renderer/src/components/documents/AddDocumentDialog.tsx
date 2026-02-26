import { Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CacesFileUpload } from "@/components/caces/CacesFileUpload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks";

interface AddDocumentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employeeId: number;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    filePath: string;
  }) => void;
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  onAdd,
}: AddDocumentDialogProps) {
  const { t } = useTranslation();
  const { data: employees = [] } = useEmployees();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [document, setDocument] = useState<string>("");

  const handleSubmit = () => {
    if (!employeeId || !name || !document) return;

    // Use the user-provided name, fallback to filename if not provided
    const finalName = name || document;

    // For now, use placeholder values for file metadata
    // In a real implementation, the file upload would provide these
    onAdd?.({
      employeeId: parseInt(employeeId),
      originalName: finalName,
      storedName: `${Date.now()}-${document}`,
      mimeType: "application/pdf",
      size: 0,
      filePath: `/files/documents/${document}`,
    });
  };

  const isFormValid = employeeId && name && document;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployeeId("");
      setName("");
      setDocument("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("documents.addDocument")}</DialogTitle>
          <DialogDescription>
            {t("documents.addDocumentDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="employee">
              {t("documents.employee")}
            </Label>
            <Select onValueChange={setEmployeeId} value={employeeId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t("documents.selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="name">
              {t("documents.documentName")}
            </Label>
            <Input
              className="w-full"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder={t("documents.documentNamePlaceholder")}
              value={name}
            />
          </div>

          <CacesFileUpload
            label={t("documents.document")}
            onChange={setDocument}
            value={document}
          />
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
            disabled={!isFormValid}
            onClick={handleSubmit}
            type="button"
          >
            <Upload className="mr-2 h-4 w-4" />
            {t("documents.addDocument")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
