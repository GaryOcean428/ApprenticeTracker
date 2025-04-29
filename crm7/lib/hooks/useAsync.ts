import { useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  toastOnError?: boolean;
  autoExecute?: boolean;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
): () => Promise<T> {
  const { toast } = useToast();
  const { onSuccess, onError, toastOnError = true, autoExecute = false } = options;

  const execute = useCallback(async (): Promise<T> => {
    try {
      const data = await asyncFunction();
      onSuccess?.(data);
      return data;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('An error occurred');

      onError?.(errorObj);

      if (toastOnError) {
        toast({
          title: 'Error',
          description: errorObj.message,
          variant: 'destructive',
        });
      }

      throw errorObj;
    }
  }, [asyncFunction, onSuccess, onError, toastOnError, toast]);

  useEffect(() => {
    if (autoExecute) {
      void execute();
    }
  }, [autoExecute, execute]);

  return execute;
}
