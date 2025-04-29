export interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
  avgLatencyMs: number;
  latencyMs: number[];
  memoryUsageBytes: number;
  evictions: number;
  avg: number;
  p95: number;
  p99: number;
}

import type { PerformanceAction, PerformanceState } from '@/lib/reducers/performance';
import type { Dispatch } from 'react';

export interface PerformanceContextType {
  state: PerformanceState;
  dispatch: Dispatch<PerformanceAction>;
}

export interface CacheService {
  redis: any | null;
  prefix: string;
  ttl: number;
  getKey: (key: string) => string;
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  del: (key: string) => Promise<void>;
  deletePattern: (pattern: string) => Promise<void>;
  getOrSet: (key: string, getter: () => Promise<any>) => Promise<any>;
  waitForLock: (key: string, timeout?: number) => Promise<void>;
  clear: () => Promise<void>;
  close: () => Promise<void>;
}

export interface WarmingStats {
  count: number;
  // Add additional properties if needed
}

export interface PerformanceMetrics {
  pageLoadStats: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  memoryStats: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  networkRequestStats: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
}
