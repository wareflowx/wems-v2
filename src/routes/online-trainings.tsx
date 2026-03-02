import { createFileRoute } from "@tanstack/react-router";
import { OnlineTrainingsPage } from "@/pages/online-trainings-page";

export const Route = createFileRoute("/online-trainings")({
  component: OnlineTrainingsPage,
});
