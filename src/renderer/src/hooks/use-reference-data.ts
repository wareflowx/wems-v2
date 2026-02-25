import { queryKeys } from "@@/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referenceApi } from "@/api/reference";

// Job Titles
export function useJobTitles() {
  return useQuery({
    queryKey: queryKeys.reference.jobTitles(),
    queryFn: () => referenceApi.getJobTitles(),
  });
}

export function useAddJobTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => referenceApi.addJobTitle(title),

    onMutate: async (newTitle) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.reference.jobTitles(),
      });

      const previousJobTitles = queryClient.getQueryData(
        queryKeys.reference.jobTitles()
      );

      queryClient.setQueryData(
        queryKeys.reference.jobTitles(),
        (old: string[] = []) => [...old, newTitle]
      );

      return { previousJobTitles };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousJobTitles) {
        queryClient.setQueryData(
          queryKeys.reference.jobTitles(),
          context.previousJobTitles
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reference.jobTitles(),
      });
    },
  });
}

export function useUpdateJobTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      oldTitle,
      newTitle,
    }: {
      oldTitle: string;
      newTitle: string;
    }) => referenceApi.updateJobTitle(oldTitle, newTitle),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reference.jobTitles(),
      });
    },
  });
}

export function useDeleteJobTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => referenceApi.deleteJobTitle(title),

    onMutate: async (title) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.reference.jobTitles(),
      });

      const previousJobTitles = queryClient.getQueryData(
        queryKeys.reference.jobTitles()
      );

      queryClient.setQueryData(
        queryKeys.reference.jobTitles(),
        (old: string[] = []) => old.filter((j) => j !== title)
      );

      return { previousJobTitles };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousJobTitles) {
        queryClient.setQueryData(
          queryKeys.reference.jobTitles(),
          context.previousJobTitles
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reference.jobTitles(),
      });
    },
  });
}

