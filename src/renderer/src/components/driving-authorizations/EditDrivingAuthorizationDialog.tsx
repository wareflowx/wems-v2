import { useState, useEffect } from "react";
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

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

interface EditDrivingAuthorizationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEdit?: (data: {
    id: number;
    licenseCategory: string;
    dateObtained: string;
    expirationDate: string;
  }) => void;
  employees?: Employee[];
  authorization?: {
    id: number;
    employeeId: number;
    licenseCategory: string;
    dateObtained: string;
    expirationDate: string;
  } | null;
}

const LICENSE_CATEGORIES = ["B", "C", "D", "BE", "CE", "DE", "C1", "C1E", "D1", "D1E"];

export function EditDrivingAuthorizationDialog({
  open,
  onOpenChange,
  onEdit,
  employees = [],
  authorization,
}: EditDrivingAuthorizationDialogProps) {
  const { t } = useTranslation();
  const [licenseCategory, setLicenseCategory] = useState<string>("");
  const [dateObtained, setDateObtained] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");

  useEffect(() => {
    if (authorization) {
      setLicenseCategory(authorization.licenseCategory);
      setDateObtained(authorization.dateObtained);
      setExpirationDate(authorization.expirationDate);
    }
  }, [authorization]);

  const handleSubmit = () => {
    if (!authorization) return;
    onEdit?.({
      id: authorization.id,
      licenseCategory,
      dateObtained,
      expirationDate,
    });
  };

  const isFormValid = licenseCategory && dateObtained && expirationDate;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setLicenseCategory("");
      setDateObtained("");
      setExpirationDate("");
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("drivingAuthorizations.edit")}</DialogTitle>
          <DialogDescription>
            {t("drivingAuthorizations.editDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">{t("drivingAuthorizations.category")}</Label>
            <Select value={licenseCategory} onValueChange={setLicenseCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("drivingAuthorizations.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateObtained">{t("drivingAuthorizations.dateObtained")}</Label>
            <Input
              id="dateObtained"
              type="date"
              value={dateObtained}
              onChange={(e) => setDateObtained(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expirationDate">{t("drivingAuthorizations.expirationDate")}</Label>
            <Input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
