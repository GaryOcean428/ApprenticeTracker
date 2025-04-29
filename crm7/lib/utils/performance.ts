import { useCallback, useEffect, useRef } from 'react';

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = (): void => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout((): void => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export function useRenderTime(componentName: string): void {
  const startTime = useRef(performance.now());

  useEffect((): void => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  });
}

export function useRenderOptimization<T extends Record<string, unknown>>(
  props: T,
  componentName: string,
): void {
  const prevProps = useRef<T>();

  useEffect(() => {
    if (prevProps.current) {
      const changes = Object.keys(props).filter((key) => prevProps.current?.[key] !== props[key]);
      if (changes.length > 0) {
        console.log(`${componentName} re-rendered due to changes in:`, changes);
      }
    }
    prevProps.current = props;
  });
}

export function useVisibilityOptimization(callback = (): void => {}): void {
  const isVisible = useRef(true);

  const handleVisibilityChange = useCallback((): void => {
    isVisible.current = document.visibilityState === 'visible';
    if (isVisible.current) {
      callback();
    }
  }, [callback]);

  useEffect((): () => void => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return (): void => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}

export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  name: string
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    console.debug(`API call ${name} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`API call ${name} failed after ${duration}ms`, error);
    throw error;
  }
}
