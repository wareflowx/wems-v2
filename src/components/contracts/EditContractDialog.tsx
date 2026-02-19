import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

const CONTRACT_TYPES = ["CDI", "CDD", "Intérim", "Alternance"];

interface Contract {
  id: number;
  employeeId: number;
  contractType: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface EditContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: {
    id: number;
    contractType: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  }) => void;
  contract: Contract | null;
}

export function EditContractDialog({
  open,
  onOpenChange,
  onUpdate,
  contract,
}: EditContractDialogProps) {
  const { t } = useTranslation();
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (contract) {
      setContractType(contract.contractType);
      setStartDate(contract.startDate);
      setEndDate(contract.endDate || "");
      setIsActive(contract.isActive);
    }
  }, [contract]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractType || !startDate || !contract) return;

    onUpdate({
      id: contract.id,
      contractType,
      startDate,
      endDate: endDate || null,
      isActive,
    });
  };

  const isFormValid = contractType && startDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contracts.editContract")}</DialogTitle>
          <DialogDescription>
            {t("contracts.editContractDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contract-type">{t("contracts.type")}</Label>
              <Select value={contractType} onValueChange={setContractType}>
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
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">{t("contracts.endDate")}</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("contracts.endDateHint")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>{t("contracts.status")}</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                    className="accent-green-600"
                  />
                  <span className="text-sm">{t("contracts.active")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                    className="accent-gray-600"
                  />
                  <span className="text-sm">{t("contracts.inactive")}</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
