import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cacesApi,
  type CacesFilters,
  type CreateCacesInput,
  type UpdateCacesInput,
  type Caces,
} from '@/lib/api/caces'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/lib/utils/toast'

// Hook for fetching CACES certifications list
export function useCaces(filters?: CacesFilters) {
  return useQuery({
    queryKey: queryKeys.caces.list(JSON.stringify(filters)),
    queryFn: () => cacesApi.getAll(filters),
  })
}

// Hook for fetching single CACES certification
export function useCaces(id: number) {
  return useQuery({
    queryKey: queryKeys.caces.detail(id),
    queryFn: () => cacesApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating CACES certification
export function useCreateCaces() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: CreateCacesInput) => cacesApi.create(input),

    onMutate: async (newCaces) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.caces.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Caces[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Caces[] = []) => [
          ...old,
          {
            ...newCaces,
            id: Date.now(),
            daysLeft: 0,
            status: 'valid',
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
        title: 'Failed to create CACES certification',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}

// Hook for updating CACES certification
export function useUpdateCaces() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: UpdateCacesInput) => cacesApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.caces.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Caces[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Caces[] = []) =>
          old.map((c) =>
            c.id === id ? { ...c, ...updates } : c
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
        title: 'Failed to update CACES certification',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.details() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}

// Hook for deleting CACES certification
export function useDeleteCaces() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => cacesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.caces.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Caces[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.caces.lists() },
        (old: Caces[] = []) => old.filter((c) => c.id !== id)
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
        title: 'Failed to delete CACES certification',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}
