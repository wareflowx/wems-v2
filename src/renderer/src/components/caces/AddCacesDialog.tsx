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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CacesFileUpload, type FileData } from "./CacesFileUpload";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

interface AddCacesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employeeId: number;
    category: string;
    dateObtained: string;
    expirationDate: string;
    document: FileData | null;
  }) => void;
  employees?: Employee[];
}

export function AddCacesDialog({
  open,
  onOpenChange,
  onAdd,
  employees = [],
}: AddCacesDialogProps) {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [document, setDocument] = useState<FileData | null>(null);

  const handleSubmit = () => {
    onAdd?.({
      employeeId: parseInt(employeeId, 10),
      category,
      dateObtained: issueDate,
      expirationDate: expiryDate,
      document,
    });
    // Close dialog after submit
    onOpenChange?.(false);
  };

  const handleDocumentChange = (file: FileData | null) => {
    setDocument(file);
  };

  const isFormValid = employeeId && category && issueDate && expiryDate;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployeeId("");
      setCategory("");
      setIssueDate("");
      setExpiryDate("");
      setDocument(null);
    }
    onOpenChange?.(open);
  };

  const categories = ["1A", "1B", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("caces.addCaces")}</DialogTitle>
          <DialogDescription>
            {t("caces.addCacesDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="employee">
              {t("caces.employee")}
            </Label>
            <Select onValueChange={setEmployeeId} value={employeeId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t("caces.selectEmployee")} />
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
            <Label className="font-medium text-sm" htmlFor="category">
              {t("caces.category")}
            </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger id="category">
                <SelectValue placeholder={t("caces.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    CACES {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-medium text-sm" htmlFor="issueDate">
                {t("caces.issueDate")}
              </Label>
              <Input
                className="w-full"
                id="issueDate"
                onChange={(e) => setIssueDate(e.target.value)}
                type="date"
                value={issueDate}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm" htmlFor="expiryDate">
                {t("caces.expiryDate")}
              </Label>
              <Input
                className="w-full"
                id="expiryDate"
                onChange={(e) => setExpiryDate(e.target.value)}
                type="date"
                value={expiryDate}
              />
            </div>
          </div>

          <CacesFileUpload
            label={t("caces.document")}
            onChange={handleDocumentChange}
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
            {t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
