import test from 'node:test';
import assert from 'node:assert/strict';
import { createOfflineDownload, activeWorker, createWorkerConnection } from '../dist/modules/offline.js';
function harness({ enabled = false, ready = false, failed = false, blocked = false } = {}) {
  const values = new Map(enabled ? [['gplx2026-offline-v1', 'enabled']] : []), posts = [], states = [], errors = [];
  let complete = 0;
  const storage = { getItem: k => { if (blocked) throw Error(); return values.get(k); }, setItem(k, v) { if (blocked) throw Error(); values.set(k, v); }, removeItem: k => values.delete(k) };
  const manager = createOfflineDownload({ revision: 'new', total: 633, storage, hasReady: async () => ready,
    getWorker: async () => { if (failed) throw Error('network'); return { postMessage: m => posts.push(m) }; },
    onChange: s => states.push(s), onError: m => errors.push(m), onComplete: () => complete++ });
  return { manager, values, posts, states, errors, get complete() { return complete; } };
}
test('no large automatic download before consent; confirmation starts once and records intent separately', async () => {
  const h = harness(); await h.manager.restore(); assert.equal(h.posts.length, 0);
  await Promise.all([h.manager.start(true), h.manager.start(true)]);
  assert.equal(h.posts.length, 1); assert.deepEqual(h.posts[0], { type: 'download-offline', revision: 'new' });
  assert.equal(h.values.get('gplx2026-offline-v1'), 'enabled'); assert.equal(h.manager.state.status, 'downloading');
  assert.equal(h.manager.clear(), false);
});
test('reopening resumes after consent; a ready cache does not download again; clearing disables future auto-resume', async () => {
  const interrupted = harness({ enabled: true }); await interrupted.manager.restore(); assert.equal(interrupted.posts.length, 1);
  const h = harness({ enabled: true, ready: true }); await h.manager.restore(); await h.manager.start();
  assert.equal(h.manager.state.status, 'ready'); assert.equal(h.posts.length, 0);
  assert.equal(h.manager.clear(), true); assert.equal(h.values.size, 0); await h.manager.start(); assert.equal(h.posts.length, 0);
});
test('revision-bound worker progress and completion work without rerendering study state; stale messages ignored', async () => {
  const h = harness(); await h.manager.start(true);
  h.manager.message({ type: 'offline-done', revision: 'old' }); assert.equal(h.manager.state.status, 'downloading');
  h.manager.message({ type: 'offline-progress', revision: 'new', completed: 320 }); assert.equal(h.manager.state.completed, 320);
  h.manager.message({ type: 'offline-error', revision: 'new', message: 'quota' }); assert.equal(h.manager.state.status, 'error');
  await h.manager.start(); assert.equal(h.posts.length, 2);
  h.manager.message({ type: 'offline-done', revision: 'new' }); assert.equal(h.manager.state.completed, 633); assert.equal(h.complete, 1);
});
test('worker failure can retry later; blocked preferences still permit a confirmed download', async () => {
  const h = harness({ failed: true }); await h.manager.start(true); assert.equal(h.manager.state.status, 'error'); assert.deepEqual(h.errors, ['network']);
  const blocked = harness({ blocked: true }); await blocked.manager.restore(); assert.equal(blocked.posts.length, 0);
  await blocked.manager.start(true); assert.equal(blocked.posts.length, 1);
});
test('download waits for replacement worker activation instead of using a stale active worker', async () => {
  const old = {}, next = {}, pending = Object.assign(new EventTarget(), { state: 'installing' });
  const registration = { active: old, installing: pending };
  const task = activeWorker(registration); registration.active = next; pending.state = 'activated'; pending.dispatchEvent(new Event('statechange'));
  assert.equal(await task, next);
  await assert.rejects(activeWorker({ active: null }), /chưa hoạt động/);
});

test('a failed install registration is retried; concurrent requests share the retry, not a dead registration', async () => {
  let attempts = 0; const worker = {};
  const connect = createWorkerConnection({ register: async () => { attempts++; return { active: attempts === 1 ? null : worker }; } }, './sw.js?v=5');
  await assert.rejects(connect(), /chưa hoạt động/);
  const [a, b] = await Promise.all([connect(), connect()]); assert.equal(attempts, 2); assert.equal(a.worker, worker); assert.equal(b.worker, worker);
});
