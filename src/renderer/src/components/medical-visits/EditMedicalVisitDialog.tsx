"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useUpdateMedicalVisit } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";

export function EditMedicalVisitDialog() {
  const { t } = useTranslation();
  const updateMedicalVisit = useUpdateMedicalVisit();

  // Use individual selectors to avoid creating new objects on every getSnapshot call
  const dialogData = useDialogStore((state) => state.dialogData);
  const closeDialog = useDialogStore((state) => state.closeDialog);
  const isOpen = useDialogStore(
    (state) => state.activeDialog === "edit-medical-visit"
  );

  interface EditVisitData {
    id: number;
    employee: string;
    employeeId: number;
    type: string;
    scheduledDate: string;
    status: string;
    actualDate?: string | null;
    fitnessStatus?: string | null;
  }

  const visit = dialogData as EditVisitData | undefined;

  const [type, setType] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [actualDate, setActualDate] = useState("");
  const [fitnessStatus, setFitnessStatus] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (visit) {
      setType(visit.type || "");
      setScheduledDate(visit.scheduledDate || "");
      setActualDate(visit.actualDate || "");
      setFitnessStatus(visit.fitnessStatus || "");
      setStatus(visit.status || "");
    }
  }, [visit]);

  const visitTypes = [
    { value: "periodique", label: t("medicalVisits.periodicVisit") },
    { value: "reprise", label: t("medicalVisits.returnVisit") },
    { value: "initiale", label: t("medicalVisits.initialVisit") },
    { value: "embauche", label: t("medicalVisits.hiringVisit") },
  ];

  const visitStatuses = [
    { value: "scheduled", label: t("medicalVisits.scheduled") },
    { value: "completed", label: t("medicalVisits.completed") },
    { value: "cancelled", label: t("medicalVisits.cancelled") },
  ];

  const fitnessStatuses = [
    { value: "Apt", label: "Apt" },
    { value: "Apt partiel", label: "Apt partiel" },
    { value: "Inapte", label: "Inapte" },
  ];

  const handleSubmit = useCallback(() => {
    if (!visit) return;

    updateMedicalVisit.mutate(
      {
        id: visit.id,
        type: type as "periodique" | "reprise" | "initiale" | "embauche",
        scheduledDate,
        actualDate: actualDate || null,
        fitnessStatus:
          fitnessStatus as "Apt" | "Apt partiel" | "Inapte" | null,
        status: status as "scheduled" | "completed" | "overdue" | "cancelled",
      },
      { onSuccess: () => closeDialog() }
    );
  }, [
    updateMedicalVisit,
    visit,
    type,
    scheduledDate,
    actualDate,
    fitnessStatus,
    status,
    closeDialog,
  ]);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog]
  );

  if (!(isOpen && visit)) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("medicalVisits.editVisit")}</DialogTitle>
          <DialogDescription>
            {t("medicalVisits.editVisitDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              {t("medicalVisits.employee")}
            </Label>
            <Input disabled value={visit.employee} />
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="edit-type">
              {t("medicalVisits.type")}
            </Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger id="edit-type">
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
            <Label className="font-medium text-sm" htmlFor="edit-scheduled-date">
              {t("medicalVisits.scheduledDate")}
            </Label>
            <Input
              className="w-full"
              id="edit-scheduled-date"
              onChange={(e) => setScheduledDate(e.target.value)}
              type="date"
              value={scheduledDate}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-sm" htmlFor="edit-status">
              {t("medicalVisits.status")}
            </Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger id="edit-status">
                <SelectValue placeholder={t("medicalVisits.status")} />
              </SelectTrigger>
              <SelectContent>
                {visitStatuses.map((visitStatus) => (
                  <SelectItem
                    key={visitStatus.value}
                    value={visitStatus.value}
                  >
                    {visitStatus.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "completed" && (
            <>
              <div className="space-y-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="edit-actual-date"
                >
                  {t("medicalVisits.actualDate")}
                </Label>
                <Input
                  className="w-full"
                  id="edit-actual-date"
                  onChange={(e) => setActualDate(e.target.value)}
                  type="date"
                  value={actualDate}
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="edit-fitness-status"
                >
                  {t("medicalVisits.fitnessStatus")}
                </Label>
                <Select onValueChange={setFitnessStatus} value={fitnessStatus}>
                  <SelectTrigger id="edit-fitness-status">
                    <SelectValue
                      placeholder={t("medicalVisits.selectFitnessStatus")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {fitnessStatuses.map((fitStatus) => (
                      <SelectItem key={fitStatus.value} value={fitStatus.value}>
                        {fitStatus.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={() => closeDialog()} variant="outline">
            {t("common.cancel")}
          </Button>
          <Button disabled={!type || !scheduledDate} onClick={handleSubmit}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
