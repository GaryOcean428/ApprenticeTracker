import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateCache } from '../rate-cache';

describe('RateCache', () => {
  let cache: RateCache;
  
  beforeEach(() => {
    cache = new RateCache();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should store and retrieve values', () => {
    const key = 'test-key';
    const data = { id: 1, name: 'Test Data' };
    
    cache.set(key, data, 1000); // 1 second TTL
    
    const retrieved = cache.get<typeof data>(key);
    expect(retrieved).toEqual(data);
  });
  
  it('should return undefined for non-existent keys', () => {
    const retrieved = cache.get<any>('non-existent-key');
    expect(retrieved).toBeUndefined();
  });
  
  it('should expire items after TTL', () => {
    const key = 'expiring-key';
    const data = { value: 'will expire' };
    
    cache.set(key, data, 1000); // 1 second TTL
    
    // Check immediately - should exist
    expect(cache.get(key)).toEqual(data);
    
    // Advance time beyond TTL
    vi.advanceTimersByTime(1001);
    
    // Should be expired now
    expect(cache.get(key)).toBeUndefined();
  });
  
  it('should use fetcher to get data if not cached', async () => {
    const key = 'fetched-key';
    const data = { id: 2, name: 'Fetched Data' };
    const fetcher = vi.fn().mockResolvedValue(data);
    
    const result = await cache.getOrSet(key, fetcher, 1000);
    
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toEqual(data);
    
    // Fetching again should use cache (fetcher not called again)
    const cachedResult = await cache.getOrSet(key, fetcher, 1000);
    expect(fetcher).toHaveBeenCalledTimes(1); // Still only called once
    expect(cachedResult).toEqual(data);
  });
  
  it('should invalidate specific keys', () => {
    const key1 = 'key-1';
    const key2 = 'key-2';
    
    cache.set(key1, 'value-1', 10000);
    cache.set(key2, 'value-2', 10000);
    
    expect(cache.get(key1)).toBe('value-1');
    expect(cache.get(key2)).toBe('value-2');
    
    cache.invalidate(key1);
    
    expect(cache.get(key1)).toBeUndefined();
    expect(cache.get(key2)).toBe('value-2');
  });
  
  it('should invalidate keys by prefix', () => {
    const prefix = 'user:';
    
    cache.set(`${prefix}1`, 'user 1', 10000);
    cache.set(`${prefix}2`, 'user 2', 10000);
    cache.set('other-key', 'other value', 10000);
    
    const count = cache.invalidateByPrefix(prefix);
    
    expect(count).toBe(2);
    expect(cache.get(`${prefix}1`)).toBeUndefined();
    expect(cache.get(`${prefix}2`)).toBeUndefined();
    expect(cache.get('other-key')).toBe('other value');
  });
  
  it('should clear all cache entries', () => {
    cache.set('key-1', 'value-1', 10000);
    cache.set('key-2', 'value-2', 10000);
    
    expect(cache.getStats().size).toBe(2);
    
    cache.clear();
    
    expect(cache.getStats().size).toBe(0);
    expect(cache.get('key-1')).toBeUndefined();
    expect(cache.get('key-2')).toBeUndefined();
  });
  
  it('should provide stats about the cache', () => {
    cache.set('key-1', 'value-1', 10000);
    cache.set('key-2', 'value-2', 10000);
    
    const stats = cache.getStats();
    
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('key-1');
    expect(stats.keys).toContain('key-2');
  });
});
