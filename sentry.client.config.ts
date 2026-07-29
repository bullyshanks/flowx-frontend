// Browser-side Sentry. Next 14 loads this file automatically via the Sentry
// webpack plugin (Next 15.3+ would use instrumentation-client.ts instead).
import * as Sentry from '@sentry/nextjs';
import { SENTRY_DSN, sharedOptions } from '@/lib/sentry-shared';

if (SENTRY_DSN) {
  Sentry.init({
    ...sharedOptions,
    // Session Replay is deliberately not enabled. It records the DOM, which on
    // FlowX means delivery addresses, phone numbers and CNIC uploads — enable
    // it only with maskAllText and blockAllMedia, and only if it's worth it.
    integrations: [],
  });
}
