/* eslint-disable no-restricted-globals */
/**
 * Açaí de Casa — Service Worker
 *
 * Strategy by request kind:
 *   1. Navigation (HTML pages)           → network-first, fallback to cache, fallback to /offline.html
 *   2. Static assets (/_next/static/...) → cache-first (immutable hashed)
 *   3. Same-origin images / fonts        → stale-while-revalidate
 *   4. Cross-origin (Supabase REST/Auth) → network-only (never cache)
 *
 * Caches are versioned via CACHE_VERSION; bumping it invalidates everything
 * on the next activation. Old caches are removed in the `activate` event.
 */

const CACHE_VERSION = "v1";
const RUNTIME_CACHE = `acaidecasa-runtime-${CACHE_VERSION}`;
const PRECACHE = `acaidecasa-precache-${CACHE_VERSION}`;

const PRECACHE_URLS = ["/", "/offline.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![RUNTIME_CACHE, PRECACHE].includes(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

const isSameOrigin = (url) => {
  try {
    return new URL(url).origin === self.location.origin;
  } catch {
    return false;
  }
};

const isStaticAsset = (url) =>
  /\/_next\/static\/|\.(?:js|css|woff2?|ttf)$/i.test(url);

const isImage = (url) => /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url);

// network-first with offline fallback for navigations
const handleNavigation = async (request) => {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match("/offline.html");
    return (
      offline ??
      new Response("Você está offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
};

const handleStatic = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) {
    const cache = await caches.open(PRECACHE);
    cache.put(request, fresh.clone());
  }
  return fresh;
};

const handleStaleWhileRevalidate = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? networkPromise;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only GETs are cacheable.
  if (request.method !== "GET") return;

  // Never cache cross-origin (Supabase REST/Auth, Sentry, etc.)
  if (!isSameOrigin(request.url)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isStaticAsset(request.url)) {
    event.respondWith(handleStatic(request));
    return;
  }

  if (isImage(request.url)) {
    event.respondWith(handleStaleWhileRevalidate(request));
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
