// Next.js instrumentation hook — picks the right Sentry config per runtime.
// Requires experimental.instrumentationHook in next.config.js on Next 14.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
