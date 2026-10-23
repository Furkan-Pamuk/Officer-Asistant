const CACHE = "officer-assistant-v7-searoute";
const CORE = ["/", "/dashboard", "/inspections", "/checklists", "/manifest.webmanifest"];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => (self as unknown as { skipWaiting(): void }).skipWaiting()));
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") return;
  // Range requests (video streaming) must bypass the cache: responding
  // with a full 200 to a Range request breaks media playback.
  if (event.request.headers.has("range")) return;
  event.respondWith(
    caches.match(event.request).then((hit) => hit ?? fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(event.request, copy));
      return res;
    }).catch(() => caches.match("/dashboard")))
  );
});
