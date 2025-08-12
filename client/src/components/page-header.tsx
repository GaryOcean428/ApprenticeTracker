import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ heading, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 pb-5', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
