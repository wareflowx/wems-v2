import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Employee filters type
export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

// Hook for fetching employees list
// Note: Filtering is done in the component using useMemo for better performance
export function useEmployees() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.employees.lists(),
    queryFn: () => db.getEmployees(),
    enabled: orpcReady, // Wait for ORPC to be ready
  });
}

// Hook for fetching single employee
export function useEmployee(id: number) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => db.getEmployeeById(id),
    enabled: orpcReady && !!id, // Wait for ORPC and valid id
  });
}

// Hook for creating employee with optimistic update
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: Parameters<typeof db.createEmployee>[0]) =>
      db.createEmployee(input),

    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.employees.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.employees.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as db.Employee[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) => [
          ...old,
          {
            ...newEmployee,
            id: Date.now(),
            status: newEmployee.status || "active",
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
        title: "Failed to create employee",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
  });
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: Parameters<typeof db.updateEmployee>[0]) =>
      db.updateEmployee(input),

    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.employees.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.employees.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as db.Employee[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) =>
          old.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
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
        title: "Failed to update employee",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.details(),
      });
    },
  });
}

// Hook for deleting employee with optimistic update
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteEmployee(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.employees.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.employees.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as db.Employee[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) => old.filter((emp) => emp.id !== id)
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
        title: "Failed to delete employee",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
  });
}
