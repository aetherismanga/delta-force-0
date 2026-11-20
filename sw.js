'use strict';

const CACHE = 'df0-web-v6.0';
const SHELL = [
  './index.html','./game.css','./game.js','./scenery.js','./combat-v6.js','./bosses-v6.js',
  './manifest.webmanifest','./assets/icons/icon-192.png','./assets/icons/icon-512.png',
];
const FIRST_FLIGHT = [
  '2e9ebfa560b75ac4.png','9b927fa305681cda.png','0a16e72ef9f2ed97.webp','3dbc445a1f3a7fd7.webp',
  '1e7f145fe2b17b49.webp','c6192a52c9fd3c43.png','7c50342e88c0d854.png','2b8d8d38f5ffd922.png',
  '689f530501af4c52.png','cfabab185a81004c.png','6f35b1001402c826.png','ef416cba27c7c878.png',
  '8d380893c26df73e.png','fa7227c373ca6daa.png','5d972b013a226068.png',
].map(name=>'./assets/media/asset-'+name);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await cache.addAll(SHELL);
    await Promise.allSettled(FIRST_FLIGHT.map(url=>cache.add(url)));
    await self.skipWaiting();
  }));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key=>key.startsWith('df0-web-') && key!==CACHE).map(key=>caches.delete(key)))
  ).then(()=>self.clients.claim()));
});

async function gameResource(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request,response.clone()).catch(()=>{});
  return response;
}

async function gamePage(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) return response;
  } catch { /* The installed shell can render without connectivity. */ }
  return cache.match('./index.html');
}

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin || request.headers.has('range')) return;
  if (request.mode === 'navigate' && /\/(?:index\.html)?$/.test(url.pathname)) {
    event.respondWith(gamePage(request));
    return;
  }
  const name = url.pathname.slice(url.pathname.lastIndexOf('/')+1);
  if (SHELL.includes('./'+name) || /\/assets\/(?:media|icons)\//.test(url.pathname)) {
    event.respondWith(gameResource(request));
  }
});
