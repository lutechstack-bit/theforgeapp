/* Push handlers layered onto the Workbox-generated service worker via
 * workbox.importScripts. Keep this dependency-free — it runs in the SW scope. */

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'the Forge', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'the Forge';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: payload.image || undefined,
    tag: payload.tag || undefined,
    data: { url: payload.url || payload.deep_link || '/', deliveryId: payload.deliveryId || null },
    requireInteraction: !!payload.requireInteraction,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
