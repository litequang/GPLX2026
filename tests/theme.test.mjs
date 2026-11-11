import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../dist/theme-init.js', import.meta.url), 'utf8');
const key = 'gplx2026-theme-v1';
function harness({ preference = null, dark = false, blocked = false, loading = false } = {}) {
  const win = new EventTarget(), doc = new EventTarget(), media = Object.assign(new EventTarget(), { matches: dark });
  const values = new Map([['gplx2026-progress-v1', 'keep-progress']]); if (preference !== null) values.set(key, preference);
  const attrs = () => ({ values: new Map(), setAttribute(name, value) { this.values.set(name, value); } });
  const meta = attrs(), apple = attrs(), button = Object.assign(new EventTarget(), attrs());
  const root = { dataset: {}, style: {} };
  Object.assign(win, { matchMedia: () => media });
  Object.defineProperty(win, 'localStorage', { get() { if (blocked) throw new Error('storage blocked'); return { getItem: k => values.get(k) ?? null, setItem: (k, value) => values.set(k, value) }; } });
  Object.assign(doc, { documentElement: root, readyState: loading ? 'loading' : 'complete', querySelector: selector => selector.includes('apple-mobile') ? apple : selector.includes('meta') ? meta : button });
  vm.runInNewContext(source, { window: win, document: doc });
  return { root, meta, apple, button, values, hydrate() { doc.dispatchEvent(new Event('DOMContentLoaded')); }, system(value) { media.matches = value; media.dispatchEvent(new Event('change')); }, storage(k, value) { const event = new Event('storage'); event.key = k; event.newValue = value; win.dispatchEvent(event); } };
}
test('first visit follows the system, saved explicit theme wins, invalid preferences are ignored', () => {
  assert.equal(harness().root.dataset.theme, 'light');
  assert.equal(harness({ dark: true }).root.dataset.theme, 'dark');
  assert.equal(harness({ dark: true, preference: 'light' }).root.dataset.theme, 'light');
  assert.equal(harness({ preference: 'dark' }).root.dataset.theme, 'dark');
  assert.equal(harness({ dark: true, preference: 'invalid' }).root.dataset.theme, 'dark');
});
test('one tap immediately toggles theme, browser chrome color, accessible label and storage without touching progress', () => {
  const h = harness();
  h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'dark'); assert.equal(h.root.style.colorScheme, 'dark');
  assert.equal(h.root.style.backgroundColor, '#0b1220'); assert.equal(h.meta.values.get('content'), '#0b1220');
  assert.match(h.button.values.get('aria-label'), /sáng/); assert.equal(h.button.values.get('aria-pressed'), 'true');
  assert.equal(h.values.get(key), 'dark'); assert.equal(h.values.get('gplx2026-progress-v1'), 'keep-progress');
  h.button.dispatchEvent(new Event('click'));
  assert.equal(h.root.dataset.theme, 'light'); assert.equal(h.meta.values.get('content'), '#f5f7fc');
  assert.match(h.button.values.get('aria-label'), /tối/); assert.equal(h.values.get(key), 'light');
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
  assert.ok(html.indexOf('src="./theme-init.js?v=3"') < html.indexOf('rel="stylesheet"'));
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
