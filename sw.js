const CACHE_NAME = "mynote-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",

  "./codemirror/codemirror.min.js",
  "./codemirror/codemirror.min.css",
  "./codemirror/theme/material-darker.min.css",
  "./codemirror/mode/xml/xml.min.js",
  "./codemirror/mode/htmlmixed/htmlmixed.min.js",
  "./codemirror/addon/edit/closetag.min.js",
  "./codemirror/addon/edit/closebrackets.min.js"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE
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

// FETCH
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) return cached;

      return fetch(event.request).then(response => {

        if (!response || response.status !== 200) return response;

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;

      }).catch(() => caches.match("./index.html"));
    })
  );
});
