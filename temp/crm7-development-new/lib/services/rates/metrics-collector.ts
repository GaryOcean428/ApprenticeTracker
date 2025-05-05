/**
 * Metrics collector for the rates service
 * Inspired by atomic-crm's approach to metrics and monitoring
 */
import { logger } from '@/lib/utils/logger';

export interface MetricOptions {
  /** Metric labels/tags */
  labels?: Record<string, string | number | boolean>;
  /** Timestamp for the metric, defaults to now */
  timestamp?: Date;
  /** Additional context data */
  context?: Record<string, unknown>;
}

/** 
 * Types of metrics that can be collected 
 */
export enum MetricType {
  /** Count of operations (e.g. template creations, updates) */
  COUNTER = 'counter',
  /** Timing metrics (e.g. operation latency) */
  TIMER = 'timer',
  /** Gauges for point-in-time values (e.g. active templates) */
  GAUGE = 'gauge',
  /** Distribution of values (e.g. rate calculation results) */
  DISTRIBUTION = 'distribution'
}

/**
 * Service for collecting and reporting metrics
 */
export class MetricsCollector {
  private readonly namespace: string;
  private readonly enabled: boolean;

  constructor(namespace: string, enabled = true) {
    this.namespace = namespace;
    this.enabled = enabled;
  }

  /**
   * Increment a counter metric
   * @param name Metric name
   * @param value Amount to increment by (default: 1)
   * @param options Additional metric options
   */
  incrementCounter(name: string, value = 1, options: MetricOptions = {}): void {
    if (!this.enabled) return;

    try {
      const metric = this.formatMetric(name, MetricType.COUNTER, value, options);
      logger.debug('Metric increment', metric);

      // In a real implementation, this would send metrics to a monitoring service
      // await monitoringService.incrementCounter(metric);
    } catch (error) {
      logger.warn('Failed to increment counter metric', { name, value, error });
    }
  }

  /**
   * Record a timing metric
   * @param name Metric name
   * @param valueMs Duration in milliseconds
   * @param options Additional metric options
   */
  recordTimer(name: string, valueMs: number, options: MetricOptions = {}): void {
    if (!this.enabled) return;

    try {
      const metric = this.formatMetric(name, MetricType.TIMER, valueMs, options);
      logger.debug('Metric timer', metric);

      // In a real implementation, this would send metrics to a monitoring service
      // await monitoringService.recordTimer(metric);
    } catch (error) {
      logger.warn('Failed to record timer metric', { name, valueMs, error });
    }
  }

  /**
   * Set a gauge metric
   * @param name Metric name 
   * @param value Current value
   * @param options Additional metric options
   */
  setGauge(name: string, value: number, options: MetricOptions = {}): void {
    if (!this.enabled) return;

    try {
      const metric = this.formatMetric(name, MetricType.GAUGE, value, options);
      logger.debug('Metric gauge', metric);

      // In a real implementation, this would send metrics to a monitoring service
      // await monitoringService.setGauge(metric);
    } catch (error) {
      logger.warn('Failed to set gauge metric', { name, value, error });
    }
  }

  /**
   * Record a distribution value
   * @param name Metric name
   * @param value Value to add to the distribution
   * @param options Additional metric options
   */
  recordDistribution(name: string, value: number, options: MetricOptions = {}): void {
    if (!this.enabled) return;

    try {
      const metric = this.formatMetric(name, MetricType.DISTRIBUTION, value, options);
      logger.debug('Metric distribution', metric);

      // In a real implementation, this would send metrics to a monitoring service
      // await monitoringService.recordDistribution(metric);
    } catch (error) {
      logger.warn('Failed to record distribution metric', { name, value, error });
    }
  }

  /**
   * Time an async function execution
   * @param name Metric name
   * @param fn Function to time
   * @param options Additional metric options
   * @returns The value returned by the function
   */
  async timeAsync<T>(
    name: string,
    fn: () => Promise<T>,
    options: MetricOptions = {}
  ): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    const startTime = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - startTime;
      this.recordTimer(name, duration, options);
    }
  }

  /**
   * Format a metric for monitoring
   */
  private formatMetric(
    name: string,
    type: MetricType,
    value: number,
    options: MetricOptions
  ): Record<string, unknown> {
    return {
      name: `${this.namespace}.${name}`,
      type,
      value,
      timestamp: options.timestamp ?? new Date(),
      labels: {
        service: 'rates-service',
        environment: process.env.NODE_ENV ?? 'development',
        ...options.labels
      },
      context: options.context
    };
  }
}
