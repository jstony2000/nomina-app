const CACHE_NAME = 'nomina-stellantis-v49';
const urlsToCache = [
  './',
  './index.html'
];

// Instalación: Guarda los archivos esenciales la primera vez
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Fuerza a que el SW se active inmediatamente
});

// Activación: Limpia cachés de versiones antiguas para que no se atasque
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de las pestañas abiertas
});

// Estrategia Network-First: Busca internet, si falla, usa caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet, actualizamos la caché con la versión más fresca
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay internet (fábrica), tiramos de lo guardado
        return caches.match(event.request);
      })
  );
});