import { useCallback } from 'react';
import { useNavigate } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { errorService, AppError, ErrorType } from '@/lib/error-service';

/**
 * Hook for consistent error handling across the application
 */
export function useErrorHandler() {
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Handle errors with appropriate UI feedback and actions
   */
  const handleError = useCallback(
    (error: unknown, { title, context }: { title?: string; context?: string } = {}) => {
      // Log the error
      errorService.logError(error, context);

      // Show toast notification
      errorService.showErrorToast(error, { toast });

      // Handle specific error types
      if (error instanceof AppError) {
        // Redirect to login for authentication errors
        if (error.type === ErrorType.AUTH) {
          navigate[0]('/auth');
        }

        // Return the typed error for additional handling if needed
        return error;
      }

      // Convert to AppError if it's not already
      return new AppError({
        message: error instanceof Error ? error.message : String(error),
        type: ErrorType.UNKNOWN,
        originalError: error,
      });
    },
    [toast, navigate]
  );

  /**
   * Safely execute a function and handle any errors
   */
  const tryCatch = useCallback(
    async <T>(
      fn: () => Promise<T> | T,
      {
        onSuccess,
        context,
        rethrow = false,
      }: {
        onSuccess?: (result: T) => void;
        context?: string;
        rethrow?: boolean;
      } = {}
    ): Promise<T | undefined> => {
      try {
        const result = await fn();
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (error: unknown) {
        handleError(error, { context });
        if (rethrow) {
          throw error;
        }
        return undefined;
      }
    },
    [handleError]
  );

  return {
    handleError,
    tryCatch,
  };
}
