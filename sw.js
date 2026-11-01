const CACHE_NAME = 'nomina-stellantis-v50-pro';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Instalación: fuerza la activación inmediata sin esperar a que se cierren las pestañas
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

// 2. Activación: purga cualquier caché antigua (V49 o anteriores) y toma el control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Estrategia Network-First: busca siempre la última versión en GitHub; si no hay red, usa caché
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
