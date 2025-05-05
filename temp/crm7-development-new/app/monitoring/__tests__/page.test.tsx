import type { CacheMetrics } from '@/lib/services/cache/monitoring';
import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MonitoringPage from '@/app/monitoring/page';

vi.mock('@/lib/services/cache/monitoring');

describe('MonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders monitoring metrics', () => {
    const mockMetrics: CacheMetrics = {
      hits: 75,
      misses: 25,
      errors: 0,
      evictions: 0,
      hitRate: 0.75,
      avgLatencyMs: 20,
      memoryUsageBytes: 1024,
      totalRequests: 100,
      latency: {
        avg: '20.00ms',
        p95: '100.00ms',
        p99: '150.00ms',
      }
    };

    vi.mocked(cacheMonitoring.getMetrics).mockReturnValue(mockMetrics);
    render(<MonitoringPage />);
    expect(screen.getByText('Cache Hit Rate: 75.00%')).toBeInTheDocument();
    expect(screen.getByText('Total Requests: 100')).toBeInTheDocument();
    expect(screen.getByText('Average Latency: 20.00ms')).toBeInTheDocument();
  });
});
