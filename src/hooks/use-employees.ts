import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as db from '@/actions/database'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/utils/toast'

// Employee filters type
export interface EmployeeFilters {
  search?: string
  department?: string
  status?: string
}

// Hook for fetching employees list
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(JSON.stringify(filters)),
    queryFn: async () => {
      const employees = await db.getEmployees()

      // Client-side filtering (can be moved to server later)
      let filtered = [...employees]

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(emp =>
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower) ||
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
        )
      }

      if (filters?.department && filters.department !== 'all') {
        filtered = filtered.filter(emp => emp.department === filters.department)
      }

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(emp => emp.status === filters.status)
      }

      return filtered
    },
  })
}

// Hook for fetching single employee
export function useEmployee(id: number) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => db.getEmployeeById(id),
    enabled: !!id,
  })
}

// Hook for creating employee with optimistic update
export function useCreateEmployee() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: Parameters<typeof db.createEmployee>[0]) => db.createEmployee(input),

    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as db.Employee[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) => [
          ...old,
          {
            ...newEmployee,
            id: Date.now(),
            status: newEmployee.status || 'active',
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
        title: 'Failed to create employee',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: Parameters<typeof db.updateEmployee>[0]) => db.updateEmployee(input),

    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as db.Employee[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) =>
          old.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
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
    mutationFn: (id: number) => db.deleteEmployee(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.employees.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as db.Employee[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.employees.lists() },
        (old: db.Employee[] = []) => old.filter((emp) => emp.id !== id)
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
