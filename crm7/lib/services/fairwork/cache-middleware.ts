import { CacheService } from '../cache/cache-service';
import { type FairWorkApiClient } from './types';
import { logger } from '@/lib/logger';

const TTL_CONFIG = {
  baseRate: 3600, // 1 hour
  classifications: 7200, // 2 hours
  futureRates: 14400, // 4 hours
  allowances: 3600, // 1 hour
  penalties: 3600, // 1 hour
  leaveEntitlements: 7200, // 2 hours
};

const CACHE_CONFIG = {
  prefix: 'fairwork',
  ttl: TTL_CONFIG.baseRate,
};

export class FairWorkCacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FairWorkCacheError';
  }
}

export class FairWorkCacheMiddleware {
  private readonly cache: CacheService;
  private readonly client: FairWorkApiClient;

  constructor(client: FairWorkApiClient) {
    this.client = client;
    this.cache = new CacheService(CACHE_CONFIG);
  }

  private getCacheKey(endpoint: string, params: Record<string, unknown>): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]): number => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join(',');

    return `${endpoint}:${sortedParams}`;
  }

  async getBaseRate<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('base-rate', params);
    return this.cache.getOrSet(key, factory);
  }

  async getClassifications<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('classifications', params);
    return this.cache.getOrSet(key, factory);
  }

  async getFutureRates<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('future-rates', params);
    return this.cache.getOrSet(key, factory);
  }

  async getAllowances<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('allowances', params);
    return this.cache.getOrSet(key, factory);
  }

  async getPenalties<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('penalties', params);
    return this.cache.getOrSet(key, factory);
  }

  async getLeaveEntitlements<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('leave-entitlements', params);
    return this.cache.getOrSet(key, factory);
  }

  async calculateRate<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('calculate-rate', params);
    return this.cache.getOrSet(key, factory);
  }

  async validateRate<T>(params: Record<string, unknown>, factory: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey('validate-rate', params);
    return this.cache.getOrSet(key, factory);
  }

  async invalidateBaseRate(params: Record<string, unknown>): Promise<void> {
    const key = this.getCacheKey('base-rate', params);
    await this.cache.delete(key);
  }

  async invalidateClassifications(params: Record<string, unknown>): Promise<void> {
    const key = this.getCacheKey('classifications', params);
    await this.cache.delete(key);
  }

  async invalidateAwardCache(awardCode: string): Promise<void> {
    const pattern = `${CACHE_CONFIG.prefix}:${awardCode}:*`;
    await this.cache.deletePattern(pattern);
  }

  async close(): Promise<void> {
    await this.cache.close();
  }
}
