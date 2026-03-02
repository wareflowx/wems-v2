import { QueryClient } from "@tanstack/react-query";

// Create QueryClient with development-friendly configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - cache retention
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Refetch on component mount to ensure fresh data
    },
    mutations: {
      retry: 1,
    },
  },
});
