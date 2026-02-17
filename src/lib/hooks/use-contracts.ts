import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contractsApi,
  type ContractFilters,
  type CreateContractInput,
  type UpdateContractInput,
} from '@/lib/api/contracts'
import { queryKeys } from '@/lib/query-keys'

// Hook for fetching contracts list
export function useContracts(filters?: ContractFilters) {
  return useQuery({
    queryKey: queryKeys.contracts.list(JSON.stringify(filters)),
    queryFn: () => contractsApi.getAll(filters),
  })
}

// Hook for fetching single contract
export function useContract(id: number) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(id),
    queryFn: () => contractsApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating contract
export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateContractInput) => contractsApi.create(input),

    onMutate: async (newContract) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousContracts = queryClient.getQueryData(
        queryKeys.contracts.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.contracts.list('{}'),
        (old: any[] = []) => [
          ...old,
          {
            ...newContract,
            id: Date.now(),
          },
        ]
      )

      return { previousContracts }
    },

    onError: (err, variables, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData(
          queryKeys.contracts.list('{}'),
          context.previousContracts
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() })
    },
  })
}

// Hook for updating contract
export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateContractInput) => contractsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousContracts = queryClient.getQueryData(
        queryKeys.contracts.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.contracts.list('{}'),
        (old: any[] = []) =>
          old.map((contract) =>
            contract.id === id ? { ...contract, ...updates } : contract
          )
      )

      return { previousContracts }
    },

    onError: (err, variables, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData(
          queryKeys.contracts.list('{}'),
          context.previousContracts
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.details() })
    },
  })
}

// Hook for deleting contract
export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => contractsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousContracts = queryClient.getQueryData(
        queryKeys.contracts.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.contracts.list('{}'),
        (old: any[] = []) => old.filter((contract) => contract.id !== id)
      )

      return { previousContracts }
    },

    onError: (err, variables, context) => {
      if (context?.previousContracts) {
        queryClient.setQueryData(
          queryKeys.contracts.list('{}'),
          context.previousContracts
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() })
    },
  })
}
