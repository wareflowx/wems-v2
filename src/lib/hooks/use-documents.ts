import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  documentsApi,
  type DocumentFilters,
  type CreateDocumentInput,
  type UpdateDocumentInput,
  type Document,
} from '@/lib/api/documents'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/lib/utils/toast'

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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => documentsApi.create(input),

    onMutate: async (newDocument) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.documents.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Document[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) => [
          ...old,
          {
            ...newDocument,
            id: Date.now(),
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
        title: 'Failed to create document',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() })
    },
  })
}

// Hook for updating document
export function useUpdateDocument() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: UpdateDocumentInput) => documentsApi.update(input),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.documents.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Document[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) =>
          old.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
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
        title: 'Failed to update document',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documents.lists() })

      const previousQueries = new Map()
      queryClient.getQueriesData({ queryKey: queryKeys.documents.lists() }).forEach(([key, data]) => {
        previousQueries.set(JSON.stringify(key), data as Document[])
      })

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) => old.filter((doc) => doc.id !== id)
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
        title: 'Failed to delete document',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() })
    },
  })
}
