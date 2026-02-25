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

const CONTRACT_TYPES = ["CDI", "CDD", "Intérim", "Alternance"];

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    employeeId: number;
    contractType: string;
    startDate: string;
    endDate?: string | null;
  }) => void;
  employees: Employee[];
}

export function CreateContractDialog({
  open,
  onOpenChange,
  onCreate,
  employees,
}: CreateContractDialogProps) {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get selected employee name
  const selectedEmployee = employees.find((e) => e.id === Number(employeeId));
  const employeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(employeeId && contractType && startDate)) {
      return;
    }

    onCreate({
      employeeId: Number(employeeId),
      contractType,
      startDate,
      endDate: endDate || null,
    });

    // Reset form
    setEmployeeId("");
    setContractType("");
    setStartDate("");
    setEndDate("");
    onOpenChange(false);
  };

  const isFormValid = employeeId && contractType && startDate;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contracts.addContract")}</DialogTitle>
          <DialogDescription>
            {employeeName
              ? t("contracts.addContractDescription", { name: employeeName })
              : t("contracts.addContractDescription", { name: "" })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">{t("documents.employee")}</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="contract-type">{t("contracts.type")}</Label>
              <Select onValueChange={setContractType} value={contractType}>
                <SelectTrigger id="contract-type">
                  <SelectValue placeholder={t("contracts.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-date">{t("contracts.startDate")}</Label>
              <Input
                id="start-date"
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                value={startDate}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">{t("contracts.endDate")}</Label>
              <Input
                id="end-date"
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                value={endDate}
              />
              <p className="text-muted-foreground text-xs">
                {t("contracts.endDateHint")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("common.cancel")}
            </Button>
            <Button disabled={!isFormValid} type="submit">
              {t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
