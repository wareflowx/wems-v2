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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contract {
  id: number;
  employeeId: number;
  contractType: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

interface ContractType {
  id: number;
  name: string;
  code: string;
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
  contractTypes: ContractType[];
}

export function EditContractDialog({
  open,
  onOpenChange,
  onUpdate,
  contract,
  contractTypes,
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
    if (!(contractType && startDate && contract)) {
      return;
    }

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
    <Dialog onOpenChange={onOpenChange} open={open}>
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
              <Select onValueChange={setContractType} value={contractType}>
                <SelectTrigger id="contract-type">
                  <SelectValue placeholder={t("contracts.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
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
            <div className="grid gap-2">
              <Label>{t("contracts.status")}</Label>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    checked={isActive === true}
                    className="accent-green-600"
                    name="isActive"
                    onChange={() => setIsActive(true)}
                    type="radio"
                  />
                  <span className="text-sm">{t("contracts.active")}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    checked={isActive === false}
                    className="accent-gray-600"
                    name="isActive"
                    onChange={() => setIsActive(false)}
                    type="radio"
                  />
                  <span className="text-sm">{t("contracts.inactive")}</span>
                </label>
              </div>
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
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
