import { createFileRoute } from "@tanstack/react-router";
import { MedicalVisitsPage } from "@/pages/medical-visits-page";

export const Route = createFileRoute("/medical-visits")({
  component: MedicalVisitsPage,
});
