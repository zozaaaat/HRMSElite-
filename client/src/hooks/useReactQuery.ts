import {
  useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions, useInfiniteQuery as useInfiniteQueryBase
} from '@tanstack/react-query';
import {cacheUtils} from '@/lib/queryClient';

// Enhanced useQuery hook with better defaults
export function useEnhancedQuery<TData = unknown, TError = unknown> (
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
) {

  return useQuery({
    queryKey,
    queryFn,
    // Enhanced defaults
    'staleTime': 10 * 60 * 1000, // 10 minutes
    'gcTime': 30 * 60 * 1000, // 30 minutes
    'refetchOnWindowFocus': false,
    'refetchOnMount': true,
    'retry': (failureCount, error) => {

      if (error instanceof Error && error.message.includes('4')) {

        return false;

      }
      return failureCount < 3;

    },
    ...options
  });

}

// Enhanced useMutation hook with better error handling
export function useEnhancedMutation<TData = unknown, TError = unknown, TVariables = unknown> (
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, { previousData: unknown }>, 'mutationFn'>
) {

  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, { previousData: unknown }>({
    mutationFn,
    'retry': false,
    'onMutate': async (_variables) => {

      // Cancel any outgoing refetches
      await queryClient.cancelQueries();
      return {'previousData': undefined as unknown};

    },
    'onError': (err, variables, context) => {

      // Rollback on error
      if (context?.previousData) {

        queryClient.setQueryData(['data'], context.previousData);

      }

    },
    'onSettled': () => {

      // Always refetch after error or success
      queryClient.invalidateQueries();

    },
    ...options
  });

}

// Hook for optimistic updates
export function useOptimisticMutation<TData = unknown, TError = unknown, TVariables = unknown> (
  mutationFn: (variables: TVariables) => Promise<TData>,
  updateQueryKey: string[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, { previousData: TData | undefined }>, 'mutationFn'>
) {

  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, { previousData: TData | undefined }>({
    mutationFn,
    'onMutate': async (variables) => {

      // Cancel any outgoing refetches
      await queryClient.cancelQueries();

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(updateQueryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TData>(updateQueryKey, (old) =>
        updateFn(old, variables)
      );

      // Return a context object with the snapshotted value
      return {previousData};

    },
    'onError': (err, variables, context) => {

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {

        queryClient.setQueryData<TData>(updateQueryKey, context.previousData);

      }

    },
    'onSettled': () => {

      // Always refetch after error or success
      queryClient.invalidateQueries({'queryKey': updateQueryKey});

    },
    ...options
  });

}

// Hook for infinite queries with better caching
export function useInfiniteQuery<TData = unknown> (
  queryKey: string[],
  queryFn: ({pageParam}: { pageParam: number }) => Promise<TData>,
  options?: {
    getNextPageParam?: (lastPage: TData, allPages: TData[]) => number | undefined;
    getPreviousPageParam?: (firstPage: TData, allPages: TData[]) => number | undefined;
  }
) {

  return useInfiniteQueryBase({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: options?.getNextPageParam ?? (() => undefined),
    'staleTime': 10 * 60 * 1000,
    'gcTime': 30 * 60 * 1000,
    'refetchOnWindowFocus': false,
    'refetchOnMount': true,
    ...options
  });

}

// Export cache utilities for easy access
export {cacheUtils};
