import { createFileRoute } from "@tanstack/react-router";
import { ContractTypesPage } from "@/pages/contract-types-page";

export const Route = createFileRoute("/contract-types")({
  component: ContractTypesPage,
});
