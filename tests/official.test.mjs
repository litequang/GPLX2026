import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyOfficialCorrections, official } from '../scripts/official-overlay.mjs';
import { parseProgress, createProgress, getLicense, poolFor, randomExam } from '../dist/modules/core.js';
const data = JSON.parse(readFileSync(new URL('../dist/data/dataset.json', import.meta.url)));

test('official overlay can replay on the raw source and is idempotent; raw report stays distinct', () => {
  const raw = structuredClone(data);
  for (const q of raw.questions) if (official.restoredB.includes(q.id)) q.groups = q.groups.filter(g => g !== 'B');
  for (const patch of official.corrections) {
    const q = raw.questions.find(q => q.id === patch.id);
    q.options = patch.replaceAllOptions ? structuredClone(patch.before) : q.options.map(o => structuredClone(patch.before.find(b => b.id === o.id) || o));
  }
  for (const l of raw.licenses) delete l.topicQuotas;
  delete raw.officialAudit;
  assert.deepEqual(applyOfficialCorrections(raw), data);
  assert.deepEqual(applyOfficialCorrections(structuredClone(data)), data);
  const report = JSON.parse(readFileSync(new URL('../source-report.json', import.meta.url)));
  assert.equal(report.pools.B, 592);
  const changed = structuredClone(raw); changed.questions[0].critical.ALL = true;
  assert.throws(() => applyOfficialCorrections(changed), /critical flags/);
  const otherSource = structuredClone(raw); otherSource.source.databaseSha256 = 'different';
  assert.throws(() => applyOfficialCorrections(otherSource), /database hash/);
});

test('restored B questions, chapter quotas and source wording survive; retired option is filtered safely', () => {
  assert.equal(poolFor(data, 'B').length, 600);
  for (const id of official.restoredB) assert.ok(poolFor(data, 'B').some(q => q.id === id));
  assert.equal(data.questions.find(q => q.id === 592).options[2].text, 'Cả 2 xe đều đúng.');
  assert.equal(data.questions.find(q => q.id === 298).options.length, 3);
  const progress = createProgress(); progress.answers[298] = { selected: 4, correct: false }; progress.bookmarks = [298, 64];
  const restored = parseProgress(JSON.stringify(progress), data);
  assert.equal(restored.answers[298], undefined); assert.deepEqual(restored.bookmarks, [298, 64]);
  const l = getLicense(data, 'B'); assert.equal(l.count, 30); assert.equal(l.minutes, 20); assert.equal(l.pass, 27);
  assert.equal(randomExam(data, 'B', () => 0).length, 30);
  const insufficient = structuredClone(data); insufficient.questions = insufficient.questions.filter(q => q.category !== 5);
  assert.throws(() => randomExam(insufficient, 'B'), /chủ đề/);
});
