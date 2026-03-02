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

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

interface AddDrivingAuthorizationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employeeId: number;
    licenseCategory: string;
    dateObtained: string;
    expirationDate: string;
  }) => void;
  employees?: Employee[];
}

const LICENSE_CATEGORIES = ["B", "C", "D", "BE", "CE", "DE", "C1", "C1E", "D1", "D1E"];

export function AddDrivingAuthorizationDialog({
  open,
  onOpenChange,
  onAdd,
  employees = [],
}: AddDrivingAuthorizationDialogProps) {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [licenseCategory, setLicenseCategory] = useState<string>("");
  const [dateObtained, setDateObtained] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");

  const handleSubmit = () => {
    onAdd?.({
      employeeId: parseInt(employeeId, 10),
      licenseCategory,
      dateObtained,
      expirationDate,
    });
  };

  const isFormValid = employeeId && licenseCategory && dateObtained && expirationDate;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployeeId("");
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
          <DialogTitle>{t("drivingAuthorizations.add")}</DialogTitle>
          <DialogDescription>
            {t("drivingAuthorizations.addDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="employee">{t("drivingAuthorizations.employee")}</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={t("drivingAuthorizations.selectEmployee")} />
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
            {t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
