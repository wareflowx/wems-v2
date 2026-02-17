import {
  Save,
  Settings as SettingsIcon,
  Sparkles,
  User,
  Globe,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { PageHeaderCard } from "@/components/ui/page-header-card";
import { DetailBadge } from "@/components/ui/badge";

export function SettingsSystemPage() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      <div className="min-h-full space-y-3">
        {/* Header */}
        <PageHeaderCard
          icon={<Sparkles className="h-4 w-4 text-gray-600" />}
          title={t("settingsSystem.title")}
          description="Configurez les paramètres généraux de l'application"
        />

        <div className="flex gap-2 flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("settingsSystem.general")}</CardTitle>
                  <DetailBadge color="blue">Entreprise</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settingsSystem.companyName")}</Label>
                  <Input placeholder="WEMS" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settingsSystem.language")}</Label>
                  <select
                    className="w-full p-2 border rounded bg-card"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settingsSystem.dateFormat")}</Label>
                  <select className="w-full p-2 border rounded bg-card">
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informations système</CardTitle>
                  <DetailBadge color="gray">Info</DetailBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Version</span>
                    </div>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Environnement</span>
                    </div>
                    <span className="font-medium">Production</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Base de données</span>
                    </div>
                    <span className="font-medium">SQLite</span>
                  </div>
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
