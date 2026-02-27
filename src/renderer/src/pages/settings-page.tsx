import { useState } from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/tailwind";

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{t("settingsBackup.manualBackup")}</CardTitle>
                  <CardDescription>{t("settingsBackup.manualBackupDesc")}</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Button>{t("settingsBackup.createBackup")}</Button>
                </div>
              </CardHeader>
            </Card>

            {/* Restoration */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{t("settingsBackup.restoration")}</CardTitle>
                  <CardDescription>{t("settingsBackup.restorationDesc")}</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Button variant="outline">{t("settingsBackup.selectBackupFile")}</Button>
                </div>
              </CardHeader>
            </Card>

            {/* Automatic Backup */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{t("settingsBackup.automaticBackup")}</CardTitle>
                  <CardDescription>{t("settingsBackup.enableAutomaticBackupDesc")}</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>
              </CardHeader>
              {autoBackup && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="backupTime">{t("settingsBackup.backupTime")}</Label>
                    <Input
                      id="backupTime"
                      type="time"
                      className="w-32"
                      value={backupTime}
                      onChange={(e) => setBackupTime(e.target.value)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6 px-4">
            {/* CACES Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{t("settingsAlerts.cacesExpiryAlerts")}</CardTitle>
                  <CardDescription>{t("settingsAlerts.enableExpiryAlerts")}</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch checked={cacesAlerts} onCheckedChange={setCacesAlerts} />
                </div>
              </CardHeader>
              {cacesAlerts && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="cacesDays">{t("settingsAlerts.daysBeforeExpiry")}</Label>
                    <Input id="cacesDays" type="number" className="w-24" defaultValue="30" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Medical Visit Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{t("settingsAlerts.medicalVisitAlerts")}</CardTitle>
                  <CardDescription>{t("settingsAlerts.enableVisitAlerts")}</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch checked={medicalAlerts} onCheckedChange={setMedicalAlerts} />
                </div>
              </CardHeader>
              {medicalAlerts && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="medicalDays">{t("settingsAlerts.daysBeforeVisit")}</Label>
                    <Input id="medicalDays" type="number" className="w-24" defaultValue="7" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Contract Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Contract expiry alerts</CardTitle>
                  <CardDescription>Get notified when employee contracts are expiring</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch checked={contractAlerts} onCheckedChange={setContractAlerts} />
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="space-y-6 px-4">
            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle>Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            {/* Cache */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Clear cache</CardTitle>
                  <CardDescription>Clear cached data to free up space</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Button variant="outline">Clear cache</Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
