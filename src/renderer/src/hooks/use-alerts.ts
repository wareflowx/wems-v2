import { queryKeys } from "@@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { type AlertFilters, alertsApi } from "@/api/alerts";
import { useORPCReady } from "./use-orpc-ready";

// Hook for fetching alerts list
export function useAlerts(filters?: AlertFilters) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.alerts.list(JSON.stringify(filters)),
    queryFn: () => alertsApi.getAll(filters),
    enabled: orpcReady,
  });
}

// Hook for fetching single alert
export function useAlert(id: number) {
  return useQuery({
    queryKey: queryKeys.alerts.detail(id),
    queryFn: () => alertsApi.getById(id),
    enabled: !!id,
  });
}
