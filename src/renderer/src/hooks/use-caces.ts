import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// CACES type from DB (without calculated fields)
interface CaceFromDB {
  id: number;
  employeeId: number;
  category: string;
  dateObtained: string;
  expirationDate: string;
  attachmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Extended type with calculated fields
export interface Cace extends CaceFromDB {
  daysLeft: number;
  status: "valid" | "warning" | "expired";
}

// Calculate daysLeft and status from expirationDate
function calculateCaceStatus(expirationDate: string): { daysLeft: number; status: "valid" | "warning" | "expired" } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(expirationDate);
  expiration.setHours(0, 0, 0, 0);

  const diffTime = expiration.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: "valid" | "warning" | "expired";
  if (daysLeft < 0) {
    status = "expired";
  } else if (daysLeft <= 30) {
    status = "warning";
  } else {
    status = "valid";
  }

  return { daysLeft, status };
}

// Add calculated fields to CACES data
function enrichCacesWithStatus(caces: CaceFromDB[]): Cace[] {
  return caces.map((cace) => ({
    ...cace,
    ...calculateCaceStatus(cace.expirationDate),
  }));
}

// Hook for fetching CACES certifications list
export function useCaces() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.caces.lists(),
    queryFn: async () => {
      const data = await db.getCaces();
      return enrichCacesWithStatus(data);
    },
    enabled: orpcReady,
  });
}

// Hook for fetching CACES by employee
export function useCacesByEmployee(employeeId: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.caces.byEmployee(employeeId),
    queryFn: async () => {
      const data = await db.getCacesByEmployee(employeeId);
      return enrichCacesWithStatus(data);
    },
    enabled: orpcReady && !!employeeId,
  });
}

// Hook for fetching single CACES certification
export function useCace(id: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.caces.detail(id),
    queryFn: async () => {
      const data = await db.getCaces();
      const cace = data.find((c) => c.id === id);
      if (!cace) return null;
      return enrichCacesWithStatus([cace])[0];
    },
    enabled: orpcReady && !!id,
  });
}

// Hook for creating CACES certification
export function useCreateCaces() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: {
      employeeId: number;
      category: string;
      dateObtained: string;
      expirationDate: string;
      attachmentId?: string;
    }) => db.createCace(input),

    onMutate: async (newCace) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.caces.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Cace[]);
        });

      const optimisticCace: Cace = {
        id: Date.now(),
        employeeId: newCace.employeeId,
        category: newCace.category,
        dateObtained: newCace.dateObtained,
        expirationDate: newCace.expirationDate,
        attachmentId: newCace.attachmentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        daysLeft: 0,
        status: "valid",
      };

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Cace[] = []) => [...old, optimisticCace]
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
        title: "Failed to create CACES certification",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}

// Hook for updating CACES certification
export function useUpdateCaces() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: {
      id: number;
      category?: string;
      dateObtained?: string;
      expirationDate?: string;
      attachmentId?: string | null;
    }) => db.updateCace(input),

    onMutate: async (updatedCace) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.caces.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Cace[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Cace[] = []) =>
          old.map((c) => {
            if (c.id !== updatedCace.id) return c;
            const updated = { ...c, ...updatedCace };
            // Recalculate status if expirationDate changed
            if (updatedCace.expirationDate) {
              const { daysLeft, status } = calculateCaceStatus(updated.expirationDate);
              return { ...updated, daysLeft, status };
            }
            return updated;
          })
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
        title: "Failed to update CACES certification",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.details() });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}

// Hook for deleting CACES certification
export function useDeleteCaces() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteCace(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.caces.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Cace[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Cace[] = []) => old.filter((c) => c.id !== id)
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
        title: "Failed to delete CACES certification",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() });
    },
  });
}
