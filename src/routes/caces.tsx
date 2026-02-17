import { createFileRoute } from "@tanstack/react-router";
import { CacesPage } from "@/pages/caces-page";

export const Route = createFileRoute("/caces")({
  component: CacesPage,
});
