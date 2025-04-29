import { logger } from '@/lib/services/logger';

export class CacheMonitoring {
  private hits = 0;
  private misses = 0;
  private errors = 0;
  private evictions = 0;
  private latencySamples: number[] = [];
  private readonly maxLatencySamples = 1000;
  private memoryUsageBytes = 0;
  private readonly reportInterval = 60_000; // 1 minute

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.reportMetrics(), this.reportInterval);
    }
  }

  recordHit(latencyMs: number): void {
    this.hits++;
    this.recordLatency(latencyMs);
  }

  recordMiss(latencyMs: number): void {
    this.misses++;
    this.recordLatency(latencyMs);
  }

  recordError(): void {
    this.errors++;
  }

  recordEviction(): void {
    this.evictions++;
  }

  recordSet(latencyMs: number): void {
    this.recordLatency(latencyMs);
  }

  private recordLatency(latencyMs: number): void {
    if (this.latencySamples.length >= this.maxLatencySamples) {
      this.latencySamples.shift();
    }
    this.latencySamples.push(latencyMs);
  }

  getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const avgLatencyMs = this.latencySamples.length > 0
      ? this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length
      : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      evictions: this.evictions,
      hitRate,
      avgLatencyMs,
      memoryUsageBytes: this.memoryUsageBytes,
    };
  }

  private reportMetrics(): void {
    const metrics = this.getMetrics();
    logger.info('Cache metrics report:', metrics);
    this.reset();
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.evictions = 0;
    this.latencySamples = [];
  }

  updateMemoryUsage(bytes: number): void {
    this.memoryUsageBytes = bytes;
  }
}

export interface CacheMetrics extends Record<string, unknown> {
  hits: number;
  misses: number;
  errors: number;
  evictions: number;
  hitRate: number;
  avgLatencyMs: number;
  memoryUsageBytes: number;
}

export const cacheMonitoring = new CacheMonitoring();
