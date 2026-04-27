import { Download, Loader2, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "update-available"
  | "downloading"
  | "ready"
  | "installing"
  | "up-to-date"
  | "error";

interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface UpdateState {
  status: UpdateStatus;
  progress?: UpdateProgress;
  version?: string;
  error?: string;
}

interface UpdateSidebarBannerProps {
  onDismiss?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function useUpdateStatus() {
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);

  useEffect(() => {
    const electron = (window as Window & {
      electron?: {
        onUpdateStatusChanged?: (
          callback: (data: {
            status: string;
            version?: string;
            error?: string;
            progress?: UpdateProgress;
          }) => void
        ) => void;
      };
    }).electron;

    if (!electron?.onUpdateStatusChanged) {
      console.warn(
        "[UpdateStatus] electron.onUpdateStatusChanged not available"
      );
      return;
    }

    const unsubscribe = electron.onUpdateStatusChanged((data) => {
      setUpdateState(data as UpdateState);
    });

    return () => unsubscribe();
  }, []);

  return updateState;
}

export function UpdateSidebarBanner({ onDismiss }: UpdateSidebarBannerProps) {
  const { t } = useTranslation();
  const updateState = useUpdateStatus();

  const handleCheck = useCallback(async () => {
    const electron = (window as Window & {
      electron?: {
        sys?: {
          checkForUpdates?: () => Promise<void>;
        };
      };
    }).electron;
    await electron?.sys?.checkForUpdates?.();
  }, []);

  const handleDownload = useCallback(async () => {
    const electron = (window as Window & {
      electron?: {
        sys?: {
          downloadUpdate?: () => Promise<void>;
        };
      };
    }).electron;
    await electron?.sys?.downloadUpdate?.();
  }, []);

  const handleInstall = useCallback(() => {
    const electron = (window as Window & {
      electron?: {
        sys?: {
          installUpdate?: () => void;
        };
      };
    }).electron;
    electron?.sys?.installUpdate?.();
  }, []);

  // Don't show for idle, checking, up-to-date, installing
  if (
    !updateState ||
    updateState.status === "idle" ||
    updateState.status === "checking" ||
    updateState.status === "up-to-date" ||
    updateState.status === "installing"
  ) {
    return null;
  }

  const handleAction = () => {
    if (updateState.status === "update-available") {
      handleDownload();
    } else if (updateState.status === "ready") {
      handleInstall();
    } else if (updateState.status === "error") {
      handleCheck();
    }
  };

  const getActionLabel = () => {
    if (updateState.status === "update-available") {
      return t("update.download", "Download");
    }
    if (updateState.status === "ready") {
      return t("update.install", "Install");
    }
    return t("update.retry", "Retry");
  };

  return (
    <div className="mx-2 mb-2 rounded-lg border border-primary/50 bg-primary/10 p-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          {updateState.status === "update-available" && (
            <RefreshCw className="size-4 text-primary" />
          )}
          {updateState.status === "downloading" && (
            <Loader2 className="size-4 animate-spin text-primary" />
          )}
          {updateState.status === "ready" && (
            <Download className="size-4 text-primary" />
          )}
          {updateState.status === "error" && (
            <span className="text-sm">⚠</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {updateState.status === "update-available" &&
              t("update.available", "Update available")}
            {updateState.status === "downloading" &&
              t("update.downloading", "Downloading...")}
            {updateState.status === "ready" &&
              t("update.ready", "Ready to install")}
            {updateState.status === "error" &&
              t("update.error", "Update error")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {updateState.version
              ? `v${updateState.version}`
              : updateState.status === "downloading" && updateState.progress
                ? `${updateState.progress.percent.toFixed(0)}%`
                : updateState.status === "error"
                  ? updateState.error
                  : ""}
          </p>

          {/* Progress bar for downloading */}
          {updateState.status === "downloading" && updateState.progress && (
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${updateState.progress.percent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-2 flex gap-2">
        {(updateState.status === "update-available" ||
          updateState.status === "ready" ||
          updateState.status === "error") && (
          <Button
            className="flex-1"
            size="sm"
            variant="default"
            onClick={handleAction}
          >
            {getActionLabel()}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="size-8 p-0"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}