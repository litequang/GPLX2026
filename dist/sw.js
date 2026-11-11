// Increase this revision whenever a shell, module or font changes.
const APP_REVISION = 'gplx2026-shell-v2';
const DATA_PREFIX = 'gplx2026-data-';
const SHELL = ['./', 'index.html', 'styles.css', 'styles.css?v=2', 'app.js', 'app.js?v=2', 'modules/core.js', 'modules/storage.js', 'modules/ui.js', 'modules/icons.js', 'modules/chrome.js', 'modules/install.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'data/dataset.json', 'data/offline.json', 'fonts/manifest.json'];
const scope = new URL(self.registration.scope);
const absolute = path => new URL(path, scope);
let manifestTask, downloadTask;
function valid(response, path) {
  path = path.split(/[?#]/, 1)[0];
  const mime = response.headers.get('content-type') || '';
  const expected = /\.(png|jpe?g|webp|svg)$/.test(path) ? /^image\// : path.endsWith('.js') ? /javascript/ : path.endsWith('.css') ? /text\/css/ : /\.(json|webmanifest)$/.test(path) ? /json|manifest/ : path.endsWith('.woff2') ? /font\/woff2|application\/octet-stream/ : path.endsWith('.txt') ? /text\/plain/ : /text\/html/;
  return response.ok && !response.redirected && response.type !== 'opaque' && expected.test(mime);
}
async function loadManifest() {
  if (!manifestTask) manifestTask = (async () => {
    const shell = await caches.open(APP_REVISION);
    const response = await shell.match(absolute('data/offline.json'));
    if (!response) throw new Error('Chưa sẵn sàng danh sách ngoại tuyến.');
    const manifest = await response.json();
    if (!/^[a-f0-9]{16}$/.test(manifest.revision) || !Array.isArray(manifest.urls) || !manifest.urls.length) throw new Error('Danh sách ngoại tuyến không hợp lệ.');
    for (const path of manifest.urls) {
      const url = absolute(path);
      if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || !(path === 'data/dataset.json' || path.startsWith('assets/'))) throw new Error('Đường dẫn dữ liệu không hợp lệ.');
    }
    return manifest;
  })().catch(error => { manifestTask = null; throw error; });
  return manifestTask;
}
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(APP_REVISION);
  const fontResponse = await fetch(absolute('fonts/manifest.json'), { cache: 'reload' });
  if (!valid(fontResponse, 'fonts/manifest.json')) throw new Error('Invalid font manifest');
  const fonts = await fontResponse.json();
  if (!Array.isArray(fonts.urls) || fonts.urls.some(path => !/^fonts\/[a-zA-Z0-9.-]+$/.test(path))) throw new Error('Invalid font paths');
  for (const path of [...SHELL, ...fonts.urls]) {
    const response = await fetch(absolute(path), { cache: 'reload' });
    if (!valid(response, path)) throw new Error(`Invalid shell response: ${path}`);
    await cache.put(absolute(path), response);
  }
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('gplx2026-shell-') && key !== APP_REVISION) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async () => {
    const shell = await caches.open(APP_REVISION);
    if (event.request.mode === 'navigate') {
      try { const response = await fetch(event.request); if (valid(response, 'index.html')) return response; } catch {}
      return await shell.match(absolute('index.html')) || Response.error();
    }
    const cached = await shell.match(event.request);
    if (cached) return cached;
    const relative = url.pathname.slice(scope.pathname.length);
    if (!relative.startsWith('assets/')) return fetch(event.request);
    const manifest = await loadManifest();
    if (!manifest.urls.some(path => absolute(path).pathname === url.pathname)) return fetch(event.request);
    const cache = await caches.open(DATA_PREFIX + manifest.revision);
    const image = await cache.match(event.request);
    if (image) return image;
    const response = await fetch(event.request);
    if (valid(response, relative)) await cache.put(event.request, response.clone());
    return response;
  })());
});
async function broadcast(message) { for (const client of await self.clients.matchAll()) client.postMessage(message); }
async function cacheDataset() {
  const manifest = await loadManifest();
  const cache = await caches.open(DATA_PREFIX + manifest.revision);
  let completed = 0;
  await broadcast({ type: 'offline-progress', completed, total: manifest.urls.length });
  for (let index = 0; index < manifest.urls.length; index += 6) {
    await Promise.all(manifest.urls.slice(index, index + 6).map(async path => {
      const url = absolute(path);
      if (!await cache.match(url)) {
        const shell = await caches.open(APP_REVISION);
        const response = await shell.match(url) || await fetch(url);
        if (!valid(response, path)) throw new Error(`Không tải được ${path}`);
        await cache.put(url, response);
      }
      completed++;
    }));
    await broadcast({ type: 'offline-progress', completed, total: manifest.urls.length });
  }
  await cache.put(absolute('offline-ready'), new Response(manifest.revision));
  for (const key of await caches.keys()) if (key.startsWith(DATA_PREFIX) && key !== DATA_PREFIX + manifest.revision) await caches.delete(key);
  await broadcast({ type: 'offline-done', total: completed });
}
self.addEventListener('message', event => {
  if (event.data?.type !== 'download-offline') return;
  if (!downloadTask) downloadTask = cacheDataset().catch(error => broadcast({ type: 'offline-error', message: error.message })).finally(() => { downloadTask = null; });
  event.waitUntil(downloadTask);
});
