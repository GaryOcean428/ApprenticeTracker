import * as Sentry from '@sentry/nextjs';
import type { EdgeOptions } from '@sentry/nextjs';

const config: EdgeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
};

Sentry.init(config);
