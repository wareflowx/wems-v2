import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contractsApi,
  type ContractFilters,
  type CreateContractInput,
  type UpdateContractInput,
  type Contract,
} from '@/api/contracts'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/utils/toast'

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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: CreateContractInput) => contractsApi.create(input),

    onMutate: async (newContract) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.contracts.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Contract[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.contracts.lists() },
        (old: Contract[] = []) => [
          ...old,
          {
            ...newContract,
            id: Date.now(),
          },
        ]
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      toast({
        title: 'Failed to create contract',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() })
    },
  })
}

// Hook for updating contract
export function useUpdateContract() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: UpdateContractInput) => contractsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.contracts.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Contract[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.contracts.lists() },
        (old: Contract[] = []) =>
          old.map((contract) =>
            contract.id === id ? { ...contract, ...updates } : contract
          )
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      toast({
        title: 'Failed to update contract',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => contractsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contracts.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.contracts.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Contract[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.contracts.lists() },
        (old: Contract[] = []) => old.filter((contract) => contract.id !== id)
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      toast({
        title: 'Failed to delete contract',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.lists() })
    },
  })
}
