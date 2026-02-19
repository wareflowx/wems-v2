import { createFileRoute } from "@tanstack/react-router";
import { WorkLocationsPage } from "@/pages/work-locations-page";

export const Route = createFileRoute("/work-locations")({
  component: WorkLocationsPage,
});
