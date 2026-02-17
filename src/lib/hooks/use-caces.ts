import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cacesApi,
  type CacesFilters,
  type CreateCacesInput,
  type UpdateCacesInput,
} from '@/lib/api/caces'
import { queryKeys } from '@/lib/query-keys'

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

  return useMutation({
    mutationFn: (input: CreateCacesInput) => cacesApi.create(input),

    onMutate: async (newCaces) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousCaces = queryClient.getQueryData(queryKeys.caces.list('{}'))

      queryClient.setQueryData(
        queryKeys.caces.list('{}'),
        (old: any[] = []) => [
          ...old,
          {
            ...newCaces,
            id: Date.now(),
            daysLeft: 0,
            status: 'valid',
          },
        ]
      )

      return { previousCaces }
    },

    onError: (err, variables, context) => {
      if (context?.previousCaces) {
        queryClient.setQueryData(
          queryKeys.caces.list('{}'),
          context.previousCaces
        )
      }
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

  return useMutation({
    mutationFn: (input: UpdateCacesInput) => cacesApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousCaces = queryClient.getQueryData(queryKeys.caces.list('{}'))

      queryClient.setQueryData(
        queryKeys.caces.list('{}'),
        (old: any[] = []) =>
          old.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          )
      )

      return { previousCaces }
    },

    onError: (err, variables, context) => {
      if (context?.previousCaces) {
        queryClient.setQueryData(
          queryKeys.caces.list('{}'),
          context.previousCaces
        )
      }
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

  return useMutation({
    mutationFn: (id: number) => cacesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.caces.lists() })

      const previousCaces = queryClient.getQueryData(queryKeys.caces.list('{}'))

      queryClient.setQueryData(
        queryKeys.caces.list('{}'),
        (old: any[] = []) => old.filter((c) => c.id !== id)
      )

      return { previousCaces }
    },

    onError: (err, variables, context) => {
      if (context?.previousCaces) {
        queryClient.setQueryData(
          queryKeys.caces.list('{}'),
          context.previousCaces
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.caces.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}
