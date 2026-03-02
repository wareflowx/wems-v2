import { createFileRoute } from "@tanstack/react-router";
import { DrivingAuthorizationsPage } from "@/pages/driving-authorizations-page";

export const Route = createFileRoute("/driving-authorizations")({
  component: DrivingAuthorizationsPage,
});
