import { useState } from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type TabValue = "backup" | "alerts" | "system";

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValue>("backup");

  // Mock state for settings (no backend)
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupTime, setBackupTime] = useState("02:00");
  const [cacesAlerts, setCacesAlerts] = useState(true);
  const [medicalAlerts, setMedicalAlerts] = useState(true);
  const [contractAlerts, setContractAlerts] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 ">
      <div className="min-h-full space-y-4">
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

        {/* Backup Tab */}
        {activeTab === "backup" && (
          <div className="space-y-6 px-4">
            {/* Manual Backup */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("settingsBackup.manualBackup")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsBackup.manualBackupDesc")}
                  </p>
                </div>
                <Button>{t("settingsBackup.createBackup")}</Button>
              </div>
            </div>

            {/* Restoration */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("settingsBackup.restoration")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsBackup.restorationDesc")}
                  </p>
                </div>
                <Button variant="outline">{t("settingsBackup.selectBackupFile")}</Button>
              </div>
            </div>

            {/* Automatic Backup */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("settingsBackup.automaticBackup")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsBackup.enableAutomaticBackupDesc")}
                  </p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              {autoBackup && (
                <div className="mt-4 flex items-center gap-4">
                  <Label htmlFor="backupTime">{t("settingsBackup.backupTime")}</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    className="w-32"
                    value={backupTime}
                    onChange={(e) => setBackupTime(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6 px-4">
            {/* CACES Alerts */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("settingsAlerts.cacesExpiryAlerts")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsAlerts.enableExpiryAlerts")}
                  </p>
                </div>
                <Switch checked={cacesAlerts} onCheckedChange={setCacesAlerts} />
              </div>
              {cacesAlerts && (
                <div className="mt-4 flex items-center gap-4">
                  <Label htmlFor="cacesDays">{t("settingsAlerts.daysBeforeExpiry")}</Label>
                  <Input id="cacesDays" type="number" className="w-24" defaultValue="30" />
                </div>
              )}
            </div>

            {/* Medical Visit Alerts */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("settingsAlerts.medicalVisitAlerts")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsAlerts.enableVisitAlerts")}
                  </p>
                </div>
                <Switch checked={medicalAlerts} onCheckedChange={setMedicalAlerts} />
              </div>
              {medicalAlerts && (
                <div className="mt-4 flex items-center gap-4">
                  <Label htmlFor="medicalDays">{t("settingsAlerts.daysBeforeVisit")}</Label>
                  <Input id="medicalDays" type="number" className="w-24" defaultValue="7" />
                </div>
              )}
            </div>

            {/* Contract Alerts */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Contract expiry alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when employee contracts are expiring
                  </p>
                </div>
                <Switch checked={contractAlerts} onCheckedChange={setContractAlerts} />
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="space-y-6 px-4">
            {/* App Info */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-4">Application</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm">2.1.1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data directory</span>
                  <span className="text-sm font-mono">./data</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database size</span>
                  <span className="text-sm">--</span>
                </div>
              </div>
            </div>

            {/* Cache */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Clear cache</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear cached data to free up space
                  </p>
                </div>
                <Button variant="outline">Clear cache</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
