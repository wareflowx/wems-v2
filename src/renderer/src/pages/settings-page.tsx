import { useState } from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings } from "@/hooks";
import { useToast } from "@/utils/toast";

type TabValue = "backup" | "alerts" | "system";

export function SettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("backup");

  // Backend settings
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  // Default values if settings not loaded
  const autoBackup = settings?.autoBackup ?? false;
  const cacesAlerts = settings?.cacesAlerts ?? true;
  const cacesDays = settings?.cacesDays ?? 30;
  const medicalAlerts = settings?.medicalAlerts ?? true;
  const medicalDays = settings?.medicalDays ?? 7;
  const contractAlerts = settings?.contractAlerts ?? false;
  const theme = settings?.theme ?? "system";
  const language = settings?.language ?? "fr";
  const readOnlyMode = settings?.readOnlyMode ?? false;

  const handleSettingChange = (
    key: string,
    value: boolean | number | string
  ) => {
    updateSettings.mutate({ [key]: value }, {
      onError: () => {
        toast({
          title: "Failed to save",
          description: "Could not save settings. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

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
                  <CardDescription>A backup will be created automatically when you log in</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
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
                  <Switch
                    checked={cacesAlerts}
                    onCheckedChange={(checked) => handleSettingChange("cacesAlerts", checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
              {cacesAlerts && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="cacesDays">{t("settingsAlerts.daysBeforeExpiry")}</Label>
                    <Input
                      id="cacesDays"
                      type="number"
                      className="w-24"
                      value={cacesDays}
                      onChange={(e) => handleSettingChange("cacesDays", parseInt(e.target.value) || 30)}
                    />
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
                  <Switch
                    checked={medicalAlerts}
                    onCheckedChange={(checked) => handleSettingChange("medicalAlerts", checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
              {medicalAlerts && (
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="medicalDays">{t("settingsAlerts.daysBeforeVisit")}</Label>
                    <Input
                      id="medicalDays"
                      type="number"
                      className="w-24"
                      value={medicalDays}
                      onChange={(e) => handleSettingChange("medicalDays", parseInt(e.target.value) || 7)}
                    />
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
                  <Switch
                    checked={contractAlerts}
                    onCheckedChange={(checked) => handleSettingChange("contractAlerts", checked)}
                    disabled={isLoading}
                  />
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

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <Select
                    value={theme}
                    onValueChange={(value: "light" | "dark" | "system") => handleSettingChange("theme", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select application language
                    </p>
                  </div>
                  <Select
                    value={language}
                    onValueChange={(value: "fr" | "en") => handleSettingChange("language", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Network */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Read-only mode</CardTitle>
                  <CardDescription>Disable all database write operations</CardDescription>
                </div>
                <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                  <Switch
                    checked={readOnlyMode}
                    onCheckedChange={(checked) => handleSettingChange("readOnlyMode", checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardHeader>
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
