import { createFileRoute } from "@tanstack/react-router";
import { DepartmentsPage } from "@/pages/departments-page";

export const Route = createFileRoute("/departments")({
  component: DepartmentsPage,
});
