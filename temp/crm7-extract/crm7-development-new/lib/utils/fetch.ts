import { type RetryConfig } from '@/types/api';
import { logger } from './logger';

const log = logger.createLogger('fetch-utility');

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

const NON_RETRYABLE_ERRORS = new Set(['AbortError', 'TypeError']);

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();

  if (data === null || typeof data !== 'object') {
    throw new Error('Invalid response: Expected an object');
  }

  // At this point TypeScript knows data is a non-null object
  return data as T;
}

export async function fetchWithRetry<T extends Record<string, unknown>>(
  url: string | URL | Request,
  init?: RequestInit & { retry?: Partial<RetryConfig> }
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...init?.retry };
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retryConfig.maxRetries) {
    try {
      const response = await globalThis.fetch(url, init);

      // Don't retry 4xx errors as they are client errors
      if (response.status >= 400 && response.status < 500) {
        return await parseJsonResponse<T>(response);
      }

      if (response.ok || attempt === retryConfig.maxRetries) {
        return await parseJsonResponse<T>(response);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');

      // Don't retry if the request was aborted or if it's a network error
      if (NON_RETRYABLE_ERRORS.has(lastError.name)) {
        throw lastError;
      }
    }

    attempt += 1;
    if (attempt <= retryConfig.maxRetries) {
      const delay = Math.min(
        retryConfig.initialDelay * Math.pow(retryConfig.backoffFactor, attempt - 1),
        retryConfig.maxDelay
      );

      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.href : 'unknown';
      log.warn('Request failed, retrying', {
        url: urlString,
        attempt,
        delay,
        error: lastError,
      });

      await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
