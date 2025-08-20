import {QueryClient, QueryFunction} from '@tanstack/react-query';

async function throwIfResNotOk (res: Response) {

  if (!res.ok) {

    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);

  }

}

export async function apiRequest (
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {

  const res = await fetch(url, {
    method,
    'headers': data ? {'Content-Type': 'application/json'} : {},
    'body': data ? JSON.stringify(data) : null,
    'credentials': 'include'
  });

  await throwIfResNotOk(res);
  return res;

}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  const {'on401': unauthorizedBehavior} = options;
  
  return async ({queryKey}) => {
    const res = await fetch(queryKey.join('/'), {
      'credentials': 'include'
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return await res.json() as T;
  };
};

// Enhanced Query Client with strong caching and performance optimizations
export const queryClient = new QueryClient({
  'defaultOptions': {
    'queries': {
      'queryFn': getQueryFn({'on401': 'throw'}),
      // Strong caching strategy; slightly shorter to reduce staleness under concurrency
      'staleTime': 5 * 60 * 1000, // 5 minutes
      'gcTime': 30 * 60 * 1000, // 30 minutes - garbage collection time (increased from 10)
      'refetchInterval': false,
      'refetchOnWindowFocus': false, // ✅ Disabled as requested
      'refetchOnReconnect': true,
      'refetchOnMount': 'always',
      'retry': (failureCount, error) => {

        // Retry on network errors, not on 4xx errors
        if (error instanceof Error && (error.message.includes('4') || error.message.includes('412'))) {

          return false;

        }
        return failureCount < 3;

      },
      'retryDelay': (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Optimistic updates
      'placeholderData': undefined,
      // Enhanced caching behavior
      'structuralSharing': true, // Prevents unnecessary re-renders
      'notifyOnChangeProps': ['data', 'error', 'isLoading'] // Only notify on important changes
    },
    'mutations': {
      'retry': false,
      // Optimistic updates for mutations
      'onMutate': async (_variables) => {

        // Cancel any outgoing refetches
        await queryClient.cancelQueries();
        return {'previousData': undefined};

      },
      'onError': (_err, _variables, context) => {

        // Rollback on error
        const ctx = context as { previousData?: unknown } | undefined;
        if (ctx?.previousData !== undefined) {

          queryClient.setQueryData<unknown>(['data'], ctx.previousData);

        }

      },
      'onSettled': () => {

        // Always refetch after error or success
        queryClient.invalidateQueries();

      }
    }
  }
});

// Prefetch important data with extended cache times
export const prefetchQueries = async () => {

  // Prefetch user data with longer cache time
  await queryClient.prefetchQuery({
    'queryKey': ['user'],
    'queryFn': () => fetch('/api/user', { 'credentials': 'include' }).then(res => res.json()),
    'staleTime': 15 * 60 * 1000, // 15 minutes
    'gcTime': 60 * 60 * 1000 // 1 hour
  });

  // Prefetch companies data with longer cache time
  await queryClient.prefetchQuery({
    'queryKey': ['companies'],
    'queryFn': () => fetch('/api/companies', { 'credentials': 'include' }).then(res => res.json()),
    'staleTime': 20 * 60 * 1000, // 20 minutes
    'gcTime': 60 * 60 * 1000 // 1 hour
  });

  // Prefetch employees data
  await queryClient.prefetchQuery({
    'queryKey': ['employees'],
    'queryFn': () => fetch('/api/employees', { 'credentials': 'include' }).then(res => res.json()),
    'staleTime': 10 * 60 * 1000, // 10 minutes
    'gcTime': 30 * 60 * 1000 // 30 minutes
  });

};

// Enhanced cache invalidation utilities
export const invalidateCache = {
  'user': () => queryClient.invalidateQueries({'queryKey': ['user']}),
  'companies': () => queryClient.invalidateQueries({'queryKey': ['companies']}),
  'employees': () => queryClient.invalidateQueries({'queryKey': ['employees']}),
  'documents': () => queryClient.invalidateQueries({'queryKey': ['documents']}),
  'leaves': () => queryClient.invalidateQueries({'queryKey': ['leaves']}),
  'payroll': () => queryClient.invalidateQueries({'queryKey': ['payroll']}),
  'all': () => queryClient.invalidateQueries()
};

// Cache management utilities
export const cacheUtils = {
  // Get cached data without triggering a fetch
  'getCachedData': <T>(queryKey: string[]) => {

    return queryClient.getQueryData<T>(queryKey);

  },

  // Set data in cache manually
  'setCachedData': <T>(queryKey: string[], data: T) => {

    queryClient.setQueryData<T>(queryKey, data);

  },

  // Remove specific data from cache
  'removeFromCache': (queryKey: string[]) => {

    queryClient.removeQueries({queryKey});

  },

  // Clear all cache
  'clearAllCache': () => {

    queryClient.clear();

  },

  // Get cache statistics
  'getCacheStats': () => {

    const queries = queryClient.getQueryCache().getAll();
    return {
      'totalQueries': queries.length,
      'activeQueries': queries.filter(q => q.isActive()).length,
      'staleQueries': queries.filter(q => q.isStale()).length
    };

  }
};
