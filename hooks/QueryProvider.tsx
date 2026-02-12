import React from 'react';
// @ts-ignore - tanstack/react-query types
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,     // 2 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (was cacheTime)
      retry: (failureCount: number, error: Error) => {
        // Don't retry on 401/403
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
