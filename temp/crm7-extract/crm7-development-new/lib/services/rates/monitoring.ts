/**
 * Rate Service Monitoring
 * 
 * Provides distributed tracing and performance monitoring for 
 * the rates service operations
 */
import { logger } from '@/lib/utils/logger';
import type { MetricsCollector } from './metrics-collector';

/**
 * Status of a completed span
 */
export enum SpanStatus {
  Ok = 'ok',
  Error = 'error',
  Cancelled = 'cancelled'
}

/**
 * Monitoring span information
 */
export interface MonitoringSpan {
  id: string;
  parentId?: string;
  operation: string;
  category: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: SpanStatus;
  attributes: Record<string, unknown>;
}

/**
 * Rate service monitoring service
 * Integrates with metrics collector and tracing systems
 */
export class RateServiceMonitoring {
  private spanIdCounter = 0;
  private readonly activeSpans = new Map<string, MonitoringSpan>();
  private completedSpans: MonitoringSpan[] = [];
  private readonly metricsCollector: MetricsCollector;
  
  constructor(metricsCollector: MetricsCollector) {
    this.metricsCollector = metricsCollector;
  }
  
  /**
   * Start a monitoring span for an operation
   */
  startSpan(
    operation: string,
    category: string,
    attributes: Record<string, unknown> = {}
  ): string {
    const spanId = this.generateSpanId();
    
    const span: MonitoringSpan = {
      id: spanId,
      operation,
      category,
      startTime: Date.now(),
      attributes
    };
    
    this.activeSpans.set(spanId, span);
    
    logger.debug('Started monitoring span', {
      spanId,
      operation,
      category,
      attributes
    });
    
    return spanId;
  }
  
  /**
   * Complete a monitoring span
   */
  finishSpan(
    spanId: string,
    status: SpanStatus = SpanStatus.Ok,
    additionalAttributes: Record<string, unknown> = {}
  ): void {
    const span = this.activeSpans.get(spanId);
    
    if (!span) {
      logger.warn('Attempted to finish unknown span', { spanId });
      return;
    }
    
    // Complete the span
    const now = Date.now();
    span.endTime = now;
    span.duration = now - span.startTime;
    span.status = status;
    span.attributes = {
      ...span.attributes,
      ...additionalAttributes
    };
    
    // Record metrics
    this.metricsCollector.recordTimer(
      `span.${span.category}.${span.operation}`,
      span.duration,
      { labels: span.attributes }
    );
    
    if (status === SpanStatus.Error) {
      this.metricsCollector.incrementCounter(
        `error.${span.category}.${span.operation}`,
        1,
        { labels: span.attributes }
      );
    }
    
    // Move from active to completed
    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);
    
    // Limit completed spans history
    if (this.completedSpans.length > 100) {
      this.completedSpans.shift();
    }
    
    logger.debug('Finished monitoring span', {
      spanId,
      operation: span.operation,
      duration: span.duration,
      status
    });
  }
  
  /**
   * Create a child span with a parent relationship
   */
  startChildSpan(
    parentSpanId: string,
    operation: string,
    category: string,
    attributes: Record<string, unknown> = {}
  ): string {
    const parentSpan = this.activeSpans.get(parentSpanId);
    
    if (!parentSpan) {
      logger.warn('Attempted to create child span with unknown parent', {
        parentSpanId
      });
      return this.startSpan(operation, category, attributes);
    }
    
    const spanId = this.generateSpanId();
    
    const span: MonitoringSpan = {
      id: spanId,
      parentId: parentSpanId,
      operation,
      category,
      startTime: Date.now(),
      attributes
    };
    
    this.activeSpans.set(spanId, span);
    
    logger.debug('Started child monitoring span', {
      spanId,
      parentSpanId,
      operation,
      category
    });
    
    return spanId;
  }
  
  /**
   * Get all active spans
   */
  getActiveSpans(): MonitoringSpan[] {
    return Array.from(this.activeSpans.values());
  }
  
  /**
   * Get recently completed spans
   */
  getRecentSpans(limit: number = 20): MonitoringSpan[] {
    return this.completedSpans.slice(-limit);
  }
  
  /**
   * Clear span history
   */
  clearHistory(): void {
    this.completedSpans = [];
  }
  
  /**
   * Generate a unique span ID
   */
  private generateSpanId(): string {
    this.spanIdCounter += 1;
    return `span_${Date.now()}_${this.spanIdCounter}`;
  }
}
