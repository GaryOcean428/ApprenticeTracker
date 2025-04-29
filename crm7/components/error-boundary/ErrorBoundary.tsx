'use client';

import React from 'react';
import { errorTracker } from '@/lib/error-tracking';
import { ErrorFallback } from '@/components/error/ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Convert ErrorInfo to a plain object for tracking
    const errorInfoObj = {
      componentStack: errorInfo.componentStack,
      ...errorInfo,
    };
    
    errorTracker.trackError(error, { additionalData: errorInfoObj });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            resetErrorBoundary={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}
