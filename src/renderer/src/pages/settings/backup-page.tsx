import {
  Clock,
  Download,
  HardDrive,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DetailBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeaderCard } from "@/components/ui/page-header-card";

export function SettingsBackupPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          description="Sauvegardez et restaurez vos données et documents"
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("settingsBackup.title")}
        />

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsBackup.manualBackup")}</CardTitle>
                  <DetailBadge color="blue">Manuel</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {t("settingsBackup.manualBackupDesc")}
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    {t("settingsBackup.createBackup")}
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    {t("settingsBackup.download")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsBackup.restoration")}</CardTitle>
                  <DetailBadge color="orange">Restauration</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {t("settingsBackup.restorationDesc")}
                </p>
                <Button className="w-full gap-2" variant="outline">
                  <Upload className="h-4 w-4" />
                  {t("settingsBackup.selectBackupFile")}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsBackup.latestBackups")}</CardTitle>
                  <DetailBadge color="purple">Historique</DetailBadge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          backup_2025_02_04_103000.zip
                        </p>
                        <p className="text-muted-foreground text-sm">
                          125 MB • {t("settingsBackup.today")} à 10:30
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          backup_2025_02_03_150000.zip
                        </p>
                        <p className="text-muted-foreground text-sm">
                          124 MB • {t("settingsBackup.yesterday")} à 15:00
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("settingsBackup.automaticBackup")}</CardTitle>
                <DetailBadge color="green">Automatique</DetailBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div>
                    <p className="font-medium">
                      {t("settingsBackup.enableAutomaticBackup")}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsBackup.enableAutomaticBackupDesc")}
                    </p>
                  </div>
                  <input className="h-5 w-5" defaultChecked type="checkbox" />
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm">
                      {t("settingsBackup.backupTime")}:
                    </label>
                  </div>
                  <Input className="w-32" defaultValue="02:00" type="time" />
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsBackup.lastAutomaticBackup")}:
                    </p>
                    <p className="font-medium">
                      {t("settingsBackup.today")} à 02:00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
