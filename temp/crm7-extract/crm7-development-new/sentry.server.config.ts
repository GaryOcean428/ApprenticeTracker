import * as Sentry from '@sentry/nextjs';
import type { NodeOptions } from '@sentry/nextjs';

const config: NodeOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
};

Sentry.init(config);
