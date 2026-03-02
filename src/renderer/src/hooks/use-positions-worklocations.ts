import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Departments
export function useDepartments() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.departments.lists(),
    queryFn: () => db.getDepartments(),
    enabled: orpcReady,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { name: string; code: string; isActive?: boolean }) =>
      db.createDepartment(data),

    onMutate: async (newDepartment) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.departments.lists(),
      });

      const previousDepartments = queryClient.getQueryData(
        queryKeys.departments.lists()
      );

      queryClient.setQueryData(
        queryKeys.departments.lists(),
        (old: db.Department[] = []) => [
          ...old,
          {
            ...newDepartment,
            id: Date.now(),
            isActive: newDepartment.isActive ?? true,
          },
        ]
      );

      return { previousDepartments };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          queryKeys.departments.lists(),
          context.previousDepartments
        );
      }
      toast({
        title: "Failed to create department",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      name: string;
      code: string;
      isActive: boolean;
    }) => db.updateDepartment(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number }) => db.deleteDepartment(data.id),

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.departments.lists(),
      });

      const previousDepartments = queryClient.getQueryData(
        queryKeys.departments.lists()
      );

      queryClient.setQueryData(
        queryKeys.departments.lists(),
        (old: db.Department[] = []) => old.filter((d) => d.id !== data.id)
      );

      return { previousDepartments };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          queryKeys.departments.lists(),
          context.previousDepartments
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trash.deletedDepartments(),
      });
    },
  });
}

// Contract Types
export function useContractTypes() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.contractTypes.lists(),
    queryFn: () => db.getContractTypes(),
    enabled: orpcReady,
  });
}

export function useCreateContractType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { name: string; code: string; isActive?: boolean }) =>
      db.createContractType(data),

    onMutate: async (newContractType) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.contractTypes.lists(),
      });

      const previousContractTypes = queryClient.getQueryData(
        queryKeys.contractTypes.lists()
      );

      queryClient.setQueryData(
        queryKeys.contractTypes.lists(),
        (old: db.ContractType[] = []) => [
          ...old,
          {
            ...newContractType,
            id: Date.now(),
            isActive: newContractType.isActive ?? true,
          },
        ]
      );

      return { previousContractTypes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousContractTypes) {
        queryClient.setQueryData(
          queryKeys.contractTypes.lists(),
          context.previousContractTypes
        );
      }
      toast({
        title: "Failed to create contract type",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contractTypes.lists(),
      });
    },
  });
}

export function useUpdateContractType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      name: string;
      code: string;
      isActive: boolean;
    }) => db.updateContractType(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contractTypes.lists(),
      });
    },
  });
}

export function useDeleteContractType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number }) => db.deleteContractType(data.id),

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.contractTypes.lists(),
      });

      const previousContractTypes = queryClient.getQueryData(
        queryKeys.contractTypes.lists()
      );

      queryClient.setQueryData(
        queryKeys.contractTypes.lists(),
        (old: db.ContractType[] = []) => old.filter((c) => c.id !== data.id)
      );

      return { previousContractTypes };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousContractTypes) {
        queryClient.setQueryData(
          queryKeys.contractTypes.lists(),
          context.previousContractTypes
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contractTypes.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trash.deletedContractTypes(),
      });
    },
  });
}

// Positions
export function usePositions() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.positions.lists(),
    queryFn: () => db.getPositions(),
    enabled: orpcReady, // Wait for ORPC to be ready
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      color: string;
      isActive?: boolean;
    }) => {
      return db.createPosition(data);
    },

    onMutate: async (newPosition) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.positions.lists(),
      });

      const previousPositions = queryClient.getQueryData(
        queryKeys.positions.lists()
      );

      queryClient.setQueryData(
        queryKeys.positions.lists(),
        (old: db.Position[] = []) => [
          ...old,
          {
            ...newPosition,
            id: Date.now(),
            isActive: newPosition.isActive ?? true,
          },
        ]
      );

      return { previousPositions };
    },

    onError: (err, _variables, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(
          queryKeys.positions.lists(),
          context.previousPositions
        );
      }
      toast({
        title: "Failed to create position",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      code: string;
      name: string;
      color: string;
      isActive: boolean;
    }) => db.updatePosition(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number }) => db.deletePosition(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.positions.lists(),
      });

      const previousPositions = queryClient.getQueryData(
        queryKeys.positions.lists()
      );

      queryClient.setQueryData(
        queryKeys.positions.lists(),
        (old: db.Position[] = []) => old.filter((p) => p.id !== data.id)
      );

      return { previousPositions };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(
          queryKeys.positions.lists(),
          context.previousPositions
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.trash.deletedPositions() });
    },
  });
}

// Work Locations
export function useWorkLocations() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.workLocations.lists(),
    queryFn: () => db.getWorkLocations(),
    enabled: orpcReady, // Wait for ORPC to be ready
  });
}

export function useCreateWorkLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      color: string;
      isActive?: boolean;
    }) => db.createWorkLocation(data),

    onMutate: async (newLocation) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.workLocations.lists(),
      });

      const previousLocations = queryClient.getQueryData(
        queryKeys.workLocations.lists()
      );

      queryClient.setQueryData(
        queryKeys.workLocations.lists(),
        (old: db.WorkLocation[] = []) => [
          ...old,
          {
            ...newLocation,
            id: Date.now(),
            isActive: newLocation.isActive ?? true,
          },
        ]
      );

      return { previousLocations };
    },

    onError: (err, _variables, context) => {
      if (context?.previousLocations) {
        queryClient.setQueryData(
          queryKeys.workLocations.lists(),
          context.previousLocations
        );
      }
      toast({
        title: "Failed to create work location",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workLocations.lists(),
      });
    },
  });
}

export function useUpdateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      code: string;
      name: string;
      color: string;
      isActive: boolean;
    }) => db.updateWorkLocation(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workLocations.lists(),
      });
    },
  });
}

export function useDeleteWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number }) => db.deleteWorkLocation(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.workLocations.lists(),
      });

      const previousLocations = queryClient.getQueryData(
        queryKeys.workLocations.lists()
      );

      queryClient.setQueryData(
        queryKeys.workLocations.lists(),
        (old: db.WorkLocation[] = []) => old.filter((l) => l.id !== data.id)
      );

      return { previousLocations };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousLocations) {
        queryClient.setQueryData(
          queryKeys.workLocations.lists(),
          context.previousLocations
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workLocations.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trash.deletedWorkLocations(),
      });
    },
  });
}
