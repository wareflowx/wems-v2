import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { referenceApi } from '@/lib/api/reference'
import { queryKeys } from '@/lib/query-keys'

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.reference.departments(),
    queryFn: () => referenceApi.getDepartments(),
  })
}

export function useAddDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => referenceApi.addDepartment(name),

    onMutate: async (newDepartment) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.departments() })

      const previousDepartments = queryClient.getQueryData(
        queryKeys.reference.departments()
      )

      queryClient.setQueryData(
        queryKeys.reference.departments(),
        (old: string[] = []) => [...old, newDepartment]
      )

      return { previousDepartments }
    },

    onError: (err, variables, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          queryKeys.reference.departments(),
          context.previousDepartments
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.departments() })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      referenceApi.updateDepartment(oldName, newName),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.departments() })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => referenceApi.deleteDepartment(name),

    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.departments() })

      const previousDepartments = queryClient.getQueryData(
        queryKeys.reference.departments()
      )

      queryClient.setQueryData(
        queryKeys.reference.departments(),
        (old: string[] = []) => old.filter((d) => d !== name)
      )

      return { previousDepartments }
    },

    onError: (err, variables, context) => {
      if (context?.previousDepartments) {
        queryClient.setQueryData(
          queryKeys.reference.departments(),
          context.previousDepartments
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.departments() })
    },
  })
}

// Job Titles
export function useJobTitles() {
  return useQuery({
    queryKey: queryKeys.reference.jobTitles(),
    queryFn: () => referenceApi.getJobTitles(),
  })
}

export function useAddJobTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => referenceApi.addJobTitle(title),

    onMutate: async (newTitle) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.jobTitles() })

      const previousJobTitles = queryClient.getQueryData(
        queryKeys.reference.jobTitles()
      )

      queryClient.setQueryData(
        queryKeys.reference.jobTitles(),
        (old: string[] = []) => [...old, newTitle]
      )

      return { previousJobTitles }
    },

    onError: (err, variables, context) => {
      if (context?.previousJobTitles) {
        queryClient.setQueryData(
          queryKeys.reference.jobTitles(),
          context.previousJobTitles
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.jobTitles() })
    },
  })
}

export function useUpdateJobTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldTitle, newTitle }: { oldTitle: string; newTitle: string }) =>
      referenceApi.updateJobTitle(oldTitle, newTitle),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.jobTitles() })
    },
  })
}

export function useDeleteJobTitle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => referenceApi.deleteJobTitle(title),

    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.jobTitles() })

      const previousJobTitles = queryClient.getQueryData(
        queryKeys.reference.jobTitles()
      )

      queryClient.setQueryData(
        queryKeys.reference.jobTitles(),
        (old: string[] = []) => old.filter((j) => j !== title)
      )

      return { previousJobTitles }
    },

    onError: (err, variables, context) => {
      if (context?.previousJobTitles) {
        queryClient.setQueryData(
          queryKeys.reference.jobTitles(),
          context.previousJobTitles
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.jobTitles() })
    },
  })
}

// Contract Types
export function useContractTypes() {
  return useQuery({
    queryKey: queryKeys.reference.contractTypes(),
    queryFn: () => referenceApi.getContractTypes(),
  })
}

export function useAddContractType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: string) => referenceApi.addContractType(type),

    onMutate: async (newType) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.contractTypes() })

      const previousContractTypes = queryClient.getQueryData(
        queryKeys.reference.contractTypes()
      )

      queryClient.setQueryData(
        queryKeys.reference.contractTypes(),
        (old: string[] = []) => [...old, newType]
      )

      return { previousContractTypes }
    },

    onError: (err, variables, context) => {
      if (context?.previousContractTypes) {
        queryClient.setQueryData(
          queryKeys.reference.contractTypes(),
          context.previousContractTypes
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.contractTypes() })
    },
  })
}

export function useUpdateContractType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldType, newType }: { oldType: string; newType: string }) =>
      referenceApi.updateContractType(oldType, newType),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.contractTypes() })
    },
  })
}

export function useDeleteContractType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type: string) => referenceApi.deleteContractType(type),

    onMutate: async (type) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reference.contractTypes() })

      const previousContractTypes = queryClient.getQueryData(
        queryKeys.reference.contractTypes()
      )

      queryClient.setQueryData(
        queryKeys.reference.contractTypes(),
        (old: string[] = []) => old.filter((c) => c !== type)
      )

      return { previousContractTypes }
    },

    onError: (err, variables, context) => {
      if (context?.previousContractTypes) {
        queryClient.setQueryData(
          queryKeys.reference.contractTypes(),
          context.previousContractTypes
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reference.contractTypes() })
    },
  })
}
