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

interface EditOnlineTrainingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEdit?: (data: {
    id: number;
    trainingName: string;
    trainingProvider: string;
    completionDate: string;
    expirationDate?: string | null;
    status: "in_progress" | "completed" | "expired";
  }) => void;
  training?: {
    id: number;
    employeeId: number;
    trainingName: string;
    trainingProvider: string;
    completionDate: string;
    expirationDate?: string;
    status: "in_progress" | "completed" | "expired";
  } | null;
}

export function EditOnlineTrainingDialog({
  open,
  onOpenChange,
  onEdit,
  training,
}: EditOnlineTrainingDialogProps) {
  const { t } = useTranslation();
  const [trainingName, setTrainingName] = useState<string>("");
  const [trainingProvider, setTrainingProvider] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [hasExpiration, setHasExpiration] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("completed");

  useEffect(() => {
    if (training) {
      setTrainingName(training.trainingName);
      setTrainingProvider(training.trainingProvider);
      setCompletionDate(training.completionDate);
      setExpirationDate(training.expirationDate || "");
      setHasExpiration(!!training.expirationDate);
      setStatus(training.status);
    }
  }, [training]);

  const handleSubmit = () => {
    if (!training) return;
    onEdit?.({
      id: training.id,
      trainingName,
      trainingProvider,
      completionDate,
      expirationDate: hasExpiration ? expirationDate : null,
      status: status as "in_progress" | "completed" | "expired",
    });
  };

  const isFormValid = trainingName && trainingProvider && completionDate && (!hasExpiration || expirationDate);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTrainingName("");
      setTrainingProvider("");
      setCompletionDate("");
      setExpirationDate("");
      setHasExpiration(false);
      setStatus("completed");
    }
    onOpenChange?.(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("onlineTrainings.edit")}</DialogTitle>
          <DialogDescription>
            {t("onlineTrainings.editDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="trainingName">{t("onlineTrainings.trainingName")}</Label>
            <Input
              id="trainingName"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trainingProvider">{t("onlineTrainings.provider")}</Label>
            <Input
              id="trainingProvider"
              value={trainingProvider}
              onChange={(e) => setTrainingProvider(e.target.value)}
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
