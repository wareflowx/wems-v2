import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

export function useSettings() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => db.getSettings(),
    enabled: orpcReady,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      autoBackup?: boolean;
      cacesAlerts?: boolean;
      cacesDays?: number;
      medicalAlerts?: boolean;
      medicalDays?: number;
      contractAlerts?: boolean;
      theme?: "light" | "dark" | "system";
      language?: "fr" | "en";
      readOnlyMode?: boolean;
    }) => db.updateSettings(data),

    onError: (err) => {
      console.error("Error updating settings:", err);
      toast({
        title: "Failed to update settings",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
    },
  });
}
