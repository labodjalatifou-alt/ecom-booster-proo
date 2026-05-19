self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || '',
        icon: '/icon-192.png',
        tag: 'shopify-order',
        renotify: true,
        vibrate: [300, 110, 300, 110, 300, 110, 300],
        silent: false, // Laisse jouer le son système de notification
        requireInteraction: true,
        data: {
          url: data.url || '/commandes'
        }
      };
      event.waitUntil(
        self.registration.showNotification(data.title || 'Ecom Booster Pro', options)
      );
    } catch (err) {
      console.error('Error parsing push event data as JSON:', err);
      const text = event.data.text();
      event.waitUntil(
        self.registration.showNotification('Ecom Booster Pro', {
          body: text,
          icon: '/icon-192.png',
          tag: 'shopify-order',
          renotify: true,
          vibrate: [300, 110, 300, 110, 300, 110, 300],
          silent: false,
          requireInteraction: true,
          data: { url: '/commandes' }
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/commandes';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(windowClients) {
        // If there's an open tab, focus it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          const clientPath = new URL(client.url).pathname;
          if (clientPath === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
