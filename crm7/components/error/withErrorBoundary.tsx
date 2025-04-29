import type { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';

import { ErrorFallback } from './ErrorFallback';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    FallbackComponent?: React.ComponentType<FallbackProps>;
    onReset?: () => void;
    onError?: (error: Error, info: ErrorInfo) => void;
  },
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P): React.ReactElement {
    return (
      <ErrorBoundary
        FallbackComponent={options?.FallbackComponent ?? ErrorFallback}
        onReset={options?.onReset ?? ((): void => window.location.reload())}
        onError={
          options?.onError ??
          ((error: unknown, _info): void => {
            // TODO: Add your error logging service here
            console.error('Error caught by error boundary:', error);
          })
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
