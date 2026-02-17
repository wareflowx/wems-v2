import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  medicalVisitsApi,
  type MedicalVisitFilters,
  type CreateMedicalVisitInput,
  type UpdateMedicalVisitInput,
  type MedicalVisit,
} from '@/lib/api/medical-visits'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/lib/utils/toast'

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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: CreateMedicalVisitInput) => medicalVisitsApi.create(input),

    onMutate: async (newVisit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.medicalVisits.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as MedicalVisit[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) => [
          ...old,
          {
            ...newVisit,
            id: Date.now(),
            daysUntil: 0,
            status: 'scheduled',
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
        title: 'Failed to create medical visit',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: UpdateMedicalVisitInput) => medicalVisitsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.medicalVisits.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as MedicalVisit[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) =>
          old.map((visit) =>
            visit.id === id ? { ...visit, ...updates } : visit
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
        title: 'Failed to update medical visit',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => medicalVisitsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medicalVisits.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.medicalVisits.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as MedicalVisit[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.medicalVisits.lists() },
        (old: MedicalVisit[] = []) => old.filter((visit) => visit.id !== id)
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
        title: 'Failed to delete medical visit',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalVisits.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.lists() })
    },
  })
}
