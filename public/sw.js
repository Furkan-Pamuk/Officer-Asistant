const CACHE = "officer-assistant-v8-prod";
const CORE = ["/", "/dashboard", "/inspections", "/checklists", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Never cache or hijack dynamic API endpoints
  if (url.pathname.startsWith("/api/")) return;

  // Ignore non-http/https schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith("http")) return;

  // Range requests (video streaming) must bypass the cache: responding
  // with a full 200 to a Range request breaks media playback.
  if (event.request.headers.has("range")) return;

  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request)
        .then((res) => {
          // Only cache standard successful GET responses
          if (!res || res.status !== 200 || res.type !== "basic") {
            return res;
          }
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => {
          // Only return HTML fallback for page navigations, not static assets or data
          if (event.request.mode === "navigate") {
            return caches.match("/dashboard");
          }
          return new Response("Network unavailable", { status: 503, statusText: "Service Unavailable" });
        });
    })
  );
});
