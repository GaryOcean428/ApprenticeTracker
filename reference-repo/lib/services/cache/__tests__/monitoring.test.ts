import { logger } from '@/lib/services/logger';
import { CacheMonitoring } from '../monitoring';

jest.mock('@/lib/services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.useFakeTimers();

describe('CacheMonitoring', () => {
  let monitoring: CacheMonitoring;

  beforeEach(() => {
    jest.clearAllMocks();
    monitoring = new CacheMonitoring();
  });

  describe('Metrics Recording', () => {
    it('should record cache hits with latency', () => {
      monitoring.recordHit(1.5);
      const metrics = monitoring.getMetrics();

      expect(metrics.hits).toBe(1);
      expect(metrics.avgLatencyMs).toBe(1.5);
    });

    it('should record cache misses', () => {
      monitoring.recordMiss(2.0);
      const metrics = monitoring.getMetrics();

      expect(metrics.misses).toBe(1);
      expect(metrics.avgLatencyMs).toBe(2.0);
    });

    it('should record errors', () => {
      monitoring.recordError();
      const metrics = monitoring.getMetrics();

      expect(metrics.errors).toBe(1);
    });

    it('should record evictions', () => {
      monitoring.recordEviction();
      const metrics = monitoring.getMetrics();

      expect(metrics.evictions).toBe(1);
    });

    it('should calculate average latency correctly', () => {
      monitoring.recordHit(1.0);
      monitoring.recordHit(2.0);
      monitoring.recordHit(3.0);

      const metrics = monitoring.getMetrics();
      expect(metrics.avgLatencyMs).toBe(2.0);
    });
  });

  describe('Metrics Reporting', () => {
    it('should report metrics periodically', () => {
      // Record some metrics
      monitoring.recordHit(1.0);
      monitoring.recordHit(2.0);
      monitoring.recordMiss(1.5);
      monitoring.recordError();

      // Advance time to trigger reporting
      jest.advanceTimersByTime(60_000); // 1 minute

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          hits: 2,
          misses: 1,
          errors: 1,
          hitRate: 0.6667,
          avgLatencyMs: 1.5,
        })
      );
    });

    it('should reset metrics after reporting', () => {
      monitoring.recordHit(1.0);
      monitoring.recordMiss(1.5);

      // Trigger report
      jest.advanceTimersByTime(60_000);

      // Record new metrics
      monitoring.recordHit(2.0);
      const metrics = monitoring.getMetrics();

      // Should only contain metrics after reset
      expect(metrics.hits).toBe(1);
      expect(metrics.misses).toBe(0);
      expect(metrics.avgLatencyMs).toBe(2.0);
    });
  });

  describe('Memory Usage Tracking', () => {
    it('should track memory usage', () => {
      monitoring.updateMemoryUsage(1024 * 1024); // 1MB
      const metrics = monitoring.getMetrics();
      expect(metrics.memoryUsageBytes).toBe(1024 * 1024);
    });

    it('should update memory usage on each report', () => {
      monitoring.updateMemoryUsage(1024 * 1024); // 1MB
      jest.advanceTimersByTime(60_000);

      expect(logger.info).toHaveBeenCalledWith(
        'Cache metrics report:',
        expect.objectContaining({
          memoryUsageBytes: 1024 * 1024,
        })
      );
    });
  });

  describe('Hit Rate Calculation', () => {
    it('should calculate correct hit rate', () => {
      monitoring.recordHit(1.0);
      monitoring.recordHit(1.0);
      monitoring.recordHit(1.0);
      monitoring.recordMiss(1.0);

      const metrics = monitoring.getMetrics();
      expect(metrics.hitRate).toBe(0.75); // 3 hits out of 4 requests
    });

    it('should handle zero requests gracefully', () => {
      const metrics = monitoring.getMetrics();
      expect(metrics.hitRate).toBe(0);
    });
  });
});
