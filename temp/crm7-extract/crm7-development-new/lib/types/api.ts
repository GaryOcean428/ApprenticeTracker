export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  status: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  status: number;
}

export interface ApiContext {
  params: Record<string, string>;
  searchParams?: URLSearchParams;
}
