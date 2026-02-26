const CACHE_NAME = "mynote-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ---------------- INSTALL ----------------

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ---------------- ACTIVATE ----------------

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---------------- FETCH ----------------

self.addEventListener("fetch", event => {

  // Только GET запросы
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {

        // Если есть в кэше — отдаём
        if (cached) return cached;

        // Иначе пробуем сеть
        return fetch(event.request)
          .then(response => {

            // Кэшируем только успешные ответы
            if (!response || response.status !== 200) {
              return response;
            }

            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));

            return response;
          })
          .catch(() => {
            // Если офлайн и ресурса нет — возвращаем index
            return caches.match("./index.html");
          });
      })
  );
});
