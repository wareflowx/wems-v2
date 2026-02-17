import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  employeesApi,
  type EmployeeFilters,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type Employee,
} from '@/lib/api/employees'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/hooks/use-toast'

// Hook for fetching employees list
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(JSON.stringify(filters)),
    queryFn: () => employeesApi.getAll(filters),
  })
}

// Hook for fetching single employee
export function useEmployee(id: number) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating employee with optimistic update
export function useCreateEmployee() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.create(input),

    onMutate: async (newEmployee) => {
      // Cancel all employee list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      // Snapshot previous queries
      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Employee[])
      })

      // Optimistically update all employee list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: Employee[] = []) => [
          ...old,
          {
            ...newEmployee,
            id: Date.now(),
          },
        ]
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      // Rollback all queries to previous state
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      // Show error notification
      toast({
        title: 'Failed to create employee',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      // Invalidate to trigger refetch with server data
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeesApi.update(input),

    onMutate: async ({ id, updates }) => {
      // Cancel all employee list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      // Snapshot previous queries
      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Employee[])
      })

      // Optimistically update all employee list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: Employee[] = []) =>
          old.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          )
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      // Rollback all queries to previous state
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      // Show error notification
      toast({
        title: 'Failed to update employee',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.details() })
    },
  })
}

// Hook for deleting employee with optimistic update
export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),

    onMutate: async (id) => {
      // Cancel all employee list queries
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      // Snapshot previous queries
      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Employee[])
      })

      // Optimistically update all employee list queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: Employee[] = []) => old.filter((emp) => emp.id !== id)
      )

      return { previousQueries }
    },

    onError: (err, variables, context) => {
      // Rollback all queries to previous state
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr)
          queryClient.setQueryData(key, data)
        })
      }

      // Show error notification
      toast({
        title: 'Failed to delete employee',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}
