import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeaderCard } from "@/components/ui/page-header-card";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          description="Configure application settings"
          icon={<Settings className="h-4 w-4 text-gray-600" />}
          title={t("settings.title")}
        />

        {/* Placeholder - Tabs will be added here */}
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Settings page with tabs coming soon...
        </div>
      </div>
    </div>
  );
}
