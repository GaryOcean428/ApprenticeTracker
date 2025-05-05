/** @jsxImportSource react */
'use client';

import { initialState, performanceReducer } from '@/lib/reducers/performance';
import type { PerformanceContextType } from '@/lib/types';
import { createContext, useCallback, useContext, useReducer } from 'react';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  const startMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const memory = (performance as any).memory;
        if (memory) {
          dispatch({
            type: 'UPDATE_MEMORY',
            payload: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
            },
          });
        }

        const timing = performance.timing;
        if (timing) {
          dispatch({
            type: 'UPDATE_TIMING',
            payload: {
              loadTime: timing.loadEventEnd - timing.navigationStart,
              domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            },
          });
        }

        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
          const nav = entries[0] as PerformanceNavigationTiming;
          dispatch({
            type: 'UPDATE_NAVIGATION',
            payload: {
              ttfb: nav.responseStart - nav.requestStart,
              fcp: nav.domContentLoadedEventEnd - nav.loadEventStart,
            },
          });
        }
      }
    }, 5000);

    return interval;
  }, [dispatch]);

  const stopMonitoring = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks();
      performance.clearMeasures();
      performance.clearResourceTimings();
    }
  }, []);

  return (
    <PerformanceContext.Provider value={{ state, dispatch, startMonitoring, stopMonitoring }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export { PerformanceContext }; // Explicitly export PerformanceContext

export function usePerformanceContext(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}
