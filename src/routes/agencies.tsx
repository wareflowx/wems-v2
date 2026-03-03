import { createFileRoute } from "@tanstack/react-router";
import { AgenciesPage } from "@/pages/agencies-page";

export const Route = createFileRoute("/agencies")({
  component: AgenciesPage,
});
