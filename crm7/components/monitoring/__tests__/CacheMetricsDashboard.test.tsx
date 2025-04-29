import { Redis } from '@upstash/redis';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import { CacheWarming } from '@/lib/services/cache/warming';
import { type CacheMetrics } from '@/lib/types/monitoring';
import { CacheMetricsDashboard } from '../CacheMetricsDashboard';
import { CacheService } from '@/lib/services/cache/cache-service';

vi.mock('@/lib/services/cache/monitoring');
vi.mock('@/lib/services/cache/warming');
vi.useFakeTimers();

interface ExtendedCacheMetrics extends CacheMetrics {
  [key: string]: unknown;
}

const mockMetrics: ExtendedCacheMetrics = {
  hits: 100,
  misses: 20,
  errors: 5,
  hitRate: 0.83,
  avgLatencyMs: 50,
  latencyMs: Array.from({ length: 100 }, (_, i) => i + 1),
  memoryUsageBytes: 256 * 1024 * 1024,
  evictions: 10,
  avg: 50,
  p95: 95,
  p99: 99
};

const mockWarmingStats = {
  totalEntries: 50,
  activeEntries: 30,
  entriesByPriority: { 1: 20, 2: 30 },
  isWarming: true,
  nextWarmingIn: 30000,
};

const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  scan: vi.fn(),
  flushdb: vi.fn(),
  flushall: vi.fn(),
  quit: vi.fn(),
  disconnect: vi.fn(),
  duplicate: vi.fn(),
  connect: vi.fn(),
  pipeline: vi.fn(),
  multi: vi.fn(),
  enableTelemetry: vi.fn(),
  enableAutoPipelining: vi.fn(),
  readYourWritesSyncToken: vi.fn(),
  json: {},
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  publish: vi.fn(),
  status: 'ready',
  connected: true,
  commandQueue: [],
  options: {},
  condition: vi.fn(),
  scanStream: vi.fn(),
  scanBuffers: vi.fn(),
  url: '',
  token: '',
  fetch: vi.fn(),
  baseUrl: '',
  automaticDeserialization: true,
  cache: new Map(),
  requestQueue: [],
  retryConfig: { retries: 0, backoff: () => 0 },
} as unknown as Redis;

class MockCacheService extends CacheService {
  constructor() {
    super({
      prefix: 'test',
      ttl: 3600,
    });
  }

  public override getKey = vi.fn();
  public override get = vi.fn();
  public override set = vi.fn();
  public override delete = vi.fn();
  public override deletePattern = vi.fn();
  public override getOrSet = vi.fn();
  public override waitForLock = vi.fn();
  public override clear = vi.fn();
  public override close = vi.fn();
}

const mockCacheService = new MockCacheService();

const cacheWarming = new CacheWarming(mockCacheService, {
  interval: 1000,
  maxConcurrent: 5,
  retryDelay: 100
});

beforeEach(() => {
  vi.spyOn(cacheMonitoring, 'getMetrics').mockReturnValue(mockMetrics);
  vi.spyOn(cacheWarming, 'getStats').mockReturnValue(mockWarmingStats);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CacheMetricsDashboard', () => {
  it('should show loading state initially', () => {
    render(<CacheMetricsDashboard />);
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('should display metrics after loading', async () => {
    render(<CacheMetricsDashboard />);
    await waitFor(() => {
      expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('83.33%')).toBeInTheDocument();
    expect(screen.getByText('Hits: 100')).toBeInTheDocument();
    expect(screen.getByText('Misses: 20')).toBeInTheDocument();
    expect(screen.getByText('256 MB')).toBeInTheDocument();
  });

  it('should calculate and display latency metrics correctly', async () => {
    render(<CacheMetricsDashboard />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Performance'));
    expect(screen.getByText('Average: 50.50ms')).toBeInTheDocument();
    expect(screen.getByText('95th: 95.00ms')).toBeInTheDocument();
    expect(screen.getByText('99th: 99.00ms')).toBeInTheDocument();
  });

  it('should display warming status correctly', async () => {
    render(<CacheMetricsDashboard />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Cache Warming'));
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Next Warming: 30s')).toBeInTheDocument();
    expect(screen.getByText('Total: 50')).toBeInTheDocument();
    expect(screen.getByText('Active: 30')).toBeInTheDocument();
  });

  it('should update metrics periodically', async () => {
    const updatedMetrics = {
      ...mockMetrics,
      hits: 150,
      misses: 30,
    };
    render(<CacheMetricsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Hits: 100')).toBeInTheDocument();
    });
    vi.spyOn(cacheMonitoring, 'getMetrics').mockReturnValue(updatedMetrics);
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('Hits: 150')).toBeInTheDocument();
    });
  });

  it('should handle empty latency data gracefully', async () => {
    const emptyMetrics = {
      ...mockMetrics,
      latencyMs: [],
    };
    vi.spyOn(cacheMonitoring, 'getMetrics').mockReturnValue(emptyMetrics);
    render(<CacheMetricsDashboard />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Performance'));
    expect(screen.getByText('Average: 0.00ms')).toBeInTheDocument();
    expect(screen.getByText('95th: 0ms')).toBeInTheDocument();
    expect(screen.getByText('99th: 0ms')).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = render(<CacheMetricsDashboard />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
