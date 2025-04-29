import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

export class RedisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedisError';
  }
}

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  del(...keys: string[]): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

export class RedisClientImpl implements RedisClient {
  private client: Redis | null = null;
  private connecting = false;
  private readonly maxRetries = 3;
  private retryCount = 0;

  constructor(private readonly config: Record<string, unknown>) {}

  private async connect(): Promise<void> {
    if (this.client) return;
    if (this.connecting) {
      while (this.connecting && !this.client) {
        await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.connecting = true;
      this.retryCount++;

      const redis = new Redis(this.config);

      redis.on('error', (error): void => {
        logger.error('Redis connection error:', { error: error instanceof Error ? error.message : String(error) });
      });

      this.client = redis;
      this.connecting = false;
      this.retryCount = 0;
    } catch (error) {
      this.connecting = false;
      logger.error('Redis connection failed:', { error: error instanceof Error ? error.message : String(error) });

      if (this.retryCount < this.maxRetries) {
        await this.connect();
      } else {
        throw new RedisError('Failed to connect to Redis after max retries');
      }
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect();
    if (!this.client) throw new RedisError('Redis client not initialized');
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.connect();
    if (!this.client) throw new RedisError('Redis client not initialized');
    await this.client.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.connect();
    if (!this.client) throw new RedisError('Redis client not initialized');
    await this.client.setex(key, seconds, value);
  }

  async del(...keys: string[]): Promise<void> {
    await this.connect();
    if (!this.client) throw new RedisError('Redis client not initialized');
    await this.client.del(...keys);
  }

  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    if (!this.client) throw new RedisError('Redis client not initialized');
    return this.client.keys(pattern);
  }
}
