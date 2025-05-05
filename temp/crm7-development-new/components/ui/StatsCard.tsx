'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, change, icon, className }: StatsCardProps): JSX.Element {
  return (
    <div className={cn('rounded-xl bg-white p-6 shadow-sm', className)}>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-gray-600'>{title}</p>
        {icon && <div className='text-gray-400'>{icon}</div>}
      </div>
      <div className='mt-2 flex items-baseline gap-2'>
        <p className='text-2xl font-semibold text-gray-900'>{value}</p>
        {change && <span className='text-sm text-gray-600'>{change}</span>}
      </div>
    </div>
  );
}
