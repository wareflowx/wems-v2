import { createFileRoute } from "@tanstack/react-router";
import { SettingsBackupPage } from "@/pages/settings/backup-page";

export const Route = createFileRoute("/settings/backup")({
  component: SettingsBackupPage,
});
