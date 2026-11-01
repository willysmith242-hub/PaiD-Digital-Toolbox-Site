const CACHE_NAME = "paid-toolbox-public-v3";
const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./pdf-to-dxf-ui.js",
  "./vendor/pdf-to-dxf.bundle.js",
  "./vendor/pdf-worker-pdf.worker.min.mjs",
  "./manifest.webmanifest",
  "./paid-toolbox-icon.svg",
  "./offline.html",
  "./offline-guide.html",
  "./software-library.html"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match("./offline.html"));
  }));
});
