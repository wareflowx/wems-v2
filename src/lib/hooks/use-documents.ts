import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  documentsApi,
  type DocumentFilters,
  type CreateDocumentInput,
  type UpdateDocumentInput,
} from '@/lib/api/documents'
import { queryKeys } from '@/lib/query-keys'

// Hook for fetching documents list
export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: queryKeys.documents.list(JSON.stringify(filters)),
    queryFn: () => documentsApi.getAll(filters),
  })
}

// Hook for fetching single document
export function useDocument(id: number) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  })
}

// Hook for creating document
export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => documentsApi.create(input),

    onMutate: async (newDocument) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousDocuments = queryClient.getQueryData(
        queryKeys.documents.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.documents.list('{}'),
        (old: any[] = []) => [
          ...old,
          {
            ...newDocument,
            id: Date.now(),
          },
        ]
      )

      return { previousDocuments }
    },

    onError: (err, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.list('{}'),
          context.previousDocuments
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() })
    },
  })
}

// Hook for updating document
export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateDocumentInput) => documentsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousDocuments = queryClient.getQueryData(
        queryKeys.documents.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.documents.list('{}'),
        (old: any[] = []) =>
          old.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          )
      )

      return { previousDocuments }
    },

    onError: (err, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.list('{}'),
          context.previousDocuments
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.details() })
    },
  })
}

// Hook for deleting document
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousDocuments = queryClient.getQueryData(
        queryKeys.documents.list('{}')
      )

      queryClient.setQueryData(
        queryKeys.documents.list('{}'),
        (old: any[] = []) => old.filter((doc) => doc.id !== id)
      )

      return { previousDocuments }
    },

    onError: (err, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          queryKeys.documents.list('{}'),
          context.previousDocuments
        )
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() })
    },
  })
}
