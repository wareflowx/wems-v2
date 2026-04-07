import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export type UpdateStatus = "checking" | "up-to-date" | "error" | null;

export function useUpdateStatus() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null);

  useEffect(() => {
    // Access the electron API exposed through preload
    const electron = (
      window as Window & {
        electron?: {
          onUpdateStatusChanged?: (callback: (status: string) => void) => void;
        };
      }
    ).electron;

    if (!electron?.onUpdateStatusChanged) {
      console.warn(
        "[UpdateStatus] electron.onUpdateStatusChanged not available"
      );
      return;
    }

    const handleUpdateStatus = (status: string) => {
      setUpdateStatus(status as UpdateStatus);

      // Clear status after 3 seconds
      if (status === "up-to-date" || status === "error") {
        setTimeout(() => {
          setUpdateStatus(null);
        }, 3000);
      }
    };

    electron.onUpdateStatusChanged(handleUpdateStatus);
  }, []);

  return updateStatus;
}

export function UpdateStatusDialog() {
  const { t } = useTranslation();
  const updateStatus = useUpdateStatus();

  if (!updateStatus) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
        {updateStatus === "checking" && (
          <>
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-medium text-lg">
              {t("app.updating", "Checking for updates...")}
            </p>
          </>
        )}
        {updateStatus === "up-to-date" && (
          <>
            <div className="text-4xl">✓</div>
            <p className="font-medium text-lg">
              {t("app.upToDate", "You're up to date!")}
            </p>
          </>
        )}
        {updateStatus === "error" && (
          <>
            <div className="text-4xl">⚠</div>
            <p className="font-medium text-lg">
              {t("app.updateError", "Update check failed")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
