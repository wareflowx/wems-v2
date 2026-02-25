import { Plus } from "lucide-react";
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

interface AddMedicalVisitDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employee: string;
    type: string;
    scheduledDate: string;
  }) => void;
}

export function AddMedicalVisitDialog({
  open,
  onOpenChange,
  onAdd,
}: AddMedicalVisitDialogProps) {
  const { t } = useTranslation();
  const [employee, setEmployee] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const handleSubmit = () => {
    onAdd?.({ employee, type, scheduledDate });
  };

  const isFormValid = employee && type && scheduledDate;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployee("");
      setType("");
      setScheduledDate("");
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

  const visitTypes = [
    { value: "Visite périodique", label: t("medicalVisits.periodicVisit") },
    { value: "Visite de reprise", label: t("medicalVisits.returnVisit") },
    { value: "Visite initiale", label: t("medicalVisits.initialVisit") },
  ];

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("medicalVisits.newVisit")}</DialogTitle>
          <DialogDescription>
            {t("medicalVisits.addVisitDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="employee">
              {t("medicalVisits.employee")}
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
              {t("medicalVisits.type")}
            </Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger id="type">
                <SelectValue placeholder={t("medicalVisits.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {visitTypes.map((visitType) => (
                  <SelectItem key={visitType.value} value={visitType.value}>
                    {visitType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="scheduledDate">
              {t("medicalVisits.scheduledDate")}
            </Label>
            <Input
              className="w-full"
              id="scheduledDate"
              onChange={(e) => setScheduledDate(e.target.value)}
              type="date"
              value={scheduledDate}
            />
          </div>
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
            <Plus className="mr-2 h-4 w-4" />
            {t("medicalVisits.newVisit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
