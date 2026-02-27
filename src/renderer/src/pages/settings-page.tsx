import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeaderCard } from "@/components/ui/page-header-card";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-4 ">
      <div className="min-h-full space-y-3">
        <div className="flex h-13 items-center border-b px-4">
          <span className="text-sm font-medium">Settings tabs coming soon...</span>
        </div>
      </div>
    </div>
  );
}
