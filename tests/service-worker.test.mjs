import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
// In-memory worker contract tests, not a browser or PWA installation test.
function harness(stores = new Map()) {
  const scope = 'https://example.test/GPLX2026/', handlers = new Map(), messages = [];
  const fetches = [];
  let disconnected = false, failingPath = null, htmlPath = null, manifestColor = '#2457df';
  const key = input => typeof input === 'string' ? new URL(input, scope).href : input instanceof URL ? input.href : input.url;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return { async put(input, response) { store.set(key(input), response.clone()); }, async match(input) { return store.get(key(input))?.clone(); } };
    },
    async keys() { return [...stores.keys()]; }, async delete(name) { return stores.delete(name); },
  };
  const fetch = async input => {
    const url = new URL(key(input)).pathname;
    fetches.push(url);
    if (disconnected) throw new Error('Network unavailable');
    if (url.endsWith('/index.html')) return new Response(null, { status: 307, headers: { location: scope } });
    if (url.includes(',')) return new Response(null, { status: 307, headers: { location: url.replaceAll(',', '%2C') } });
    if (failingPath && url.endsWith(failingPath)) return new Response('failed', { status: 503 });
    if (htmlPath && url.endsWith(htmlPath)) return new Response('<html>sign in</html>', { headers: { 'content-type': 'text/html' } });
    if (url.endsWith('fonts/manifest.json')) return new Response(readFileSync(new URL('../dist/fonts/manifest.json', import.meta.url)), { headers: { 'content-type': 'application/json' } });
    if (url.endsWith('data/offline.json')) return Response.json({ revision: '0123456789abcdef', urls: ['data/dataset.json', 'assets/one.webp', 'assets/two.png', 'assets/S.G,7.png'] });
    if (url.endsWith('manifest.webmanifest')) return Response.json({ id: './', start_url: './', scope: './', icons: [{ src: 'icons/icon-192.png' }], theme_color: manifestColor });
    if (url.endsWith('.json')) return Response.json({});
    const mime = url.endsWith('.js') ? 'text/javascript' : url.endsWith('.css') ? 'text/css' : url.endsWith('.woff2') ? 'font/woff2' : url.endsWith('.txt') ? 'text/plain' : /\.(png|webp|svg)$/.test(url) ? 'image/png' : 'text/html';
    return new Response(mime === 'text/html' ? '<html>offline shell</html>' : 'fixture', { headers: { 'content-type': mime } });
  };
  const self = { registration: { scope }, location: new URL('sw.js', scope), addEventListener(type, callback) { handlers.set(type, callback); }, skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => [{ postMessage(message) { messages.push(message); } }] } };
  vm.runInNewContext(source, { self, caches, fetch, URL, Response, Promise, Error });
  return { scope, caches, stores, messages, fetches, manifest(color) { manifestColor = color; }, offline(v) { disconnected = v; }, fail(path) { failingPath = path; }, html(path) { htmlPath = path; }, async dispatch(type, extras = {}) { let task; handlers.get(type)({ ...extras, waitUntil(p) { task = p; }, respondWith(p) { task = p; } }); return await task; } };
}
const request = (h, path, mode = 'cors') => ({ request: { url: new URL(path, h.scope).href, method: 'GET', mode } });
test('shell, modules, dataset and self-hosted font work offline at a subpath', async () => {
  const h = harness(); await h.dispatch('install'); await h.dispatch('activate'); h.offline(true);
  assert.match(await (await h.dispatch('fetch', request(h, '', 'navigate'))).text(), /offline shell/);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/core.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/chrome.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/install.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'app.js?v=6'))).headers.get('content-type'), 'text/javascript');
  assert.equal((await h.dispatch('fetch', request(h, 'styles.css?v=6'))).headers.get('content-type'), 'text/css');
  assert.equal((await h.dispatch('fetch', request(h, 'theme-init.js?v=6'))).headers.get('content-type'), 'text/javascript');
  assert.equal((await h.dispatch('fetch', request(h, 'themes.css?v=6'))).headers.get('content-type'), 'text/css');
  assert.equal((await h.dispatch('fetch', request(h, 'fonts/be-vietnam-pro-1.woff2'))).headers.get('content-type'), 'font/woff2');
  assert.equal((await h.dispatch('fetch', request(h, 'data/dataset.json'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/core.js?v=6'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'data/dataset.json?v=6'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'data/offline.json?v=6'))).status, 200);
  assert.ok(!h.fetches.some(url => url.endsWith('/index.html')), 'install must not fetch the hosting redirect alias');
  assert.match(await (await h.dispatch('fetch', request(h, 'index.html', 'navigate'))).text(), /offline shell/);
});

test('WebAPK manifest refreshes online and falls back to the last valid colors offline or on HTML auth', async () => {
  const h = harness(); await h.dispatch('install'); h.manifest('#f5f7fc');
  const get = async () => (await h.dispatch('fetch', request(h, 'manifest.webmanifest'))).json();
  assert.equal((await get()).theme_color, '#f5f7fc');
  h.offline(true); assert.equal((await get()).theme_color, '#f5f7fc');
  h.offline(false); h.html('manifest.webmanifest'); assert.equal((await get()).theme_color, '#f5f7fc');
  h.html(null); h.manifest('#0b1220'); assert.equal((await get()).theme_color, '#f5f7fc'); // selected light wins over source default
});

test('the same PWA manifest URL returns selected colors with identity intact, including offline and later fetches', async () => {
  const h = harness(); await h.dispatch('install');
  const send = theme => h.dispatch('message', { data: { type: 'set-theme', theme }, source: { url: h.scope }, ports: [{ postMessage: message => h.messages.push(message) }] });
  const get = async () => (await h.dispatch('fetch', request(h, 'manifest.webmanifest'))).json();
  await send('dark'); const dark = await get(); assert.equal(dark.theme_color, '#0b1220'); assert.equal(dark.background_color, '#0b1220');
  assert.equal(dark.id, './'); assert.equal(dark.start_url, './'); assert.equal(dark.icons[0].src, 'icons/icon-192.png');
  assert.equal(h.messages.at(-1).type, 'theme-saved'); h.offline(true); assert.equal((await get()).theme_color, '#0b1220');
  const restarted = harness(h.stores); restarted.offline(true);
  assert.equal((await (await restarted.dispatch('fetch', request(restarted, 'manifest.webmanifest'))).json()).theme_color, '#0b1220');
  await h.dispatch('message', { data: { type: 'set-theme', theme: 'light' }, source: { url: 'https://other.test/' } });
  assert.equal((await get()).theme_color, '#0b1220');
  await send('light'); assert.equal((await get()).theme_color, '#f5f7fc');
  const prefs = await h.caches.open('gplx2026-settings-v1'); assert.equal(await (await prefs.match(new URL('__theme', h.scope))).text(), 'light');
});
test('ready marker is written only after all images finish; images remain offline', async () => {
  const h = harness(); await h.dispatch('install');
  const cache = await h.caches.open('gplx2026-data-0123456789abcdef');
  assert.equal(await cache.match(new URL('offline-ready', h.scope)), undefined);
  await h.dispatch('message', { data: { type: 'download-offline' } });
  assert.equal(h.messages.at(-1).type, 'offline-done');
  assert.equal(await (await cache.match(new URL('offline-ready', h.scope))).text(), '0123456789abcdef');
  h.offline(true);
  assert.equal((await h.dispatch('fetch', request(h, 'assets/two.png'))).status, 200);
  assert.ok(h.fetches.some(path => path.endsWith('S.G%2C7.png')));
  assert.ok(!h.fetches.some(path => path.includes(',')));
  assert.equal((await h.dispatch('fetch', request(h, 'assets/S.G,7.png'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'assets/S.G%2C7.png'))).status, 200);
});
test('failed download never marks ready; retry reuses partial cache and completes', async () => {
  const h = harness(); await h.dispatch('install'); h.fail('assets/two.png');
  await h.dispatch('message', { data: { type: 'download-offline' } });
  assert.equal(h.messages.at(-1).type, 'offline-error');
  const cache = await h.caches.open('gplx2026-data-0123456789abcdef');
  assert.equal(await cache.match(new URL('offline-ready', h.scope)), undefined);
  h.fail(null); await h.dispatch('message', { data: { type: 'download-offline' } });
  assert.equal(h.messages.at(-1).type, 'offline-done');
});
test('HTML authentication response cannot masquerade as an image or module', async () => {
  const h = harness(); await h.dispatch('install'); h.html('assets/two.png');
  await h.dispatch('message', { data: { type: 'download-offline' } });
  assert.equal(h.messages.at(-1).type, 'offline-error');
  const shell = harness(); shell.html('modules/core.js');
  await assert.rejects(shell.dispatch('install'), /Invalid shell response/);
});
test('current revision ignores stale caches and activation preserves the previous GPLX app', async () => {
  const h = harness();
  await (await h.caches.open('gplx2026-shell-old')).put(new URL('index.html', h.scope), new Response('stale'));
  await h.caches.open('gplx-shell-v1');
  await (await h.caches.open('gplx2026-data-old')).put(new URL('assets/two.png', h.scope), new Response('stale-image'));
  await h.dispatch('install'); await h.dispatch('activate');
  assert.ok((await h.caches.keys()).includes('gplx-shell-v1'));
  assert.ok(!(await h.caches.keys()).includes('gplx2026-shell-old'));
  await h.dispatch('message', { data: { type: 'download-offline' } });
  assert.ok(!(await h.caches.keys()).includes('gplx2026-data-old'));
});
