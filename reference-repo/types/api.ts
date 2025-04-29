/**
 * Configuration for retry behavior in HTTP requests
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay between retries in milliseconds */
  initialDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Factor to multiply delay by after each retry attempt */
  backoffFactor: number;
}

/**
 * Standard error response structure
 */
export interface ApiError {
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  status: number;
}

/**
 * Generic API response structure
 */
export interface ApiResponse<T> {
  /** Response data (only present on success) */
  data?: T;
  /** Error information (only present on failure) */
  error?: ApiError;
}
