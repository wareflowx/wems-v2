import { queryKeys } from "@@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { type AlertFilters, alertsApi } from "@/api/alerts";

// Hook for fetching alerts list
export function useAlerts(filters?: AlertFilters) {
  return useQuery({
    queryKey: queryKeys.alerts.list(JSON.stringify(filters)),
    queryFn: () => alertsApi.getAll(filters),
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
