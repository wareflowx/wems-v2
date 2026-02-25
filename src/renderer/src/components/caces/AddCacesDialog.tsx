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
import { CacesFileUpload } from "./CacesFileUpload";

interface AddCacesDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employee: string;
    category: string;
    issueDate: string;
    expiryDate: string;
    document: string;
  }) => void;
}

export function AddCacesDialog({
  open,
  onOpenChange,
  onAdd,
}: AddCacesDialogProps) {
  const { t } = useTranslation();
  const [employee, setEmployee] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [document, setDocument] = useState<string>("");

  const handleSubmit = () => {
    onAdd?.({ employee, category, issueDate, expiryDate, document });
  };

  const isFormValid = employee && category && issueDate && expiryDate;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee("");
      setCategory("");
      setIssueDate("");
      setExpiryDate("");
      setDocument("");
    }
    onOpenChange?.(open);
  };

  const employees = [
    { id: 1, name: "Jean Dupont" },
    { id: 2, name: "Marie Martin" },
    { id: 3, name: "Pierre Bernard" },
    { id: 4, name: "Sophie Petit" },
    { id: 5, name: "Luc Dubois" },
  ];

  const categories = ["1A", "1B", "3", "5", "7"];

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
            <Select onValueChange={setEmployee} value={employee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder={t("caces.selectEmployee")} />
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
            {t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
