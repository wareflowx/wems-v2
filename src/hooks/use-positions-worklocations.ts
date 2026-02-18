import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import * as db from '@/actions/database'
import { useToast } from '@/utils/toast'

// Positions
export function usePositions() {
  return useQuery({
    queryKey: queryKeys.positions.lists(),
    queryFn: () => db.getPositions(),
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: { code: string; name: string; color: string; isActive?: boolean }) => {
      console.log('useCreatePosition mutationFn called:', data);
      return db.createPosition(data);
    },

    onMutate: async (newPosition) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.positions.lists() })

      const previousPositions = queryClient.getQueryData(queryKeys.positions.lists())

      queryClient.setQueryData(
        queryKeys.positions.lists(),
        (old: db.Position[] = []) => [
          ...old,
          { ...newPosition, id: Date.now(), isActive: newPosition.isActive ?? true },
        ]
      )

      return { previousPositions }
    },

    onError: (err, variables, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(queryKeys.positions.lists(), context.previousPositions)
      }
      toast({
        title: 'Failed to create position',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() })
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number; code: string; name: string; color: string; isActive: boolean }) =>
      db.updatePosition(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() })
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number }) => db.deletePosition(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.positions.lists() })

      const previousPositions = queryClient.getQueryData(queryKeys.positions.lists())

      queryClient.setQueryData(
        queryKeys.positions.lists(),
        (old: db.Position[] = []) => old.filter((p) => p.id !== data.id)
      )

      return { previousPositions }
    },

    onError: (err, variables, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(queryKeys.positions.lists(), context.previousPositions)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.lists() })
    },
  })
}

// Work Locations
export function useWorkLocations() {
  return useQuery({
    queryKey: queryKeys.workLocations.lists(),
    queryFn: () => db.getWorkLocations(),
  })
}

export function useCreateWorkLocation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: { code: string; name: string; color: string; isActive?: boolean }) =>
      db.createWorkLocation(data),

    onMutate: async (newLocation) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workLocations.lists() })

      const previousLocations = queryClient.getQueryData(queryKeys.workLocations.lists())

      queryClient.setQueryData(
        queryKeys.workLocations.lists(),
        (old: db.WorkLocation[] = []) => [
          ...old,
          { ...newLocation, id: Date.now(), isActive: newLocation.isActive ?? true },
        ]
      )

      return { previousLocations }
    },

    onError: (err, variables, context) => {
      if (context?.previousLocations) {
        queryClient.setQueryData(queryKeys.workLocations.lists(), context.previousLocations)
      }
      toast({
        title: 'Failed to create work location',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workLocations.lists() })
    },
  })
}

export function useUpdateWorkLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number; code: string; name: string; color: string; isActive: boolean }) =>
      db.updateWorkLocation(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workLocations.lists() })
    },
  })
}

export function useDeleteWorkLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: number }) => db.deleteWorkLocation(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workLocations.lists() })

      const previousLocations = queryClient.getQueryData(queryKeys.workLocations.lists())

      queryClient.setQueryData(
        queryKeys.workLocations.lists(),
        (old: db.WorkLocation[] = []) => old.filter((l) => l.id !== data.id)
      )

      return { previousLocations }
    },

    onError: (err, variables, context) => {
      if (context?.previousLocations) {
        queryClient.setQueryData(queryKeys.workLocations.lists(), context.previousLocations)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workLocations.lists() })
    },
  })
}
