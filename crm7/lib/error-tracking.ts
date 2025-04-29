import { toast } from '@/components/ui/use-toast';
import { init } from '@sentry/nextjs';
import { logger } from '@/lib/utils/logger';

// Define a NetworkError class
class NetworkError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

interface ErrorContext {
  componentName?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  initialize() {
    if (this.isInitialized) return;

    // Add global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        action: 'global_error',
        additionalData: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        action: 'unhandled_promise_rejection',
      });
    });

    this.isInitialized = true;
  }

  trackError(error: Error, context?: ErrorContext) {
    console.error('Error tracked:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly toast
    toast({
      variant: 'destructive',
      title: 'An error occurred',
      description: this.getUserFriendlyMessage(error),
    });

    // Send to error reporting service (e.g., Sentry)
    this.sendToErrorService(error, context);
  }

  private getUserFriendlyMessage(error: Error): string {
    // Map known error types to user-friendly messages
    if (error instanceof TypeError) {
      return 'Something went wrong with the data. Please try again.';
    }
    if (error instanceof ReferenceError) {
      return 'A technical error occurred. Please refresh the page.';
    }
    if (error instanceof NetworkError) {
      return 'Network connection issue. Please check your internet connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private async sendToErrorService(error: Error, context?: ErrorContext) {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      logger.warn('Sentry DSN not configured');
      return;
    }

    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
    });
  }
}

export const errorTracker = ErrorTracker.getInstance();
