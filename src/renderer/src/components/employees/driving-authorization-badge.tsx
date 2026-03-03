import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DrivingAuthorizationStatusResult } from "@/core/lib/driving-authorization";

interface DrivingAuthorizationBadgeProps {
  status: DrivingAuthorizationStatusResult | null;
  isLoading?: boolean;
}

export function DrivingAuthorizationBadge({
  status,
  isLoading,
}: DrivingAuthorizationBadgeProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
        ...
      </span>
    );
  }

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-medium text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        -
      </span>
    );
  }

  const { authorized, partial, details } = status;

  const statusConfig = authorized
    ? {
        icon: CheckCircle2,
        label: t("employees.authorizedToDrive"),
        color: "bg-green-500/15 border border-green-500/25 text-green-600",
        iconColor: "text-green-600",
      }
    : partial
    ? {
        icon: AlertTriangle,
        label: t("employees.partialAuthorization"),
        color: "bg-yellow-500/15 border border-yellow-500/25 text-yellow-600",
        iconColor: "text-yellow-600",
      }
    : {
        icon: XCircle,
        label: t("employees.notAuthorizedToDrive"),
        color: "bg-red-500/15 border border-red-500/25 text-red-600",
        iconColor: "text-red-600",
      };

  const StatusIcon = statusConfig.icon;

  const tooltipContent = (
    <div className="space-y-2 text-xs">
      <div className="font-semibold">{statusConfig.label}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {details.medicalVisit.valid ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>
            {t("employees.medicalVisit")}:{" "}
            {details.medicalVisit.valid
              ? details.medicalVisit.expiresAt
                ? `${t("employees.validUntil")} ${details.medicalVisit.expiresAt}`
                : t("employees.valid")
              : t("employees.missingOrExpired")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {details.caces.valid ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>
            {t("employees.caces")}:{" "}
            {details.caces.valid
              ? `${details.caces.category} (${t("employees.expires")} ${details.caces.expiresAt})`
              : t("employees.missingOrExpired")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {details.drivingAuthorization.valid ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>
            {t("employees.drivingAuthorization")}:{" "}
            {details.drivingAuthorization.valid
              ? `${details.drivingAuthorization.licenseCategory} (${t("employees.expires")} ${details.drivingAuthorization.expiresAt})`
              : t("employees.missingOrExpired")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {details.training.valid ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span>
            {t("employees.training")}:{" "}
            {details.training.valid
              ? `${details.training.name} (${t("employees.completed")} ${details.training.completedAt})`
              : t("employees.missingOrExpired")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium text-xs ${statusConfig.color}`}
          >
            <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.iconColor}`} />
            {authorized
              ? t("employees.authorized")
              : partial
              ? t("employees.partial")
              : t("employees.notAuthorized")}
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
