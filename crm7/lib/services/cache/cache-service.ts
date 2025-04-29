import { Redis } from '@upstash/redis';
import { cacheMonitoring } from './monitoring';
import { logger } from '@/lib/logger';

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export class CacheTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheTimeoutError';
  }
}

export interface CacheServiceConfig {
  prefix: string;
  ttl: number;
}

export class CacheService {
  private redis: Redis;
  private prefix: string;
  private ttl: number;

  constructor(config: CacheServiceConfig) {
    this.prefix = config.prefix;
    this.ttl = config.ttl;
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  protected getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    try {
      const value = await this.redis.get<T>(this.getKey(key));
      const latencyMs = Date.now() - startTime;

      if (!value) {
        cacheMonitoring.recordMiss(latencyMs);
        return null;
      }

      cacheMonitoring.recordHit(latencyMs);
      return value;
    } catch (error) {
      logger.error('Cache get error:', { error, key });
      throw new CacheError(`Failed to get cache key ${key}`);
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const startTime = Date.now();
    try {
      await this.redis.set(this.getKey(key), value, { ex: this.ttl });
      const latencyMs = Date.now() - startTime;
      cacheMonitoring.recordSet(latencyMs);
    } catch (error) {
      logger.error('Cache set error:', { error, key });
      throw new CacheError(`Failed to set cache key ${key}`);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(key));
    } catch (error) {
      logger.error('Cache delete error:', { error, key });
      throw new CacheError(`Failed to delete cache key ${key}`);
    }
  }

  public async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.getKey(pattern)}*`);
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error('Cache delete pattern error:', { error, pattern });
      throw new CacheError(`Failed to delete cache pattern ${pattern}`);
    }
  }

  public async getOrSet<T>(
    key: string,
    getter: () => Promise<T>
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const value = await getter();
      await this.set(key, value);
      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', { error, key });
      throw new CacheError(`Failed to get or set cache key ${key}`);
    }
  }

  public async waitForLock(key: string, maxWaitMs = 5000): Promise<void> {
    const startTime = Date.now();
    while (await this.get(key)) {
      if (Date.now() - startTime > maxWaitMs) {
        throw new CacheTimeoutError(`Timeout waiting for lock on key ${key}`);
      }
      await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 100));
    }
  }

  public async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache clear error:', { error });
      throw new CacheError('Failed to clear cache');
    }
  }

  public async close(): Promise<void> {
    // No need to explicitly close Redis connection as it's REST-based
  }
}
