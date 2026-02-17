import { createFileRoute } from "@tanstack/react-router";
import { ContractsPage } from "@/pages/contracts-page";

export const Route = createFileRoute("/contracts")({
  component: ContractsPage,
});
