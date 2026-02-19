import { createFileRoute } from "@tanstack/react-router";
import { PositionsPage } from "@/pages/positions-page";

export const Route = createFileRoute("/positions")({
  component: PositionsPage,
});
