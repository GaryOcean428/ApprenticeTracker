import { SpanStatus } from '@/types/monitoring';

interface ErrorMetadata {
  message: string;
  stack?: string;
  name?: string;
}

interface PerformanceSpan {
  name: string;
  type: string;
  startTime: number;
  tags: Map<string, string>;
}

function toErrorMetadata(maybeError: unknown): ErrorMetadata {
  const message = typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError);

  return {
    message,
    name: maybeError instanceof Error ? maybeError.name : 'Unknown Error',
    stack: new Error(message).stack,
  };
}

function startPerformanceSpan(name: string, type: string, tags?: Record<string, string>): PerformanceSpan {
  const span: PerformanceSpan = {
    name,
    type,
    startTime: performance.now(),
    tags: new Map(),
  };

  if (typeof tags !== "undefined" && tags !== null) {
    Object.entries(tags).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

function finishPerformanceSpan(
  span: PerformanceSpan,
  status: SpanStatus,
  data?: {
    error?: ErrorMetadata;
    [key: string]: unknown;
  }
): void {
  const duration = performance.now() - span.startTime;
  span.tags.set('duration', String(duration));
  span.tags.set('status', status);

  if (typeof data !== "undefined" && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }
}

export function recordNavigationTiming(): void {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigationEntry) {
    return;
  }

  const metrics = {
    'navigation.dns': navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
    'navigation.tcp': navigationEntry.connectEnd - navigationEntry.connectStart,
    'navigation.ttfb': navigationEntry.responseStart - navigationEntry.requestStart,
    'navigation.response': navigationEntry.responseEnd - navigationEntry.responseStart,
    'navigation.dom': navigationEntry.domComplete - navigationEntry.domInteractive,
    'navigation.load': navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
  };

  const span = startPerformanceSpan('navigation', 'performance');

  try {
    Object.entries(metrics).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
    finishPerformanceSpan(span, SpanStatus.Ok);
  } catch (error) {
    finishPerformanceSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(error),
    });
  }
}

export function recordResourceTiming(): void {
  const span = startPerformanceSpan('resources', 'performance');

  try {
    setTimeout(() => {
      const resourceEntries = performance.getEntriesByType('resource');
      Object.entries(resourceEntries).forEach(([key, value]) => {
        span.tags.set(key, String(value));
      });
      finishPerformanceSpan(span, SpanStatus.Ok);
    }, 0);
  } catch (error) {
    finishPerformanceSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(error),
    });
  }
}

export function monitorFunction(
  name: string,
  tags?: Record<string, string>
) {
  const span = startPerformanceSpan(name, 'function', tags);

  return {
    finish: (): void => {
      finishPerformanceSpan(span, SpanStatus.Ok);
    },
    error: (err: unknown): void => {
      finishPerformanceSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}

export function monitorMeasurement(
  name: string,
  tags?: Record<string, string>
) {
  const span = startPerformanceSpan(name, 'measurement', tags);

  return {
    finish: (): void => {
      finishPerformanceSpan(span, SpanStatus.Ok);
    },
    error: (err: unknown): void => {
      finishPerformanceSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err),
      });
    },
  };
}
