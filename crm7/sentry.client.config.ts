import * as Sentry from '@sentry/nextjs';
import type { BrowserOptions } from '@sentry/nextjs';

const config: BrowserOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

Sentry.init(config);
