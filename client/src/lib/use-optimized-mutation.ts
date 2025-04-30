import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiRequest } from './queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OptimizedMutationOptions<TData, TVariables> extends 
  Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  /**
   * The API endpoint to send data to
   */
  endpoint: string;
  
  /**
   * HTTP method to use
   * @default 'POST'
   */
  method?: HttpMethod;
  
  /**
   * Optional Zod schema to validate request data against
   */
  requestSchema?: z.ZodType<TVariables>;
  
  /**
   * Optional Zod schema to validate response data against
   */
  responseSchema?: z.ZodType<TData>;
  
  /**
   * Query keys to invalidate after successful mutation
   */
  invalidateQueries?: string[];
  
  /**
   * Toast notification configuration for success state
   */
  successConfig?: {
    /** Whether to show a toast notification on success */
    showToast?: boolean;
    /** Message to show in toast notification on success */
    message?: string;
  };
  
  /**
   * Toast notification configuration for error state
   */
  errorConfig?: {
    /** Whether to show a toast notification on error */
    showToast?: boolean;
    /** Message to show in toast notification on error */
    message?: string;
  };
}

/**
 * Hook for optimized data mutations with consistent error handling and cache invalidation
 */
export function useOptimizedMutation<TData = unknown, TVariables = unknown>(
  options: OptimizedMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    endpoint,
    method = 'POST',
    requestSchema,
    responseSchema,
    invalidateQueries = [],
    successConfig = {
      showToast: true,
      message: 'Operation completed successfully',
    },
    errorConfig = {
      showToast: true,
    },
    ...mutationOptions
  } = options;
  
  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    
    mutationFn: async (variables: TVariables) => {
      // Validate request data if schema is provided
      if (requestSchema) {
        try {
          requestSchema.parse(variables);
        } catch (err) {
          console.error('Request validation error:', err);
          throw new Error('The data you submitted is invalid. Please check your inputs and try again.');
        }
      }
      
      // Send the API request
      const response = await apiRequest(method, endpoint, variables);
      
      // Parse the response
      let data = await response.json();
      
      // Validate response data if schema is provided
      if (responseSchema) {
        try {
          data = responseSchema.parse(data);
        } catch (err) {
          console.error('Response validation error:', err);
          throw new Error('The server returned invalid data. Please try again later.');
        }
      }
      
      return data;
    },
    
    onSuccess: (data, variables, context) => {
      // Show success toast if configured
      if (successConfig.showToast) {
        toast({
          title: 'Success',
          description: successConfig.message,
        });
      }
      
      // Invalidate relevant queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      // Call custom onSuccess handler if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    
    onError: (error, variables, context) => {
      // Show error toast if configured
      if (errorConfig.showToast) {
        toast({
          title: 'Error',
          description: errorConfig.message || error.message || 'An error occurred',
          variant: 'destructive',
        });
      }
      
      // Call custom onError handler if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
  });
}

/**
 * Helper to create a mutation with data validation
 */
export function createValidatedMutation<TData, TVariables>(
  endpointPath: string,
  method: HttpMethod = 'POST',
  requestSchema?: z.ZodType<TVariables>,
  responseSchema?: z.ZodType<TData>
) {
  return (options: Partial<OptimizedMutationOptions<TData, TVariables>> = {}) => {
    return useOptimizedMutation<TData, TVariables>({
      endpoint: endpointPath,
      method,
      requestSchema,
      responseSchema,
      ...options,
    });
  };
}