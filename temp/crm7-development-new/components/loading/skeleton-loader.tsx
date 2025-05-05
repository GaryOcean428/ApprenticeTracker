import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className,
  lineClassName,
}): React.ReactElement => {
  return (
    <div role="status" aria-label="Loading content" className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          role="presentation"
          className={cn(
            'h-4 rounded bg-muted',
            {
              'w-3/4': i === 0,
              'w-1/2': i === lines - 1,
            },
            lineClassName
          )}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
