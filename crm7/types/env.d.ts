declare namespace NodeJS {
  interface ProcessEnv {
    // Redis/KV Store
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    UPSTASH_REDIS_REST_READ_ONLY_TOKEN: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_KEY: string;
    SUPABASE_JWT_SECRET: string;

    // FairWork API
    FAIRWORK_API_URL: string;
    FAIRWORK_API_KEY: string;

    // Email Configuration
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;

    // App Config
    NODE_ENV: 'development' | 'test' | 'production';
    APP_URL: string;
    PORT: string;

    // Monitoring
    SENTRY_DSN?: string;
    ANALYTICS_TOKEN?: string;
  }
}
