import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Agency type from database
export interface Agency {
  id: number;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Hook for fetching agencies list
export function useAgencies() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.agencies.lists(),
    queryFn: () => db.getAgencies(),
    enabled: orpcReady,
  });
}

// Hook for creating agency
export function useCreateAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: { name: string; code?: string; isActive?: boolean }) =>
      db.createAgency(data),

    onMutate: async (newAgency) => {
      // Check for duplicate name (case-insensitive)
      const agencies =
        queryClient.getQueryData<Agency[]>(queryKeys.agencies.lists()) ?? [];
      const duplicate = agencies.find(
        (a) => a.name.toLowerCase() === newAgency.name.toLowerCase()
      );
      if (duplicate) {
        throw new Error(
          t("agencies.duplicateName", "Une agence avec ce nom existe déjà")
        );
      }

      await queryClient.cancelQueries({
        queryKey: queryKeys.agencies.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.agencies.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Agency[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.agencies.lists() },
        (old: Agency[] = []) => [
          ...old,
          {
            ...newAgency,
            id: Date.now(),
            isActive: newAgency.isActive ?? true,
            code: newAgency.code ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ]
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: t("agencies.createError", "Échec de la création de l'agence"),
        description:
          err instanceof Error
            ? err.message
            : t("common.errorOccurred", "Une erreur est survenue"),
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies.lists() });
      toast({
        title: t("agencies.createSuccess", "Agence créée"),
        description: t(
          "agencies.createSuccessDesc",
          "L'agence a été créée avec succès"
        ),
      });
    },
  });
}

// Hook for updating agency
export function useUpdateAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: {
      id: number;
      name?: string;
      code?: string;
      isActive?: boolean;
    }) => db.updateAgency(data),

    onMutate: async ({ id, ...updates }) => {
      // Check for duplicate name if name is being changed (case-insensitive)
      if (updates.name) {
        const agencies =
          queryClient.getQueryData<Agency[]>(queryKeys.agencies.lists()) ?? [];
        const duplicate = agencies.find(
          (a) =>
            a.id !== id && a.name.toLowerCase() === updates.name!.toLowerCase()
        );
        if (duplicate) {
          throw new Error(
            t("agencies.duplicateName", "Une agence avec ce nom existe déjà")
          );
        }
      }

      await queryClient.cancelQueries({
        queryKey: queryKeys.agencies.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.agencies.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Agency[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.agencies.lists() },
        (old: Agency[] = []) =>
          old.map((agency) =>
            agency.id === id ? { ...agency, ...updates } : agency
          )
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: t("agencies.updateError", "Échec de la mise à jour de l'agence"),
        description:
          err instanceof Error
            ? err.message
            : t("common.errorOccurred", "Une erreur est survenue"),
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies.lists() });
      toast({
        title: t("agencies.updateSuccess", "Agence mise à jour"),
        description: t(
          "agencies.updateSuccessDesc",
          "L'agence a été mise à jour avec succès"
        ),
      });
    },
  });
}

// Hook for deleting agency (soft delete)
export function useDeleteAgency() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: number) => db.deleteAgency(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.agencies.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.agencies.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Agency[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.agencies.lists() },
        (old: Agency[] = []) => old.filter((agency) => agency.id !== id)
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: t("agencies.deleteError", "Échec de la suppression de l'agence"),
        description:
          err instanceof Error
            ? err.message
            : t("common.errorOccurred", "Une erreur est survenue"),
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agencies.lists() });
      toast({
        title: t("agencies.deleteSuccess", "Agence supprimée"),
        description: t(
          "agencies.deleteSuccessDesc",
          "L'agence a été supprimée avec succès"
        ),
      });
    },
  });
}
