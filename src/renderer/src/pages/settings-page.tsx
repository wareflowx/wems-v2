import { useState } from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

type TabValue = "backup" | "alerts" | "system";

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValue>("backup");

  return (
    <div className="flex flex-1 flex-col gap-4 ">
      <div className="min-h-full space-y-3">
        <div className="flex h-13 items-center border-b px-4">
          <span className="text-sm font-medium">Settings</span>

          <div className="ml-6 flex gap-1">
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "backup"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("backup")}
            >
              Backup
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "alerts"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("alerts")}
            >
              Alerts
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === "system"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("system")}
            >
              System
            </button>
          </div>
        </div>

        {activeTab === "backup" && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Backup settings coming soon...
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Alerts settings coming soon...
          </div>
        )}

        {activeTab === "system" && (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            System settings coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
