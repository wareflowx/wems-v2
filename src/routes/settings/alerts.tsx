import { createFileRoute } from "@tanstack/react-router";
import { SettingsAlertsPage } from "@/pages/settings/alerts-page";

export const Route = createFileRoute("/settings/alerts")({
  component: SettingsAlertsPage,
});
