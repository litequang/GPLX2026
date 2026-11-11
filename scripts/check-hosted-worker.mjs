// Live HTTPS resources + a Node VM worker/cache simulation. This is NOT browser QA.
// Supply { base, token } as hidden JSON stdin; never put a token in argv/env/files.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const input = await new Promise((resolve, reject) => {
  let text = ''; const terminal = process.stdin.isTTY;
  if (terminal) { process.stdin.setRawMode(true); process.stderr.write('Ready for hidden live-check JSON.\n'); }
  const clean = () => { process.stdin.removeListener('data', data); process.stdin.removeListener('end', end); if (terminal) process.stdin.setRawMode(false); process.stdin.pause(); };
  const data = chunk => { text += chunk; if (/[\r\n]/.test(text)) { clean(); resolve(text.split(/[\r\n]/)[0]); } };
  const end = () => { clean(); text ? resolve(text) : reject(new Error('Missing JSON stdin')); };
  process.stdin.setEncoding('utf8'); process.stdin.on('data', data); process.stdin.once('end', end); process.stdin.resume();
});
const { base, token } = JSON.parse(input);
const scope = new URL(base); if (scope.protocol !== 'https:') throw new Error('Live check requires HTTPS.');
if (!scope.pathname.endsWith('/')) scope.pathname += '/';
const stores = new Map(), handlers = new Map(), messages = [];
let offline = false, requests = 0, bytes = 0;
const key = value => typeof value === 'string' ? new URL(value, scope).href : value instanceof URL ? value.href : value.url;
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map()); const store = stores.get(name);
    return { async put(url, response) { if (response.headers.get('vary') === '*') throw new Error('Uncacheable Vary:* response'); store.set(key(url), response.clone()); }, async match(url) { return store.get(key(url))?.clone(); } };
  },
  async keys() { return [...stores.keys()]; }, async delete(name) { return stores.delete(name); },
};
const network = async (value, options = {}) => {
  if (offline) throw new Error('Simulated offline');
  const url = new URL(key(value)); if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) throw new Error('Resource left Site scope');
  const response = await fetch(url, { ...options, headers: { ...(token ? { 'OAI-Sites-Authorization': `Bearer ${token}` } : {}) }, redirect: 'manual' });
  requests++; bytes += (await response.clone().arrayBuffer()).byteLength; return response;
};
const self = { registration: { scope: scope.href }, addEventListener(type, handler) { handlers.set(type, handler); }, skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => [{ postMessage: message => messages.push(message) }] } };
vm.runInNewContext(readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8'), { self, caches, fetch: network, URL, Response, Promise, Error });
async function dispatch(type, extras = {}) { let task; handlers.get(type)({ ...extras, waitUntil(p) { task = p; }, respondWith(p) { task = p; } }); return task; }
const request = (path, mode = 'cors') => ({ request: { url: new URL(path, scope).href, method: 'GET', mode } });
await dispatch('install'); await dispatch('activate');
const theme = async value => {
  await dispatch('message', { data: { type: 'set-theme', theme: value }, source: { url: scope.href }, ports: [{ postMessage: message => messages.push(message) }] });
  return (await dispatch('fetch', request('manifest.webmanifest'))).json();
};
if ((await theme('dark')).theme_color !== '#0b1220' || (await theme('light')).theme_color !== '#f5f7fc') throw new Error('Manifest theme did not follow saved preference');
await dispatch('message', { data: { type: 'download-offline', revision: JSON.parse(readFileSync(new URL('../dist/data/offline.json', import.meta.url))).revision } });
const done = messages.findLast(message => message.type === 'offline-done');
if (!done) throw new Error(messages.findLast(message => message.type === 'offline-error')?.message || 'Download did not finish');
offline = true;
if (!(await dispatch('fetch', request('', 'navigate'))).ok) throw new Error('Offline root missing');
const manifest = JSON.parse(readFileSync(new URL('../dist/data/offline.json', import.meta.url)));
for (const path of [manifest.urls[1], manifest.urls.at(-1)]) if (!(await dispatch('fetch', request(path))).ok) throw new Error('Offline image missing');
console.log(JSON.stringify({ liveHttps: true, workerExecution: 'Node VM; cache simulated', shellInstall: true, downloadedResources: done.total, themedManifest: 'dark/light passed', offlineRootAndSampleImages: true, requests, bytes }, null, 2));
