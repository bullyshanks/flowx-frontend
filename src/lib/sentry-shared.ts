// ═══════════════════════════════════════════════════════════
//  Shared Sentry options — used by the client, server and edge configs
// ═══════════════════════════════════════════════════════════
//
// Same convention as the backend: with NEXT_PUBLIC_SENTRY_DSN unset, Sentry is
// completely inert. No account needed, nothing leaves the browser, and local
// development is unaffected.

import type { ErrorEvent, EventHint, BreadcrumbHint, Breadcrumb } from '@sentry/nextjs';

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

const REDACTED = '[redacted]';

// FlowX URLs carry phone numbers (?ref=, tracking lookups) and payment
// references. The path is what makes an error groupable; the query string is
// just PII, so it goes.
export function stripQuery(url?: string): string | undefined {
  if (typeof url !== 'string') return url;
  const i = url.indexOf('?');
  return i === -1 ? url : `${url.slice(0, i)}?${REDACTED}`;
}

// Noise that says nothing about FlowX's own code: browser extensions injecting
// scripts, users going offline mid-request, and the ResizeObserver warning
// every Chrome app emits. Left unfiltered these drown out real defects.
const IGNORED = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'Network Error',
  'Failed to fetch',
  'Load failed',
  'AbortError',
  'top.GLOBALS',
  'chrome-extension://',
  'moz-extension://',
];

export const sharedOptions = {
  dsn: SENTRY_DSN,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    'development',
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,

  // Never opt into automatic PII collection.
  sendDefaultPii: false,

  // Errors only by default — tracing burns quota fast on a free plan.
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0),

  ignoreErrors: IGNORED,

  // Only report errors originating from our own bundle. A third-party script
  // throwing in the same page is not a FlowX bug and can't be fixed here.
  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i, /^moz-extension:\/\//i],

  beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
    if (event.request) {
      event.request.url = stripQuery(event.request.url);
      delete event.request.cookies;
      delete event.request.headers;
      if (event.request.query_string) event.request.query_string = REDACTED;
    }

    // The auth store holds the logged-in user's phone number. An id is enough
    // to identify the account against our own database.
    if (event.user) event.user = { id: event.user.id };

    return event;
  },

  beforeBreadcrumb(breadcrumb: Breadcrumb, _hint?: BreadcrumbHint): Breadcrumb | null {
    // XHR/fetch breadcrumbs record the full request URL, which is how a phone
    // number would sneak in behind the beforeSend scrub above.
    if (breadcrumb.data?.url) breadcrumb.data.url = stripQuery(breadcrumb.data.url);

    // Console breadcrumbs replay whatever we logged, including OTP payloads in
    // the push/debug helpers. Not worth shipping.
    if (breadcrumb.category === 'console') return null;

    return breadcrumb;
  },
};
