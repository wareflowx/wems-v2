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

interface AddDocumentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employee: string;
    type: string;
    name: string;
    document: string;
  }) => void;
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  onAdd,
}: AddDocumentDialogProps) {
  const { t } = useTranslation();
  const [employee, setEmployee] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [document, setDocument] = useState<string>("");

  const handleSubmit = () => {
    onAdd?.({ employee, type, name, document });
  };

  const isFormValid = employee && type && name && document;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee("");
      setType("");
      setName("");
      setDocument("");
    }
    onOpenChange(open);
  };

  const employees = [
    { id: 1, name: "Jean Dupont" },
    { id: 2, name: "Marie Martin" },
    { id: 3, name: "Pierre Bernard" },
    { id: 4, name: "Sophie Petit" },
    { id: 5, name: "Luc Dubois" },
  ];

  const documentTypes = [
    "Contrat",
    "CACES",
    "Visite médicale",
    "Identification",
  ];

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
            <Select onValueChange={setEmployee} value={employee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t("documents.selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.name}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="type">
              {t("documents.type")}
            </Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger id="type">
                <SelectValue placeholder={t("documents.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType} value={docType}>
                    {docType}
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
