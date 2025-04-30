import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './error-boundary';

interface WithErrorBoundaryProps {
  fallback?: ReactNode;
}

/**
 * Higher-order component to wrap a component with an error boundary
 * @param Component The component to wrap
 * @param fallback Optional custom fallback UI to show when an error occurs
 */
function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryProps = {}
): ComponentType<P> {
  const { fallback } = options;
  
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `WithErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default withErrorBoundary;