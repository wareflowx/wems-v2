import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  employeesApi,
  type EmployeeFilters,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '@/lib/api/employees'
import { queryKeys } from '@/lib/query-keys'

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

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeesApi.create(input),

    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => [
          ...old,
          {
            ...newEmployee,
            id: Date.now(),
          },
        ]
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeesApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) =>
          old.map((emp) =>
            emp.id === id ? { ...emp, ...updates } : emp
          )
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
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

  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() })

      const previousEmployees = queryClient.getQueryData(
        queryKeys.employees.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.employees.list('{}'),
        (old: any[] = []) => old.filter((emp) => emp.id !== id)
      )

      return { previousEmployees }
    },

    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.list('{}'),
          context.previousEmployees
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    },
  })
}
