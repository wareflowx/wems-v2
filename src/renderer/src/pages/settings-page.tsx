import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-4 ">
      <div className="min-h-full space-y-3">
        <div className="flex h-13 items-center border-b px-4">
          <span className="text-sm font-medium">Settings</span>

          <Tabs className="ml-6" defaultValue="backup">
            <TabsList className="h-full justify-start gap-1 p-0">
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs defaultValue="backup">
          <TabsContent value="backup">
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Backup settings coming soon...
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              Alerts settings coming soon...
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              System settings coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
