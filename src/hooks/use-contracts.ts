import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/utils/toast";

// Contracts
export function useContracts() {
  return useQuery({
    queryKey: queryKeys.contracts.lists(),
    queryFn: () => db.getContracts(),
  });
}

export function useContractsByEmployee(employeeId: number) {
  return useQuery({
    queryKey: queryKeys.contracts.byEmployee(employeeId),
    queryFn: () => db.getContractsByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useActiveContractByEmployee(employeeId: number) {
  return useQuery({
    queryKey: queryKeys.contracts.activeByEmployee(employeeId),
    queryFn: () => db.getActiveContractByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      employeeId: number;
      contractType: string;
      startDate: string;
      endDate?: string | null;
      isActive?: boolean;
    }) => db.createContract(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() });
      toast({
        title: "Contract created",
        description: "The contract has been created successfully",
      });
    },

    onError: (err) => {
      toast({
        title: "Failed to create contract",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      id: number;
      contractType: string;
      startDate: string;
      endDate?: string | null;
      isActive: boolean;
    }) => db.updateContract(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() });
      toast({
        title: "Contract updated",
        description: "The contract has been updated successfully",
      });
    },

    onError: (err) => {
      toast({
        title: "Failed to update contract",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteContract(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() });

      const previousContracts = queryClient.getQueryData(queryKeys.contracts.lists());

      queryClient.setQueryData(
        queryKeys.contracts.lists(),
        (old: db.Contract[] = []) => old.filter((c) => c.id !== id)
      );

      return { previousContracts };
    },

    onError: (err, variables, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData(queryKeys.contracts.lists(), context.previousContracts);
      }
      toast({
        title: "Failed to delete contract",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() });
      toast({
        title: "Contract deleted",
        description: "The contract has been deleted successfully",
      });
    },
  });
}
