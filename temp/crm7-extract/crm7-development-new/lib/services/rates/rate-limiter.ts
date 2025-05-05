import { logger } from '@/lib/utils/logger';

interface RateLimitOptions {
  /** Maximum number of requests allowed within the time window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Whether to throw an error when limit is exceeded (true) or just log a warning (false) */
  strict?: boolean;
}

/**
 * Rate limiter for service operations
 * Can be applied to any method to limit how frequently it can be called
 */
export class RateLimiter {
  private readonly requests: Map<string, number[]> = new Map();
  private readonly options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      strict: true,
      ...options,
    };
  }

  /**
   * Check if the operation is allowed within rate limits
   * @param key - Unique identifier for the operation (e.g., "getTemplates:org123")
   * @returns true if operation is allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Get or initialize request history for this key
    const requests = this.requests.get(key) || [];
    
    // Remove requests outside of the current time window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    const isRateLimited = recentRequests.length >= this.options.limit;
    
    // If not rate limited, add the current request
    if (!isRateLimited) {
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
    } else {
      logger.warn('Rate limit exceeded', {
        key,
        limit: this.options.limit,
        windowMs: this.options.windowMs,
      });
      
      if (this.options.strict) {
        throw new Error(`Rate limit exceeded for operation: ${key}`);
      }
    }
    
    return !isRateLimited;
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }
}
