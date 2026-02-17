import { createFileRoute } from "@tanstack/react-router";
import { AlertsPage } from "@/pages/alerts-page";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});
