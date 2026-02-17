import { createFileRoute } from "@tanstack/react-router";
import { SettingsReferencePage } from "@/pages/settings/reference-page";

export const Route = createFileRoute("/settings/reference-data")({
  component: SettingsReferencePage,
});
