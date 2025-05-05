'use client';

import { useEffect } from 'react';
import { usePerformance } from '@/hooks/use-performance';

export function PerformanceMonitor(): null {
  const { startMonitoring, stopMonitoring } = usePerformance();

  useEffect(() => {
    const memoryInterval = setInterval(startMonitoring, 30000);
    return () => {
      if (memoryInterval) {
        clearInterval(memoryInterval as unknown as number);
        stopMonitoring();
      }
    };
  }, [startMonitoring, stopMonitoring]);

  return null;
}
