import { FC, HTMLAttributes, ReactElement } from 'react';

import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'circle' | 'rounded';
}

export const Skeleton: FC<SkeletonProps> = ({
  className,
  variant = 'default',
  ...props
}): ReactElement => {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        {
          'rounded-full': variant === 'circle',
          'rounded-md': variant === 'rounded',
          'rounded-sm': variant === 'default',
        },
        className
      )}
      {...props}
    />
  );
};

export const SkeletonCard = (): ReactElement => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};

export const SkeletonList = (): ReactElement => {
  return (
    <div className="space-y-3">
      <Skeleton className="mx-4 h-4 w-32" />
      <div className="space-y-2 px-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
};

export const SkeletonForm = (): ReactElement => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
