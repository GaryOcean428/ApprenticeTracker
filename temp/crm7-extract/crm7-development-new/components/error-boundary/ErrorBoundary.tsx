'use client';

import { ErrorFallback } from '@/components/error/ErrorFallback';
import { errorTracker } from '@/lib/error-tracking';
import React from 'react';

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
    if (this.props.onError !== undefined) {
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
    if (this.props.onReset !== undefined) {
      this.props.onReset();
    }
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;

    if (hasError && error !== null) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
