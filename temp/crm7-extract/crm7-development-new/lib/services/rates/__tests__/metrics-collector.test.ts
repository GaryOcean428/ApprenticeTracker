import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetricsCollector, MetricType } from '../metrics-collector';

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('MetricsCollector', () => {
  let collector: MetricsCollector;
  const namespace = 'test.metrics';
  
  beforeEach(() => {
    collector = new MetricsCollector(namespace, true);
    vi.resetAllMocks();
  });
  
  it('should create a metrics collector', () => {
    expect(collector).toBeInstanceOf(MetricsCollector);
  });
  
  it('should increment counters', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.incrementCounter('test.counter', 5);
    
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric increment', 
      expect.objectContaining({
        name: 'test.metrics.test.counter',
        type: 'counter',
        value: 5
      })
    );
  });
  
  it('should record timers', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.recordTimer('request.duration', 150);
    
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric timer', 
      expect.objectContaining({
        name: 'test.metrics.request.duration',
        type: 'timer',
        value: 150
      })
    );
  });
  
  it('should set gauges', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.setGauge('active.users', 42);
    
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric gauge', 
      expect.objectContaining({
        name: 'test.metrics.active.users',
        type: 'gauge',
        value: 42
      })
    );
  });
  
  it('should record distributions', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.recordDistribution('response.size', 2048);
    
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric distribution', 
      expect.objectContaining({
        name: 'test.metrics.response.size',
        type: 'distribution',
        value: 2048
      })
    );
  });
  
  it('should include labels in metrics', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.incrementCounter('test.counter', 1, {
      labels: { region: 'us-east', service: 'api' }
    });
    
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric increment', 
      expect.objectContaining({
        name: 'test.metrics.test.counter',
        labels: expect.objectContaining({
          region: 'us-east',
          service: 'api'
        })
      })
    );
  });
  
  it('should time async functions', async () => {
    const { logger } = require('@/lib/utils/logger');
    const mockFn = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    });
    
    const result = await collector.timeAsync('test.async', mockFn);
    
    expect(result).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith(
      'Metric timer', 
      expect.objectContaining({
        name: 'test.metrics.test.async',
        type: 'timer'
      })
    );
  });
  
  it('should do nothing when disabled', () => {
    const { logger } = require('@/lib/utils/logger');
    const disabledCollector = new MetricsCollector(namespace, false);
    
    disabledCollector.incrementCounter('test.counter', 1);
    disabledCollector.recordTimer('test.timer', 100);
    disabledCollector.setGauge('test.gauge', 42);
    disabledCollector.recordDistribution('test.dist', 100);
    
    expect(logger.debug).not.toHaveBeenCalled();
  });
  
  it('should properly format metrics', () => {
    const { logger } = require('@/lib/utils/logger');
    
    collector.incrementCounter('test.counter', 1);
    
    const lastCall = logger.debug.mock.calls[0][1];
    
    expect(lastCall.name).toBe('test.metrics.test.counter');
    expect(lastCall.type).toBe(MetricType.COUNTER);
    expect(lastCall.value).toBe(1);
    expect(lastCall.timestamp).toBeInstanceOf(Date);
    expect(lastCall.labels).toEqual(expect.objectContaining({
      service: 'rates-service',
      environment: expect.any(String)
    }));
  });
});
