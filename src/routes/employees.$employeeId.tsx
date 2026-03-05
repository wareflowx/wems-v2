import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDetailPage } from "@/pages/employee-detail-page";

export const Route = createFileRoute("/employees/$employeeId")({
  component: EmployeeDetailPage,
});
