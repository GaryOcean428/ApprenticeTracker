import { logger } from '@/lib/services/logger';
import Redis from 'ioredis-mock';
import { mock } from 'jest-mock-extended';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheError, CacheService } from '../cache-service';
import type { RedisClient } from '../redis-client';

vi.mock('@/lib/services/logger');

describe('CacheService', () => {
  let cache: CacheService;
  let redisMock: RedisClient;

  beforeEach(async () => {
    redisMock = new Redis() as unknown as RedisClient;
    cache = new CacheService({ prefix: 'test:', ttl: 3600 });
    await (cache as any)['getClient']();
  });

  afterEach(async () => {
    await cache.close();
    if ('flushall' in redisMock) {
      await (redisMock as unknown as typeof Redis.prototype).flushall();
    }
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      await cache.set(key, value);
      const result = await cache.get(key);
      expect(result).toEqual(value);
    });

    it('should handle JSON parse errors', async () => {
      if ('set' in redisMock) {
        await (redisMock as unknown as typeof Redis.prototype).set('test:invalid-json', 'invalid{json');
      }

      await expect(cache.get('invalid-json')).rejects.toThrow(CacheError);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle Redis connection errors', async () => {
      const mockRedis = mock<RedisClient>();
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));

      // We need to access the private redis property for testing
      (cache as any).redis = mockRedis;

      await expect(cache.get('test-key')).rejects.toThrow(CacheError);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
