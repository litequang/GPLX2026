import test from 'node:test';
import assert from 'node:assert/strict';
import { createScrollTracker, setupAutoHideBars } from '../dist/modules/chrome.js';
import { setupInstall } from '../dist/modules/install.js';

test('bars hide on downward travel, stay hidden while stopped, reveal on upward travel', () => {
  const tracker = createScrollTracker();
  assert.equal(tracker.update(40), false);
  assert.equal(tracker.update(100), true);
  for (let i = 0; i < 100; i++) assert.equal(tracker.update(100), true);
  assert.equal(tracker.update(97), true); // finger jitter does not flicker
  assert.equal(tracker.update(91), false);
  assert.equal(tracker.update(91), false);
  assert.equal(tracker.update(94), false);
  assert.equal(tracker.update(101), true);
  assert.equal(tracker.update(0), false);
});

test('question navigation can reset the scroll baseline without revealing hidden bars', () => {
  const tracker = createScrollTracker(); tracker.update(300);
  tracker.sync(80); assert.equal(tracker.hidden, true);
  assert.equal(tracker.update(80), true);
  assert.equal(tracker.update(70), false);
  tracker.show(150); assert.equal(tracker.hidden, false);
  assert.equal(tracker.update(150), false);
});

test('scroll adapter coalesces frames, clamps bounce, and restores keyboard access', () => {
  const win = new EventTarget(), doc = new EventTarget(), frames = [], classes = new Set();
  const makeBar = () => Object.assign(new EventTarget(), { offsetHeight: 64, inert: false, contains: element => element?.barFocus === true, setAttribute() {}, removeAttribute() {} });
  const header = makeBar(), bottom = makeBar();
  Object.assign(win, { scrollY: 0, innerHeight: 800, requestAnimationFrame: callback => frames.push(callback) });
  Object.assign(doc, { body: { classList: { toggle(name, value) { if (value) classes.add(name); else classes.delete(name); } } }, activeElement: { matches: () => false }, documentElement: { scrollHeight: 1800, style: { setProperty() {} } }, querySelector: selector => selector === '.topbar' ? header : bottom });
  const chrome = setupAutoHideBars({ win, doc });
  function scroll(y) { win.scrollY = y; win.dispatchEvent(new Event('scroll')); }
  function flush() { while (frames.length) frames.shift()(); }
  scroll(80); scroll(200); assert.equal(frames.length, 1); flush();
  assert.equal(chrome.hidden, true); assert.equal(header.inert, true); assert.equal(bottom.inert, true);
  scroll(1000); flush(); scroll(1100); flush(); scroll(1000); flush();
  assert.equal(chrome.hidden, true); // bottom rubber-band is not an upward gesture
  const tab = new Event('keydown'); tab.key = 'Tab'; doc.dispatchEvent(tab);
  assert.equal(chrome.hidden, false); assert.equal(header.inert, false); assert.equal(classes.has('bars-hidden'), false);
  scroll(1050); flush(); doc.activeElement = { barFocus: true, matches: () => true };
  scroll(900); flush(); assert.equal(chrome.hidden, false); // keep active header select accessible
});

function installHarness({ standalone = false } = {}) {
  const win = new EventTarget(), button = Object.assign(new EventTarget(), { hidden: false });
  const media = new Map(); let installedEvents = 0, errors = 0;
  win.matchMedia = query => { const m = Object.assign(new EventTarget(), { matches: standalone && query.includes('standalone') }); media.set(query, m); return m; };
  const installer = setupInstall({ win, nav: {}, button, onInstalled() { installedEvents++; }, onError() { errors++; } });
  function offer(prompt, choice = Promise.resolve({ outcome: 'dismissed' })) {
    const event = new Event('beforeinstallprompt', { cancelable: true }); event.prompt = prompt; event.userChoice = choice;
    win.dispatchEvent(event); return event;
  }
  return { win, button, media, installer, offer, get installedEvents() { return installedEvents; }, get errors() { return errors; } };
}

test('header install tap opens native confirmation synchronously and consumes the event once', async () => {
  const h = installHarness(); let calls = 0, choose;
  assert.equal(h.button.hidden, true);
  const event = h.offer(() => { calls++; return Promise.resolve(); }, new Promise(resolve => { choose = resolve; }));
  assert.equal(event.defaultPrevented, true); assert.equal(h.button.hidden, false);
  const pending = h.installer.install();
  assert.equal(calls, 1); // before the first await; preserves browser user activation
  assert.equal(h.button.hidden, true);
  h.button.dispatchEvent(new Event('click')); assert.equal(calls, 1);
  choose({ outcome: 'accepted' }); await pending;
  assert.equal(h.button.hidden, true);
  h.win.dispatchEvent(new Event('appinstalled')); assert.equal(h.installedEvents, 1);
});

test('dismissal permits a new native offer; install errors do not reuse a consumed prompt', async () => {
  const h = installHarness(); let calls = 0;
  h.offer(async () => { calls++; }); await h.installer.install();
  assert.equal(h.button.hidden, true); assert.equal(h.installer.canInstall(), false);
  h.offer(async () => { calls++; throw new Error('not allowed'); });
  assert.equal(h.button.hidden, false); await h.installer.install();
  assert.equal(h.errors, 1); assert.equal(calls, 2); assert.equal(h.button.hidden, true);
  h.offer(async () => {}); assert.equal(h.button.hidden, false);
});

test('already installed display modes and browser-menu installation hide the header action', () => {
  const standalone = installHarness({ standalone: true });
  standalone.offer(() => { throw new Error('must not run'); });
  assert.equal(standalone.button.hidden, true); assert.equal(standalone.installer.canInstall(), false);
  const h = installHarness(); h.offer(async () => {}); assert.equal(h.button.hidden, false);
  h.win.dispatchEvent(new Event('appinstalled')); assert.equal(h.button.hidden, true);
  const another = installHarness(); another.offer(async () => {});
  const media = another.media.get('(display-mode: standalone)'); media.matches = true; media.dispatchEvent(new Event('change'));
  assert.equal(another.button.hidden, true);
});
