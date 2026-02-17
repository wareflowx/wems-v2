import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  medicalVisitsApi,
  type MedicalVisitFilters,
  type CreateMedicalVisitInput,
  type UpdateMedicalVisitInput,
} from '@/lib/api/medical-visits'
import { queryKeys } from '@/lib/query-keys'

// Hook for fetching medical visits list
export function useMedicalVisits(filters?: MedicalVisitFilters) {
  return useQuery({
    queryKey: queryKeys.medicalVisits.list(JSON.stringify(filters)),
    queryFn: () => medicalVisitsApi.getAll(filters),
  })
}

// Hook for fetching single medical visit
export function useMedicalVisit(id: number) {
  return useQuery({
    queryKey: queryKeys.medicalVisits.detail(id),
    queryFn: () => medicalVisitsApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating medical visit
export function useCreateMedicalVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMedicalVisitInput) => medicalVisitsApi.create(input),

    onMutate: async (newVisit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousVisits = queryClient.getQueryData(
        queryKeys.medicalVisits.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.medicalVisits.list('{}'),
        (old: any[] = []) => [
          ...old,
          {
            ...newVisit,
            id: Date.now(),
            daysUntil: 0,
            status: 'scheduled',
          },
        ]
      )

      return { previousVisits }
    },

    onError: (err, variables, context) => {
      if (context?.previousVisits) {
        queryClient.setQueryData(
          queryKeys.medicalVisits.list('{}'),
          context.previousVisits
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalVisits.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}

// Hook for updating medical visit
export function useUpdateMedicalVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMedicalVisitInput) => medicalVisitsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousVisits = queryClient.getQueryData(
        queryKeys.medicalVisits.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.medicalVisits.list('{}'),
        (old: any[] = []) =>
          old.map((visit) =>
            visit.id === id ? { ...visit, ...updates } : visit
          )
      )

      return { previousVisits }
    },

    onError: (err, variables, context) => {
      if (context?.previousVisits) {
        queryClient.setQueryData(
          queryKeys.medicalVisits.list('{}'),
          context.previousVisits
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalVisits.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalVisits.details() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}

// Hook for deleting medical visit
export function useDeleteMedicalVisit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => medicalVisitsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousVisits = queryClient.getQueryData(
        queryKeys.medicalVisits.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.medicalVisits.list('{}'),
        (old: any[] = []) => old.filter((visit) => visit.id !== id)
      )

      return { previousVisits }
    },

    onError: (err, variables, context) => {
      if (context?.previousVisits) {
        queryClient.setQueryData(
          queryKeys.medicalVisits.list('{}'),
          context.previousVisits
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalVisits.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}
