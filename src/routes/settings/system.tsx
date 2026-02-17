import { createFileRoute } from "@tanstack/react-router";
import { SettingsSystemPage } from "@/pages/settings/system-page";

export const Route = createFileRoute("/settings/system")({
  component: SettingsSystemPage,
});
