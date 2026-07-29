'use client';

// Catches render errors that escape every other boundary, including ones in
// the root layout. Next replaces the whole document when this renders, so it
// has to supply its own <html>/<body>.

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: '#0A1628', color: '#fff', margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Flow<span style={{ color: '#22C55E', fontStyle: 'italic' }}>X</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '30rem', margin: 0 }}>
            Something went wrong on our end. The team has been notified — please try again.
          </p>
          {error.digest && (
            <code style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              Reference: {error.digest}
            </code>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#22C55E',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a href="/" style={{ color: '#29B6F6', fontSize: '0.875rem' }}>
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
