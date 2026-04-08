import { QueryClient } from "@tanstack/react-query";

// Create QueryClient with performance-optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - reduce refetches
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
    mutations: {
      retry: 1,
    },
  },
});
