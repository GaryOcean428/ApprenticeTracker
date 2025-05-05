import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className,
  lineClassName,
}): React.ReactElement => {
  return (
    <div
      role='status'
      aria-label='Loading content'
      className={cn('animate-pulse space-y-2', className)}
    >
      {Array.from({ length: lines }).map((_: unknown, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-muted',
            i === 0 && 'w-3/4',
            i === lines - 1 && 'w-1/2',
            lineClassName,
          )}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </div>
  );
};

export default SkeletonLoader;
