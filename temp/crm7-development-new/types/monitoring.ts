export enum SpanStatus {
  Ok = 'ok',
  Error = 'error',
  Cancelled = 'cancelled',
  InternalError = 'internal_error',
  Timeout = 'timeout',
}

export interface Span {
  name: string;
  type: string;
  startTime: number;
  duration?: number;
  status?: SpanStatus;
  tags: Map<string, string>;
}

export interface SpanMetrics {
  duration: number;
  status: SpanStatus;
  name: string;
  type: string;
  startTime: number;
  tags: Map<string, string>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
