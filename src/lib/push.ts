// ── Web Push registration ──
// Registers public/sw.js, requests notification permission, subscribes via
// PushManager, and posts the subscription to the backend. Safe to call
// repeatedly (e.g. on every layout mount) — it no-ops if permission was
// already denied, and re-subscribing with the same keys is idempotent on
// both the browser and backend side (upsert by endpoint).

import { notificationsApi } from './services';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Every bail-out below is a legitimate no-op in production, but silently
// giving up makes "push just isn't working" impossible to diagnose. Log the
// reason in dev only, so the console says which step stopped it.
const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') console.warn('[push]', ...args);
};

export async function registerPush(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return debug('unsupported browser — no serviceWorker/PushManager');
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return debug('NEXT_PUBLIC_VAPID_PUBLIC_KEY is unset — restart dev server after editing .env.local');
  }

  try {
    if (Notification.permission === 'denied') return debug('permission denied');
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return debug('permission not granted:', permission);
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return debug('subscription missing endpoint/keys', json);
    }

    await notificationsApi.subscribe({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
    debug('subscribed OK:', json.endpoint);
  } catch (err) {
    // Best-effort — a customer declining the permission prompt, an
    // unsupported browser, or a transient network error should never
    // break the page it was called from.
    debug('failed:', err);
  }
}
