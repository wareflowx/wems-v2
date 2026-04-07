import { createRootRoute } from "@tanstack/react-router";
import { AppError } from "@/components/app-error";
import { RootPage } from "@/pages/root-page";

export const Route = createRootRoute({
  component: RootPage,
  errorComponent: AppError,
});
