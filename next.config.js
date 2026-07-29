const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    // Next 14 only runs instrumentation.ts behind this flag (it became the
    // default in Next 15). Without it, server-side Sentry never initialises.
    instrumentationHook: true,
  },
};

// Uploading source maps needs a Sentry auth token. Without one the build still
// succeeds — you just get minified stack traces, which is a fair trade for not
// breaking Vercel builds on a missing secret.
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  // Strip source maps from the client bundle after upload so the public site
  // doesn't serve our original source to anyone who opens devtools.
  hideSourceMaps: true,

  // The SDK ships Replay, canvas recording and debug logging by default. None
  // of it is enabled at runtime (see sentry.client.config.ts), so tree-shake it
  // out rather than making every customer download it — this matters on the
  // mobile connections most FlowX orders come from.
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
    excludeReplayWorker: true,
  },

  // Routes browser events through our own domain, so ad blockers (common here)
  // don't silently swallow error reports before they're sent.
  tunnelRoute: '/monitoring',
};

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig;
