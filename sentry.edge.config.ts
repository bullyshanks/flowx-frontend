// Edge runtime Sentry (middleware and edge route handlers).
// Loaded by instrumentation.ts.
import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, sharedOptions } from '@/lib/sentry-shared';

if (SENTRY_DSN) {
  Sentry.init(sharedOptions);
}
