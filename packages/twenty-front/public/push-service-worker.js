// Plain JS: files in public/ are served as-is and never go through Vite.
const DEFAULT_ICON = '/images/icons/acs-logo.png';

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Twenty';
  const options = {
    body: payload.body || '',
    tag: payload.tag || undefined,
    icon: DEFAULT_ICON,
    badge: DEFAULT_ICON
  };

  if (payload.url) {
    options.data = { url: payload.url }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existingClient = windowClients.find(
          (client) => new URL(client.url).origin === self.location.origin,
        );

        if (existingClient) {
          if ('navigate' in existingClient) {
            existingClient.navigate(targetUrl);
          }

          return existingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
