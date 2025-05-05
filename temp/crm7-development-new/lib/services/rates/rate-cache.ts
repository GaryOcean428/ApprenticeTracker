/**
 * Cache implementation for rates service
 * Provides caching for frequently accessed data
 */
import { logger } from '@/lib/utils/logger';

/**
 * Interface for a cached item with expiration time
 */
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  keys: string[];
  hitCount: number;
  missCount: number;
  hitRate: number;
}

/**
 * Rate Cache service with TTL support
 * Provides in-memory caching for frequently accessed rate data
 */
export class RateCache {
  // Cache storage
  private readonly cache: Map<string, CacheItem<unknown>> = new Map();
  
  // Cache statistics
  private hits: number = 0;
  private misses: number = 0;
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Return undefined if item doesn't exist
    if (!item) {
      this.misses++;
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    
    // Return value
    this.hits++;
    return item.data as T;
  }
  
  /**
   * Store a value in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
    
    logger.debug('Cached rate data', { key, ttlMs });
  }
  
  /**
   * Get or fetch and set a value
   * @param key Cache key
   * @param fetcher Function to fetch data if not in cache
   * @param ttlMs Time to live in milliseconds
   * @returns Retrieved or fetched data
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    
    // Not in cache, fetch fresh data
    logger.debug('Cache miss, fetching data', { key });
    
    try {
      const data = await fetcher();
      this.set(key, data, ttlMs);
      return data;
    } catch (error) {
      logger.error('Error fetching data for cache', { key, error });
      throw error;
    }
  }
  
  /**
   * Invalidate a specific cache key
   * @param key Cache key to invalidate
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Invalidated cache entry', { key });
    }
  }
  
  /**
   * Invalidate all cache keys that start with the given prefix
   * @param prefix Key prefix to invalidate
   * @returns Number of invalidated keys
   */
  invalidateByPrefix(prefix: string): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      logger.debug('Invalidated cache entries by prefix', { prefix, count });
    }
    
    return count;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    logger.debug('Cleared entire cache', { count });
  }
  
  /**
   * Get statistics about the cache
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitCount: this.hits,
      missCount: this.misses,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) : 0
    };
  }
}
