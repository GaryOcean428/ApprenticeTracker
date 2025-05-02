/**
 * Cache Service
 * 
 * A simple in-memory cache service for storing API responses and other data
 * that doesn't change frequently. This helps reduce external API calls and
 * improves performance.
 */

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  /**
   * Set a value in the cache with a specific TTL (time to live)
   * 
   * @param key - The cache key
   * @param value - The value to store
   * @param ttl - Time to live in milliseconds (defaults to 1 hour)
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data: value, expiresAt });
  }

  /**
   * Get a value from the cache
   * 
   * @param key - The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    // Return undefined if entry doesn't exist
    if (!entry) return undefined;
    
    // Check if entry has expired
    if (entry.expiresAt < Date.now()) {
      this.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }

  /**
   * Delete a value from the cache
   * 
   * @param key - The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get a value from the cache if it exists, otherwise call the provider
   * function to retrieve it and save it to the cache.
   * 
   * @param key - The cache key
   * @param provider - A function that returns the value or a promise for the value
   * @param ttl - Time to live in milliseconds (defaults to 1 hour)
   * @returns The cached or retrieved value
   */
  async getOrSet<T>(key: string, provider: () => Promise<T> | T, ttl: number = this.defaultTTL): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // If not in cache, call the provider function
    const value = await provider();
    
    // Save to cache
    this.set(key, value, ttl);
    
    return value;
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
