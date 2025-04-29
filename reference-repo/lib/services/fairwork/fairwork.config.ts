import { z } from 'zod';

export const FairWorkConfigSchema = z.object({
  // API Configuration
  apiKey: z.string().min(1),
  apiUrl: z.string().url(),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),

  // Request Configuration
  timeout: z.number().min(1000).max(60000).default(30000),
  retryAttempts: z.number().min(0).max(5).default(3),

  // Cache Configuration
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().min(0).max(86400).default(3600), // 1 hour in seconds

  // Rate Limiting
  rateLimit: z.object({
    maxRequests: z.number().min(1).default(100),
    windowMs: z.number().min(1000).default(60000), // 1 minute in milliseconds
  }),
});

export type FairWorkConfig = z.infer<typeof FairWorkConfigSchema>;

export const defaultConfig: FairWorkConfig = {
  apiKey: process.env.FAIRWORK_API_KEY ?? '',
  apiUrl: process.env.FAIRWORK_API_URL ?? 'https://api.fairwork.gov.au/v1',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  timeout: 30000,
  retryAttempts: 3,
  cacheEnabled: true,
  cacheTTL: 3600,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
};
