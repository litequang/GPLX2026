import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../dist/theme-init.js', import.meta.url), 'utf8');
const key = 'gplx2026-theme-v1';
function harness({ preference = null, dark = false, blocked = false, loading = false, workerSync = false } = {}) {
  const win = new EventTarget(), doc = new EventTarget(), media = Object.assign(new EventTarget(), { matches: dark });
  const values = new Map([['gplx2026-progress-v1', 'keep-progress']]); if (preference !== null) values.set(key, preference);
  const attrs = () => ({ values: new Map(), setAttribute(name, value) { this.values.set(name, value); } });
  const meta = attrs(), scheme = attrs(), apple = attrs(), button = Object.assign(new EventTarget(), attrs());
  const root = { dataset: {}, style: {} };
  const posts = [], workers = new EventTarget(); let replacements = 0;
  workers.controller = { postMessage: (message, ports) => posts.push({ message, reply: value => ports[0].peer.onmessage({ data: value }) }) };
  const link = { cloneNode() { return link; }, replaceWith() { replacements++; } };
  if (workerSync) Object.assign(win, { navigator: { serviceWorker: workers }, MessageChannel: class { constructor() { this.port1 = { close() {} }; this.port2 = { peer: this.port1, close() {} }; } } });
  Object.assign(win, { matchMedia: () => media });
  Object.defineProperty(win, 'localStorage', { get() { if (blocked) throw new Error('storage blocked'); return { getItem: k => values.get(k) ?? null, setItem: (k, value) => values.set(k, value) }; } });
  Object.assign(doc, { documentElement: root, body: { style: {} }, readyState: loading ? 'loading' : 'complete', querySelector: selector => selector.startsWith('link') ? link : selector.includes('apple-mobile') ? apple : selector.includes('color-scheme') ? scheme : selector.includes('meta') ? meta : button });
  vm.runInNewContext(source, { window: win, document: doc, setTimeout, clearTimeout });
  return { root, meta, scheme, apple, body: doc.body, button, values, posts, workers, get replacements() { return replacements; }, resume() { win.dispatchEvent(new Event('pageshow')); doc.dispatchEvent(new Event('visibilitychange')); }, hydrate() { doc.dispatchEvent(new Event('DOMContentLoaded')); }, system(value) { media.matches = value; media.dispatchEvent(new Event('change')); }, storage(k, value) { const event = new Event('storage'); event.key = k; event.newValue = value; win.dispatchEvent(event); } };
}
test('first visit follows the system, saved explicit theme wins, invalid preferences are ignored', () => {
  assert.equal(harness().root.dataset.theme, 'light');
  assert.equal(harness({ dark: true }).root.dataset.theme, 'dark');
  assert.equal(harness({ dark: true, preference: 'light' }).root.dataset.theme, 'light');
  assert.equal(harness({ preference: 'dark' }).root.dataset.theme, 'dark');
  assert.equal(harness({ dark: true, preference: 'invalid' }).root.dataset.theme, 'dark');
});

test('manifest is re-discovered only after the current theme is saved; stale rapid-toggle acknowledgements are ignored', () => {
  const h = harness({ workerSync: true });
  h.button.dispatchEvent(new Event('click'));
  const latest = h.posts.at(-1); assert.equal(latest.message.theme, 'dark');
  for (const post of h.posts.slice(0, -1)) post.reply({ type: 'theme-saved', theme: post.message.theme });
  assert.equal(h.replacements, 0);
  latest.reply({ type: 'theme-saved', theme: 'dark' }); assert.equal(h.replacements, 1);
  const before = h.posts.length; h.resume(); assert.equal(h.posts.length, before);
  h.button.dispatchEvent(new Event('click')); h.posts.at(-1).reply({ type: 'theme-saved', theme: 'light' });
  assert.equal(h.replacements, 2); assert.equal(h.values.get('gplx2026-progress-v1'), 'keep-progress');
});

test('theme sync retries on a new controller and leaves UI usable when persistence is rejected', () => {
  const h = harness({ workerSync: true, preference: 'dark' });
  for (const post of h.posts) post.reply({ type: 'theme-error' });
  assert.equal(h.replacements, 0); assert.equal(h.root.dataset.theme, 'dark');
  const before = h.posts.length; h.workers.dispatchEvent(new Event('controllerchange'));
  assert.equal(h.posts.length, before + 1); h.posts.at(-1).reply({ type: 'theme-saved', theme: 'dark' }); assert.equal(h.replacements, 1);
});
test('one tap immediately toggles theme, browser chrome color, accessible label and storage without touching progress', () => {
  const h = harness();
  h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'dark'); assert.equal(h.root.style.colorScheme, 'dark');
  assert.equal(h.root.style.backgroundColor, '#0b1220'); assert.equal(h.meta.values.get('content'), '#0b1220');
  assert.equal(h.body.style.backgroundColor, '#0b1220'); assert.equal(h.scheme.values.get('content'), 'dark');
  assert.match(h.button.values.get('aria-label'), /sáng/); assert.equal(h.button.values.get('aria-pressed'), 'true');
  assert.equal(h.values.get(key), 'dark'); assert.equal(h.values.get('gplx2026-progress-v1'), 'keep-progress');
  h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'light'); assert.equal(h.meta.values.get('content'), '#f5f7fc');
  assert.match(h.button.values.get('aria-label'), /tối/); assert.equal(h.values.get(key), 'light');
});

test('returning to the PWA reapplies canvas, body and native theme metadata without resetting progress', () => {
  const h = harness({ preference: 'dark' });
  h.body.style.backgroundColor = '#2457df'; h.meta.setAttribute('content', '#2457df');
  h.resume();
  assert.equal(h.body.style.backgroundColor, '#0b1220'); assert.equal(h.meta.values.get('content'), '#0b1220');
  assert.equal(h.values.get('gplx2026-progress-v1'), 'keep-progress');
});
test('restores page and system-bar colors before DOMContentLoaded, then binds the toggle once', () => {
  const h = harness({ preference: 'dark', loading: true });
  assert.equal(h.root.dataset.theme, 'dark'); assert.equal(h.meta.values.get('content'), '#0b1220');
  h.hydrate(); h.hydrate(); h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'light'); // no duplicate click binding
});
test('theme remains usable when localStorage cannot be accessed', () => {
  const h = harness({ blocked: true, dark: true });
  assert.equal(h.root.dataset.theme, 'dark'); h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'light'); assert.equal(h.meta.values.get('content'), '#f5f7fc');
});
test('system changes apply until a manual choice; other tabs sync theme but progress events do not change it', () => {
  const h = harness(); h.system(true); assert.equal(h.root.dataset.theme, 'dark');
  h.button.dispatchEvent(new Event('click')); h.system(false); h.system(true);
  assert.equal(h.root.dataset.theme, 'light');
  h.storage(key, 'dark'); assert.equal(h.root.dataset.theme, 'dark');
  h.storage('gplx2026-progress-v1', 'other'); assert.equal(h.root.dataset.theme, 'dark');
  h.system(false); assert.equal(h.root.dataset.theme, 'dark');
  h.storage(key, null); assert.equal(h.root.dataset.theme, 'light');
  h.system(true); assert.equal(h.root.dataset.theme, 'dark');
});
test('static manifest and initial meta match the light canvas; bootstrap precedes CSS; both palettes have readable semantic color pairs', () => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  const themes = readFileSync(new URL('../dist/themes.css', import.meta.url), 'utf8');
  const manifest = JSON.parse(readFileSync(new URL('../dist/manifest.webmanifest', import.meta.url)));
  const palette = block => Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[a-f\d]{6})\s*;/gi)].map(m => [m[1], m[2]]));
  const light = palette(css.match(/:root\s*\{([^}]+)/)[1]);
  const dark = palette(themes.match(/:root\[data-theme="dark"\]\s*\{([^}]+)/)[1]);
  assert.equal(manifest.theme_color, light.bg); assert.equal(manifest.background_color, light.bg);
  assert.ok(html.includes(`name="theme-color" content="${light.bg}"`));
  assert.ok(html.indexOf('src="./theme-init.js?v=5"') < html.indexOf('rel="stylesheet"'));
  assert.equal(harness({ preference: 'dark' }).meta.values.get('content'), dark.bg);
  const luminance = hex => {
    const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  };
  const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const p of [light, dark]) for (const [fg, bg] of [['ink', 'bg'], ['muted', 'surface'], ['primary', 'surface'], ['green', 'green-soft'], ['red', 'red-soft'], ['amber', 'amber-soft']]) {
    const background = p[bg] === undefined && bg === 'surface' ? '#ffffff' : p[bg];
    assert.ok(contrast(p[fg], background) >= 4.5, `${fg}/${bg} contrast`);
  }
  assert.ok(contrast('#ffffff', '#315acc') >= 4.5);
});
