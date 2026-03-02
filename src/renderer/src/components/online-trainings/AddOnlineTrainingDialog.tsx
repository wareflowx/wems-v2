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
import { CacesFileUpload, type FileData } from "@/components/caces/CacesFileUpload";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

interface AddOnlineTrainingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: {
    employeeId: number;
    trainingName: string;
    trainingProvider: string;
    completionDate: string;
    expirationDate?: string;
    status: "in_progress" | "completed" | "expired";
    document: FileData | null;
  }) => void;
  employees?: Employee[];
}

export function AddOnlineTrainingDialog({
  open,
  onOpenChange,
  onAdd,
  employees = [],
}: AddOnlineTrainingDialogProps) {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [trainingName, setTrainingName] = useState<string>("");
  const [trainingProvider, setTrainingProvider] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [hasExpiration, setHasExpiration] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("completed");
  const [document, setDocument] = useState<FileData | null>(null);

  const handleSubmit = () => {
    onAdd?.({
      employeeId: parseInt(employeeId, 10),
      trainingName,
      trainingProvider,
      completionDate,
      expirationDate: hasExpiration ? expirationDate : undefined,
      status: status as "in_progress" | "completed" | "expired",
      document,
    });
    // Close dialog after submit
    onOpenChange?.(false);
  };

  const isFormValid = employeeId && trainingName && completionDate && (!hasExpiration || expirationDate);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmployeeId("");
      setTrainingName("");
      setTrainingProvider("");
      setCompletionDate("");
      setExpirationDate("");
      setHasExpiration(false);
      setStatus("completed");
      setDocument(null);
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("onlineTrainings.add")}</DialogTitle>
          <DialogDescription>
            {t("onlineTrainings.addDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="employee">{t("onlineTrainings.employee")}</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder={t("onlineTrainings.selectEmployee")} />
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
            <Label htmlFor="trainingName">{t("onlineTrainings.trainingName")}</Label>
            <Input
              id="trainingName"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              placeholder={t("onlineTrainings.trainingNamePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trainingProvider">{t("onlineTrainings.provider")}</Label>
            <Input
              id="trainingProvider"
              value={trainingProvider}
              onChange={(e) => setTrainingProvider(e.target.value)}
              placeholder={t("onlineTrainings.providerPlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">{t("onlineTrainings.status")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">{t("onlineTrainings.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("onlineTrainings.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="completionDate">{t("onlineTrainings.completionDate")}</Label>
            <Input
              id="completionDate"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasExpiration"
              checked={hasExpiration}
              onChange={(e) => setHasExpiration(e.target.checked)}
            />
            <Label htmlFor="hasExpiration">{t("onlineTrainings.hasExpiration")}</Label>
          </div>
          {hasExpiration && (
            <div className="grid gap-2">
              <Label htmlFor="expirationDate">{t("onlineTrainings.expirationDate")}</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          )}
          <CacesFileUpload
            value={document}
            onChange={setDocument}
            label={t("onlineTrainings.document")}
          />
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
