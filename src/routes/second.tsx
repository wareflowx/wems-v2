import { createFileRoute } from "@tanstack/react-router";
import { SecondPage } from "@/pages/second-page";

export const Route = createFileRoute("/second")({
  component: SecondPage,
});
