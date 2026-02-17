import { createFileRoute } from "@tanstack/react-router";
import { HomePage, iframeHeight, description } from "@/pages/home-page";

export { iframeHeight, description };

export const Route = createFileRoute("/")({
  component: HomePage,
});
