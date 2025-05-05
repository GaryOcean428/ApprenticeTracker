import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url(),

  // Server
  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().int().positive().default(3001),

  // Redis/KV Store
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  UPSTASH_REDIS_REST_READ_ONLY_TOKEN: z.string().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),

  // FairWork API
  FAIRWORK_API_URL: z.string().url(),
  FAIRWORK_API_KEY: z.string(),

  // Email Configuration
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),

  // Features
  ENABLE_BETA_FEATURES: z.coerce.boolean().default(false),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Cache
  CACHE_TTL: z.coerce.number().int().positive().default(3600),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
