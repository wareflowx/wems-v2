import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@@/lib/query-keys";
import * as db from "@/actions/database";
import { useORPCReady } from "@/hooks";
import { useToast } from "@/utils/toast";

// Driving Authorizations
export function useDrivingAuthorizations() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.drivingAuthorizations.lists(),
    queryFn: () => db.getDrivingAuthorizations(),
    enabled: orpcReady,
  });
}

export function useDrivingAuthorizationsByEmployee(employeeId: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.drivingAuthorizations.byEmployee(employeeId),
    queryFn: () => db.getDrivingAuthorizationsByEmployee(employeeId),
    enabled: orpcReady && !!employeeId,
  });
}

export function useCreateDrivingAuthorization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      employeeId: number;
      licenseCategory: string;
      dateObtained: string;
      expirationDate: string;
      attachmentId?: string;
    }) => db.createDrivingAuthorization(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivingAuthorizations.lists(),
      });
      toast({ title: "Driving authorization created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to create driving authorization",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDrivingAuthorization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      id: number;
      licenseCategory?: string;
      dateObtained?: string;
      expirationDate?: string;
      attachmentId?: string | null;
    }) => db.updateDrivingAuthorization(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivingAuthorizations.lists(),
      });
      toast({ title: "Driving authorization updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update driving authorization",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDrivingAuthorization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteDrivingAuthorization(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.drivingAuthorizations.lists(),
      });

      const previousAuthorizations = queryClient.getQueryData(
        queryKeys.drivingAuthorizations.lists()
      );

      queryClient.setQueryData(
        queryKeys.drivingAuthorizations.lists(),
        (old: db.DrivingAuthorization[] = []) =>
          old.filter((a) => a.id !== id)
      );

      return { previousAuthorizations };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousAuthorizations) {
        queryClient.setQueryData(
          queryKeys.drivingAuthorizations.lists(),
          context.previousAuthorizations
        );
      }
      toast({
        title: "Failed to delete driving authorization",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivingAuthorizations.lists(),
      });
      toast({ title: "Driving authorization deleted successfully" });
    },
  });
}
