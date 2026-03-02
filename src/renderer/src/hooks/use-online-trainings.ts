import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@@/lib/query-keys";
import * as db from "@/actions/database";
import { useORPCReady } from "@/hooks";
import { useToast } from "@/utils/toast";

// Online Trainings
export function useOnlineTrainings() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.onlineTrainings.lists(),
    queryFn: () => db.getOnlineTrainings(),
    enabled: orpcReady,
  });
}

export function useOnlineTrainingsByEmployee(employeeId: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.onlineTrainings.byEmployee(employeeId),
    queryFn: () => db.getOnlineTrainingsByEmployee(employeeId),
    enabled: orpcReady && !!employeeId,
  });
}

export function useCreateOnlineTraining() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      employeeId: number;
      trainingName: string;
      trainingProvider: string;
      completionDate: string;
      expirationDate?: string;
      status?: "in_progress" | "completed" | "expired";
      attachmentId?: string;
    }) => db.createOnlineTraining(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onlineTrainings.lists(),
      });
      toast({ title: "Online training created successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to create online training",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOnlineTraining() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      id: number;
      trainingName?: string;
      trainingProvider?: string;
      completionDate?: string;
      expirationDate?: string | null;
      status?: "in_progress" | "completed" | "expired";
      attachmentId?: string | null;
    }) => db.updateOnlineTraining(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onlineTrainings.lists(),
      });
      toast({ title: "Online training updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update online training",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteOnlineTraining() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteOnlineTraining(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.onlineTrainings.lists(),
      });

      const previousTrainings = queryClient.getQueryData(
        queryKeys.onlineTrainings.lists()
      );

      queryClient.setQueryData(
        queryKeys.onlineTrainings.lists(),
        (old: db.OnlineTraining[] = []) =>
          old.filter((t) => t.id !== id)
      );

      return { previousTrainings };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTrainings) {
        queryClient.setQueryData(
          queryKeys.onlineTrainings.lists(),
          context.previousTrainings
        );
      }
      toast({
        title: "Failed to delete online training",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.onlineTrainings.lists(),
      });
      toast({ title: "Online training deleted successfully" });
    },
  });
}
