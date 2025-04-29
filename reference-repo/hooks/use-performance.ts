'use client';

import { useContext } from 'react';
import { PerformanceContext } from '@/components/providers/PerformanceProvider';
import type { PerformanceContextType } from '@/lib/types';

export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
