import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Attachment type from DB
interface AttachmentFromDB {
  id: string;
  employeeId: number;
  entityType: "contract" | "caces" | "document" | "medical_visit";
  entityId: number | null;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

// Document type for frontend (matches old mock format but with string id)
export interface Document {
  id: string;
  name: string;
  type: string;
  employee: string;
  employeeId: number;
  uploadDate: string;
  size: string;
  category: string;
}

// Document filters
export interface DocumentFilters {
  search?: string;
  type?: string;
  category?: string;
  employee?: string;
}

// Convert bytes to human-readable size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Get category from mime type
function getCategoryFromMimeType(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

// Get type from original name or mime type
function getDocumentType(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "Contrat";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "Identification";
  return "Document";
}

// Enrich attachments with employee data
function enrichDocumentsWithEmployee(
  attachments: AttachmentFromDB[],
  employees?: { id: number; firstName: string; lastName: string }[]
): Document[] {
  return attachments.map((attachment) => {
    const employee = employees?.find((e) => e.id === attachment.employeeId);
    return {
      id: attachment.id,
      name: attachment.originalName,
      type: getDocumentType(attachment.originalName),
      employee: employee
        ? `${employee.firstName} ${employee.lastName}`
        : "Unknown",
      employeeId: attachment.employeeId,
      uploadDate: attachment.createdAt.split("T")[0],
      size: formatFileSize(attachment.size),
      category: getCategoryFromMimeType(attachment.mimeType),
    };
  });
}

// Filter documents based on filters
function filterDocuments(documents: Document[], filters?: DocumentFilters): Document[] {
  let filtered = [...documents];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.employee.toLowerCase().includes(searchLower) ||
        doc.type.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.type && filters.type !== "all") {
    filtered = filtered.filter((doc) => doc.type === filters.type);
  }

  if (filters?.category && filters.category !== "all") {
    filtered = filtered.filter((doc) => doc.category === filters.category);
  }

  if (filters?.employee && filters.employee !== "all") {
    filtered = filtered.filter((doc) => doc.employee === filters.employee);
  }

  return filtered;
}

// Hook for fetching documents list
export function useDocuments(filters?: DocumentFilters) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.documents.list(JSON.stringify(filters)),
    queryFn: async () => {
      const [attachmentsData, employeesData] = await Promise.all([
        db.getAttachmentsByType("document"),
        db.getEmployees(),
      ]);
      const enriched = enrichDocumentsWithEmployee(attachmentsData, employeesData);
      return filterDocuments(enriched, filters);
    },
    enabled: orpcReady,
  });
}

// Hook for fetching single document
export function useDocument(id: string) {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: async () => {
      const [attachmentsData, employeesData] = await Promise.all([
        db.getAttachments(),
        db.getEmployees(),
      ]);
      const attachment = attachmentsData.find((a) => a.id === id);
      if (!attachment) return null;
      const enriched = enrichDocumentsWithEmployee([attachment], employeesData);
      return enriched[0];
    },
    enabled: orpcReady && !!id,
  });
}

// Input types for mutations
interface CreateDocumentInput {
  employeeId: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  filePath: string;
}

interface UpdateDocumentInput {
  id: string;
  employeeId?: number;
  originalName?: string;
}

// Hook for creating document
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateDocumentInput) =>
      db.createAttachment({
        employeeId: input.employeeId,
        entityType: "document",
        originalName: input.originalName,
        storedName: input.storedName,
        mimeType: input.mimeType,
        size: input.size,
        filePath: input.filePath,
      }),

    onMutate: async (newDocument) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.documents.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Document[]);
        });

      const optimisticDocument: Document = {
        id: `temp-${Date.now()}`,
        name: newDocument.originalName,
        type: getDocumentType(newDocument.originalName),
        employee: "Loading...",
        employeeId: newDocument.employeeId,
        uploadDate: new Date().toISOString().split("T")[0],
        size: formatFileSize(newDocument.size),
        category: getCategoryFromMimeType(newDocument.mimeType),
      };

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) => [...old, optimisticDocument]
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to create document",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
  });
}

// Hook for updating document
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateDocumentInput) => {
      // For documents, we can't really update much since they are file references
      // This is a placeholder for potential future updates
      console.log("Update document:", input);
      return input;
    },

    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.documents.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Document[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) =>
          old.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to update document",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.details(),
      });
    },
  });
}

// Hook for deleting document
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => db.deleteAttachment(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.documents.lists(),
      });

      const previousQueries = new Map();
      queryClient
        .getQueriesData({ queryKey: queryKeys.documents.lists() })
        .forEach(([key, data]) => {
          previousQueries.set(JSON.stringify(key), data as Document[]);
        });

      queryClient.setQueriesData(
        { queryKey: queryKeys.documents.lists() },
        (old: Document[] = []) => old.filter((doc) => doc.id !== id)
      );

      return { previousQueries };
    },

    onError: (err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, keyStr) => {
          const key = JSON.parse(keyStr);
          queryClient.setQueryData(key, data);
        });
      }

      toast({
        title: "Failed to delete document",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
  });
}
