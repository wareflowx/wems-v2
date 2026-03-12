import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as db from "@/actions/database";
import { useToast } from "@/utils/toast";
import { useORPCReady } from "./use-orpc-ready";

// Hook for fetching notes list
export function useNotes() {
  const orpcReady = useORPCReady();

  return useQuery({
    queryKey: queryKeys.notes.lists(),
    queryFn: () => db.getNotes(),
    enabled: orpcReady,
  });
}

// Hook for creating a note with optimistic update
export function useCreateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: Parameters<typeof db.createNote>[0]) =>
      db.createNote(input),

    onMutate: async (newNote) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notes.lists(),
      });

      const previousNotes = queryClient.getQueryData(queryKeys.notes.lists());

      queryClient.setQueriesData(
        { queryKey: queryKeys.notes.lists() },
        (old: db.Note[] = []) => [
          ...old,
          {
            ...newNote,
            id: Date.now(),
            isCompleted: false,
            badges: newNote.badges || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      );

      return { previousNotes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes);
      }

      toast({
        title: "Failed to create note",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      toast({ title: "Note created successfully" });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}

// Hook for updating a note
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: Parameters<typeof db.updateNote>[0]) =>
      db.updateNote(input),

    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notes.lists(),
      });

      const previousNotes = queryClient.getQueryData(queryKeys.notes.lists());

      queryClient.setQueriesData(
        { queryKey: queryKeys.notes.lists() },
        (old: db.Note[] = []) =>
          old.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          )
      );

      return { previousNotes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes);
      }

      toast({
        title: "Failed to update note",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}

// Hook for deleting a note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => db.deleteNote(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notes.lists(),
      });

      const previousNotes = queryClient.getQueryData(queryKeys.notes.lists());

      queryClient.setQueriesData(
        { queryKey: queryKeys.notes.lists() },
        (old: db.Note[] = []) => old.filter((note) => note.id !== id)
      );

      return { previousNotes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(queryKeys.notes.lists(), context.previousNotes);
      }

      toast({
        title: "Failed to delete note",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      toast({ title: "Note deleted successfully" });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}
