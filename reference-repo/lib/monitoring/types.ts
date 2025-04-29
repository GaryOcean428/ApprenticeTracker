import type { Integration } from '@sentry/types';

export const SpanStatus = {
  Ok: 'ok',
  InternalError: 'internal_error',
  Cancelled: 'cancelled',
  InvalidArgument: 'invalid_argument',
  DeadlineExceeded: 'deadline_exceeded',
  NotFound: 'not_found',
  AlreadyExists: 'already_exists',
  PermissionDenied: 'permission_denied',
  ResourceExhausted: 'resource_exhausted',
  FailedPrecondition: 'failed_precondition',
  Aborted: 'aborted',
  OutOfRange: 'out_of_range',
  Unimplemented: 'unimplemented',
  Unavailable: 'unavailable',
  DataLoss: 'data_loss',
  Unauthenticated: 'unauthenticated',
} as const;

export type SpanStatusType = (typeof SpanStatus)[keyof typeof SpanStatus];

export interface MonitoringSpan {
  name: string;
  type: string;
  startTime: number;
  tags: Map<string, string>;
  status: SpanStatusType;
}

export interface MonitoringOptions {
  dsn: string;
  environment: string;
  release?: string;
  debug?: boolean;
  sampleRate?: number;
  integrations?: Integration[];
}

export interface ErrorMetadata {
  message: string;
  stack?: string;
  name?: string;
  context?: Record<string, unknown>;
}

export interface SpanMetrics {
  duration: number;
  status: SpanStatusType;
  tags: Map<string, string>;
}
