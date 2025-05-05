import { SpanStatus, type SpanStatusType } from './types';
import type { ErrorMetadata, SpanMetrics } from './types';

function toErrorMetadata(maybeError: unknown): ErrorMetadata {
  if (maybeError instanceof Error) {
    return {
      message: maybeError.message,
      stack: maybeError.stack,
      name: maybeError.name
    };
  }
  return {
    message: String(maybeError),
    name: 'Unknown Error'
  };
}

function startBrowserSpan(name: string, type: string, tags?: Record<string, string>): SpanMetrics {
  const span: SpanMetrics = {
    duration: 0,
    status: SpanStatus.Ok,
    tags: new Map<string, string>()
  };

  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

function finishBrowserSpan(
  span: SpanMetrics,
  status: SpanStatusType = SpanStatus.Ok,
  data?: Record<string, unknown>
): SpanMetrics {
  span.status = status;

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

export function monitorWebVitals(name: string): { 
  finish: (status: SpanStatusType, data?: Record<string, unknown>) => SpanMetrics;
  error: (err: unknown) => SpanMetrics;
} {
  const span = startBrowserSpan(name, 'web.vitals');

  return {
    finish: (status: SpanStatusType, data?: Record<string, unknown>): SpanMetrics => {
      return finishBrowserSpan(span, status, data);
    },
    error: (err: unknown): SpanMetrics => {
      return finishBrowserSpan(span, SpanStatus.InternalError, {
        error: toErrorMetadata(err)
      });
    }
  };
}

export function monitorBrowserPerformance(
  name: string,
  tags?: Record<string, string>
): {
  finish: () => SpanMetrics;
  error: (err: unknown) => SpanMetrics;
} {
  const span = startBrowserSpan(name, 'browser.performance', tags);

  return {
    finish: (): SpanMetrics => finishBrowserSpan(span, SpanStatus.Ok),
    error: (err: unknown): SpanMetrics => finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err)
    })
  };
}

export function monitorUserInteraction(
  name: string,
  tags?: Record<string, string>
): {
  finish: () => SpanMetrics;
  error: (err: unknown) => SpanMetrics;
} {
  const span = startBrowserSpan(name, 'user.interaction', tags);

  return {
    finish: (): SpanMetrics => finishBrowserSpan(span, SpanStatus.Ok),
    error: (err: unknown): SpanMetrics => finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err)
    })
  };
}

export function monitorHttpRequest(
  name: string,
  tags?: Record<string, string>
): {
  finish: () => SpanMetrics;
  error: (err: unknown) => SpanMetrics;
} {
  const span = startBrowserSpan(name, 'http.client', tags);

  return {
    finish: (): SpanMetrics => finishBrowserSpan(span, SpanStatus.Ok),
    error: (err: unknown): SpanMetrics => finishBrowserSpan(span, SpanStatus.InternalError, {
      error: toErrorMetadata(err)
    })
  };
}
