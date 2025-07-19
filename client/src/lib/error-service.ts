import { useToast } from '@/hooks/use-toast';

/**
 * Error types for better error categorization and handling
 */
export enum ErrorType {
  /** Authentication errors (401, 403) */
  AUTH = 'auth',
  /** Network-related errors */
  NETWORK = 'network',
  /** Validation errors */
  VALIDATION = 'validation',
  /** Server errors (500) */
  SERVER = 'server',
  /** Not found errors (404) */
  NOT_FOUND = 'not_found',
  /** Client-side errors */
  CLIENT = 'client',
  /** Unknown errors */
  UNKNOWN = 'unknown',
}

/**
 * Custom error class with additional properties
 */
export class AppError extends Error {
  /** Error type for categorization */
  type: ErrorType;
  /** Original error that caused this error */
  originalError?: unknown;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Additional error details */
  details?: Record<string, unknown>;

  constructor({
    message,
    type = ErrorType.UNKNOWN,
    originalError,
    statusCode,
    details,
  }: {
    message: string;
    type?: ErrorType;
    originalError?: unknown;
    statusCode?: number;
    details?: Record<string, unknown>;
  }) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Create an error from an API response
   */
  static fromApiResponse(response: Response, data?: any): AppError {
    let type = ErrorType.UNKNOWN;
    let message = 'An unknown error occurred';

    // Determine error type based on status code
    if (response.status === 401 || response.status === 403) {
      type = ErrorType.AUTH;
      message = 'Authentication error';
    } else if (response.status === 404) {
      type = ErrorType.NOT_FOUND;
      message = 'Resource not found';
    } else if (response.status >= 400 && response.status < 500) {
      type = ErrorType.VALIDATION;
      message = 'Validation error';
    } else if (response.status >= 500) {
      type = ErrorType.SERVER;
      message = 'Server error';
    }

    // Use error message from response if available
    if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = typeof data.error === 'string' ? data.error : 'An error occurred';
    }

    return new AppError({
      message,
      type,
      statusCode: response.status,
      details: data,
    });
  }

  /**
   * Create an error from a network error
   */
  static fromNetworkError(error: unknown): AppError {
    return new AppError({
      message: 'Network error. Please check your connection.',
      type: ErrorType.NETWORK,
      originalError: error,
    });
  }

  /**
   * Create an error from validation errors
   */
  static fromValidationErrors(errors: Record<string, string[]>): AppError {
    const firstField = Object.keys(errors)[0];
    const firstMessage =
      firstField && errors[firstField]?.length > 0 ? errors[firstField][0] : 'Validation failed';

    return new AppError({
      message: firstMessage,
      type: ErrorType.VALIDATION,
      details: { validationErrors: errors },
    });
  }
}

/**
 * Error handler service for consistent error handling
 */
export const errorService = {
  /**
   * Log an error to the console and potentially to a monitoring service
   */
  logError(error: unknown, context?: string): void {
    if (error instanceof AppError) {
      console.error(`${context ? `[${context}] ` : ''}${error.message}`, {
        type: error.type,
        details: error.details,
        originalError: error.originalError,
      });
    } else if (error instanceof Error) {
      console.error(`${context ? `[${context}] ` : ''}${error.message}`, error);
    } else {
      console.error(`${context ? `[${context}] ` : ''}Unknown error:`, error);
    }

    // Here you would add monitoring service integration (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  },

  /**
   * Get user-friendly message from an error
   */
  getUserMessage(error: unknown): string {
    if (error instanceof AppError) {
      return error.message;
    } else if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'An unexpected error occurred. Please try again later.';
    }
  },

  /**
   * Handle API errors consistently
   */
  async handleApiError(response: Response): Promise<AppError> {
    try {
      const data = await response.json();
      return AppError.fromApiResponse(response, data);
    } catch (e) {
      return AppError.fromApiResponse(response);
    }
  },

  /**
   * Show a toast notification for an error
   */
  showErrorToast(error: unknown, { toast }: { toast: ReturnType<typeof useToast>['toast'] }): void {
    const message = this.getUserMessage(error);
    let title = 'Error';

    // Customize title based on error type
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.AUTH:
          title = 'Authentication Error';
          break;
        case ErrorType.NETWORK:
          title = 'Network Error';
          break;
        case ErrorType.VALIDATION:
          title = 'Validation Error';
          break;
        case ErrorType.SERVER:
          title = 'Server Error';
          break;
        case ErrorType.NOT_FOUND:
          title = 'Not Found';
          break;
      }
    }

    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  },
};
