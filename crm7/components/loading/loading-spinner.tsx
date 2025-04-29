import { cn } from '@/lib/utils';
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}): React.ReactElement => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div role="status" className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-4 border-muted border-t-primary', sizeClasses[size])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
