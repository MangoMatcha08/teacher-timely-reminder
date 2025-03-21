
// Service worker for Teacher Timely Reminder PWA
const CACHE_NAME = 'teacher-reminder-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker and cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Don't cache responses that aren't successful
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Add the response to the cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      }).catch(() => {
        // If both cache and network fail, show a generic fallback
        if (event.request.url.indexOf('/api/') !== -1) {
          return new Response(JSON.stringify({ error: 'Network currently unavailable' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // For HTML page requests, show an offline page
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reminders') {
    event.waitUntil(syncReminders());
  }
});

// Function to sync reminders when back online
async function syncReminders() {
  try {
    const pendingReminders = await getPendingReminders();
    if (pendingReminders.length > 0) {
      // Process pending reminders
      await Promise.all(pendingReminders.map(async (reminder) => {
        try {
          // Try to send the pending reminder to the server
          const result = await sendReminderToServer(reminder);
          if (result.success) {
            await markReminderSynced(reminder.id);
          }
        } catch (error) {
          console.error('Failed to sync reminder:', error);
        }
      }));
      // Notify the client about synced reminders
      if (self.clients) {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            pendingCount: pendingReminders.length
          });
        });
      }
    }
  } catch (error) {
    console.error('Error in syncReminders:', error);
  }
}

// Placeholder functions that would be implemented with IndexedDB
async function getPendingReminders() {
  // This would retrieve pending reminders from IndexedDB
  return [];
}

async function sendReminderToServer(reminder) {
  // This would send the reminder to the server
  return { success: true };
}

async function markReminderSynced(id) {
  // This would mark the reminder as synced in IndexedDB
  return true;
}
