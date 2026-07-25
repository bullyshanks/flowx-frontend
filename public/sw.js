// ── Minimal service worker: just enough to show Web Push notifications ──
// No offline caching / PWA scope here on purpose — this exists solely to
// receive push events, keeping the diff small (see push.service.js on the
// backend for why Web Push over Firebase).

self.addEventListener('push', (event) => {
  let payload = { title: 'FlowX', body: '' };
  try {
    payload = event.data ? event.data.json() : payload;
  } catch {
    payload.body = event.data ? event.data.text() : '';
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'FlowX', {
      body: payload.body || '',
      data: payload.data || {},
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
