import { Redis } from 'ioredis';

export type RedisClientType = Redis;

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}
