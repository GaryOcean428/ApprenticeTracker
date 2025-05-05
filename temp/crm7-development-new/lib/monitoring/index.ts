import type { Breadcrumb } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/config/environment';
import { type MonitoringOptions, type MonitoringSpan, type ErrorMetadata, SpanStatus, type SpanStatusType } from './types';

function toErrorMetadata(error: unknown): ErrorMetadata {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: 'context' in error ? (error as { context?: Record<string, unknown> }).context : undefined
    };
  }
  return {
    message: String(error),
    name: 'Unknown Error'
  };
}

export function initializeMonitoring(options: MonitoringOptions): void {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment,
    release: options.release,
    debug: options.debug ?? env.NODE_ENV === 'development',
    tracesSampleRate: options.sampleRate ?? 1.0,
    integrations: options.integrations ?? [],
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const metadata = toErrorMetadata(error);
  
  Sentry.captureException(error instanceof Error ? error : new Error(metadata.message), {
    ...context,
    ...metadata.context,
  });
}

export function startSpan(
  name: string, 
  type: string, 
  data?: Record<string, unknown>
): MonitoringSpan {
  const span: MonitoringSpan = {
    name,
    type,
    startTime: Date.now(),
    tags: new Map(),
    status: SpanStatus.Ok
  };

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  return span;
}

export function finishSpan(
  span: MonitoringSpan,
  status: SpanStatusType = SpanStatus.Ok,
  data?: Record<string, unknown>
): void {
  const duration = Date.now() - span.startTime;
  span.status = status;
  span.tags.set('duration', String(duration));

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      span.tags.set(key, String(value));
    });
  }

  const breadcrumb: Breadcrumb = {
    category: 'monitoring',
    message: `Span ${span.name} finished`,
    data: {
      type: span.type,
      duration,
      status,
      ...Object.fromEntries(span.tags)
    },
    level: status === SpanStatus.Ok ? 'info' : 'error'
  };

  Sentry.addBreadcrumb(breadcrumb);
}
