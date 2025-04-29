import { type RedisClientType } from '@/types/redis';
import { createClient } from 'redis';

export class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    }) as RedisClientType;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, serializedValue, { ex: ttl });
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async flushdb(): Promise<void> {
    try {
      const keys = await this.client.keys('*');
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Cache quit error:', error);
    }
  }
}

export const cache = new CacheService();
