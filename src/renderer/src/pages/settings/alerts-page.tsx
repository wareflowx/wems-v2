import { Save, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DetailBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { Switch } from "@/components/ui/switch";

export function SettingsAlertsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          description={t("settingsAlerts.description")}
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("settingsAlerts.title")}
        />

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsAlerts.cacesExpiryAlerts")}</CardTitle>
                  <DetailBadge color="purple">Certification</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label htmlFor="caces-critical">
                      {t("settingsAlerts.criticalAlert")}
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsAlerts.daysBeforeExpiryLabel")}
                    </p>
                  </div>
                  <Input
                    className="w-20"
                    defaultValue={30}
                    id="caces-critical"
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label htmlFor="caces-warning">
                      {t("settingsAlerts.warningAlert")}
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsAlerts.daysBeforeExpiryLabel")}
                    </p>
                  </div>
                  <Input
                    className="w-20"
                    defaultValue={90}
                    id="caces-warning"
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label htmlFor="caces-enabled">
                      {t("settingsAlerts.enableNotifications")}
                    </Label>
                  </div>
                  <Switch defaultChecked id="caces-enabled" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {t("settingsAlerts.medicalVisitAlerts")}
                  </CardTitle>
                  <DetailBadge color="green">Médical</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label htmlFor="visit-critical">
                      {t("settingsAlerts.criticalAlert")}
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsAlerts.daysBeforeVisit")}
                    </p>
                  </div>
                  <Input
                    className="w-20"
                    defaultValue={7}
                    id="visit-critical"
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label htmlFor="visit-warning">
                      {t("settingsAlerts.recallFrequency")}
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {t("settingsAlerts.recallFrequencyLabel")}
                    </p>
                  </div>
                  <Input
                    className="w-20"
                    defaultValue={24}
                    id="visit-warning"
                    type="number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
