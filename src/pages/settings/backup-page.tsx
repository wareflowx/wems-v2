import {
  Download,
  Upload,
  Save,
  CheckCircle2,
  Sparkles,
  HardDrive,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { DetailBadge } from "@/components/ui/badge";

export function SettingsBackupPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("settingsBackup.title")}
          description="Sauvegardez et restaurez vos données et documents"
        />

        <div className="flex gap-2 flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsBackup.manualBackup")}</CardTitle>
                  <DetailBadge color="blue">Manuel</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("settingsBackup.manualBackupDesc")}
                </p>
                <div className="flex gap-2">
                  <Button className="gap-2 flex-1">
                    <Save className="h-4 w-4" />
                    {t("settingsBackup.createBackup")}
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1">
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
                <p className="text-sm text-muted-foreground">
                  {t("settingsBackup.restorationDesc")}
                </p>
                <Button variant="outline" className="w-full gap-2">
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
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          backup_2025_02_04_103000.zip
                        </p>
                        <p className="text-sm text-muted-foreground">
                          125 MB • {t("settingsBackup.today")} à 10:30
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          backup_2025_02_03_150000.zip
                        </p>
                        <p className="text-sm text-muted-foreground">
                          124 MB • {t("settingsBackup.yesterday")} à 15:00
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div>
                    <p className="font-medium">
                      {t("settingsBackup.enableAutomaticBackup")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("settingsBackup.enableAutomaticBackupDesc")}
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm">
                      {t("settingsBackup.backupTime")}:
                    </label>
                  </div>
                  <Input type="time" defaultValue="02:00" className="w-32" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div>
                    <p className="text-sm text-muted-foreground">
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
