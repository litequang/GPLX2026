import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
// In-memory worker contract tests, not a browser or PWA installation test.
function harness() {
  const scope = 'https://example.test/GPLX2026/', handlers = new Map(), stores = new Map(), messages = [];
  let disconnected = false, failingPath = null, htmlPath = null;
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
    if (disconnected) throw new Error('Network unavailable');
    if (failingPath && url.endsWith(failingPath)) return new Response('failed', { status: 503 });
    if (htmlPath && url.endsWith(htmlPath)) return new Response('<html>sign in</html>', { headers: { 'content-type': 'text/html' } });
    if (url.endsWith('fonts/manifest.json')) return Response.json({ urls: ['fonts/fonts.css', 'fonts/be-vietnam-pro-1.woff2'] });
    if (url.endsWith('data/offline.json')) return Response.json({ revision: '0123456789abcdef', urls: ['data/dataset.json', 'assets/one.webp', 'assets/two.png'] });
    if (url.endsWith('.json') || url.endsWith('.webmanifest')) return Response.json({});
    const mime = url.endsWith('.js') ? 'text/javascript' : url.endsWith('.css') ? 'text/css' : url.endsWith('.woff2') ? 'font/woff2' : /\.(png|webp|svg)$/.test(url) ? 'image/png' : 'text/html';
    return new Response(mime === 'text/html' ? '<html>offline shell</html>' : 'fixture', { headers: { 'content-type': mime } });
  };
  const self = { registration: { scope }, location: new URL('sw.js', scope), addEventListener(type, callback) { handlers.set(type, callback); }, skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => [{ postMessage(message) { messages.push(message); } }] } };
  vm.runInNewContext(source, { self, caches, fetch, URL, Response, Promise, Error });
  return { scope, caches, messages, offline(v) { disconnected = v; }, fail(path) { failingPath = path; }, html(path) { htmlPath = path; }, async dispatch(type, extras = {}) { let task; handlers.get(type)({ ...extras, waitUntil(p) { task = p; }, respondWith(p) { task = p; } }); return await task; } };
}
const request = (h, path, mode = 'cors') => ({ request: { url: new URL(path, h.scope).href, method: 'GET', mode } });
test('shell, modules, dataset and self-hosted font work offline at a subpath', async () => {
  const h = harness(); await h.dispatch('install'); await h.dispatch('activate'); h.offline(true);
  assert.match(await (await h.dispatch('fetch', request(h, '', 'navigate'))).text(), /offline shell/);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/core.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/chrome.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'modules/install.js'))).status, 200);
  assert.equal((await h.dispatch('fetch', request(h, 'app.js?v=3'))).headers.get('content-type'), 'text/javascript');
  assert.equal((await h.dispatch('fetch', request(h, 'styles.css?v=3'))).headers.get('content-type'), 'text/css');
  assert.equal((await h.dispatch('fetch', request(h, 'theme-init.js?v=3'))).headers.get('content-type'), 'text/javascript');
  assert.equal((await h.dispatch('fetch', request(h, 'themes.css?v=3'))).headers.get('content-type'), 'text/css');
  assert.equal((await h.dispatch('fetch', request(h, 'fonts/be-vietnam-pro-1.woff2'))).headers.get('content-type'), 'font/woff2');
  assert.equal((await h.dispatch('fetch', request(h, 'data/dataset.json'))).status, 200);
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
