import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CacesFileUpload,
  type FileData,
} from "@/components/caces/CacesFileUpload";
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
      employeeId: Number.parseInt(employeeId, 10),
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

  const isFormValid =
    employeeId &&
    trainingName &&
    completionDate &&
    (!hasExpiration || expirationDate);

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
    <Dialog onOpenChange={handleOpenChange} open={open}>
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
            <Select onValueChange={setEmployeeId} value={employeeId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("onlineTrainings.selectEmployee")}
                />
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
            <Label htmlFor="trainingName">
              {t("onlineTrainings.trainingName")}
            </Label>
            <Input
              id="trainingName"
              onChange={(e) => setTrainingName(e.target.value)}
              placeholder={t("onlineTrainings.trainingNamePlaceholder")}
              value={trainingName}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trainingProvider">
              {t("onlineTrainings.provider")}
            </Label>
            <Input
              id="trainingProvider"
              onChange={(e) => setTrainingProvider(e.target.value)}
              placeholder={t("onlineTrainings.providerPlaceholder")}
              value={trainingProvider}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">{t("onlineTrainings.status")}</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">
                  {t("onlineTrainings.inProgress")}
                </SelectItem>
                <SelectItem value="completed">
                  {t("onlineTrainings.completed")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="completionDate">
              {t("onlineTrainings.completionDate")}
            </Label>
            <Input
              id="completionDate"
              onChange={(e) => setCompletionDate(e.target.value)}
              type="date"
              value={completionDate}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              checked={hasExpiration}
              id="hasExpiration"
              onChange={(e) => setHasExpiration(e.target.checked)}
              type="checkbox"
            />
            <Label htmlFor="hasExpiration">
              {t("onlineTrainings.hasExpiration")}
            </Label>
          </div>
          {hasExpiration && (
            <div className="grid gap-2">
              <Label htmlFor="expirationDate">
                {t("onlineTrainings.expirationDate")}
              </Label>
              <Input
                id="expirationDate"
                onChange={(e) => setExpirationDate(e.target.value)}
                type="date"
                value={expirationDate}
              />
            </div>
          )}
          <CacesFileUpload
            label={t("onlineTrainings.document")}
            onChange={setDocument}
            value={document}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button disabled={!isFormValid} onClick={handleSubmit}>
            {t("common.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
