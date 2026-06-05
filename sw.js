/**
 * Service Worker · v5.0 plataforma F&B
 * --------------------------------------------------
 * Estrategia simple:
 *   - precache de assets críticos (manifest + iconos + shell HTML móvil + JS core)
 *   - runtime: network-first para JSON de proyectos (datos frescos siempre)
 *   - runtime: cache-first para fuentes Google + CDN scripts (inmutables)
 *
 * Versionado: CACHE_NAME se actualiza al cambiar SW_VERSION.
 */
const SW_VERSION = '5.17.0';
const CACHE_NAME = 'fnb-shell-v' + SW_VERSION;
const RUNTIME_CACHE = 'fnb-runtime-v' + SW_VERSION;

const PRECACHE_URLS = [
  './',
  './sala-movil.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './core/css/dashboard-theme.css',
  './core/css/themes.css',
  './core/js/loader.js',
  './core/js/theme.js',
  './core/js/metrics.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(err => {
        // Si algún recurso 404, no fallar la instalación entera
        console.warn('[sw] precache parcial:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // NUNCA cachear GitHub API (auth + writes) ni pollinations
  if (url.host === 'api.github.com' || url.host === 'image.pollinations.ai') {
    return; // browser default
  }

  // Network-first para JSONs de proyectos (datos frescos)
  if (url.pathname.includes('/projects/') && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Cache-first para fuentes Google + jsdelivr (recursos inmutables)
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com' || url.host === 'cdn.jsdelivr.net') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Same-origin: cache-first con fallback a network
  if (url.origin === location.origin) {
    event.respondWith(cacheFirstWithUpdate(event.request));
    return;
  }
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw e;
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(req, res.clone());
  return res;
}

async function cacheFirstWithUpdate(req) {
  const cached = await caches.match(req);
  if (cached) {
    // Refresh en background (no esperar)
    fetch(req).then(res => {
      caches.open(CACHE_NAME).then(c => c.put(req, res.clone())).catch(() => {});
    }).catch(() => {});
    return cached;
  }
  const res = await fetch(req);
  const cache = await caches.open(CACHE_NAME);
  cache.put(req, res.clone());
  return res;
}
