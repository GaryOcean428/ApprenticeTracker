import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .preprocess(v => (typeof v === 'string' ? Number(v) : v), z.number().int().positive())
    .default(5000),
  DATABASE_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().default('uploads'),
  FAIRWORK_API_URL: z.string().url().optional(),
  FAIRWORK_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production');
}

export function assertEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please ensure all required variables are set in Railway dashboard or .env file'
    );
  }
}

export { env };
