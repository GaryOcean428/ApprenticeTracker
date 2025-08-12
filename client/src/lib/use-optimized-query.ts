import type { UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';
import { getQueryFn } from './queryClient';
import { useToast } from '@/hooks/use-toast';

export interface OptimizedQueryOptions<TData>
  extends Omit<UseQueryOptions<TData, Error>, 'queryKey'> {
  /**
   * The API endpoint to fetch data from
   */
  endpoint: string;

  /**
   * Optional Zod schema to validate response data against
   */
  schema?: z.ZodType<TData>;

  /**
   * Optional key segments to append to the query key
   */
  keySegments?: (string | number)[];

  /**
   * Optional configuration for how the query should behave on error
   */
  errorConfig?: {
    /** Message to show in toast notification on error */
    toastMessage?: string;
    /** Whether to show a toast notification on error */
    showToast?: boolean;
    /** Whether to retry on error */
    retry?: boolean;
  };

  /**
   * How long (in ms) this data should be considered fresh
   * @default 60000 (1 minute)
   */
  staleTime?: number;

  /**
   * How long (in ms) to keep this data in the cache
   * @default 300000 (5 minutes)
   */
  gcTime?: number;
}

/**
 * Hook for optimized data fetching with consistent error handling and caching
 */
export function useOptimizedQuery<TData>(
  options: OptimizedQueryOptions<TData>
): UseQueryResult<TData, Error> {
  const { toast } = useToast();

  const {
    endpoint,
    schema,
    keySegments = [],
    errorConfig = {
      showToast: true,
      retry: true,
    },
    staleTime,
    gcTime,
    ...queryOptions
  } = options;

  // Build query key from endpoint and additional segments
  const queryKey: QueryKey = [endpoint, ...keySegments];

  // Execute the query with optimized settings
  const query = useQuery<TData>({
    queryKey,
    staleTime,
    gcTime,
    retry: errorConfig.retry ? 2 : false,
    ...queryOptions,
    queryFn: getQueryFn({
      on401: 'returnNull',
    }),
  });

  // Handle validation and errors
  if (query.error && errorConfig.showToast) {
    toast({
      title: 'Error',
      description:
        errorConfig.toastMessage ||
        (query.error as Error).message ||
        'An error occurred while fetching data',
      variant: 'destructive',
    });
  }

  // Handle data validation if schema is provided
  if (query.data && schema) {
    try {
      schema.parse(query.data);
    } catch (err) {
      console.error('Data validation error:', err);
      toast({
        title: 'Data Error',
        description: 'The server returned invalid data. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  return query;
}

/**
 * Helper to create a query with data validation
 */
export function createValidatedQuery<T>(endpointPath: string, schema: z.ZodType<T>) {
  return (
    keySegments: (string | number)[] = [],
    options: Partial<OptimizedQueryOptions<T>> = {}
  ) => {
    return useOptimizedQuery<T>({
      endpoint: endpointPath,
      schema,
      keySegments,
      ...options,
    });
  };
}
