import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalize, getLicense, poolFor, isCritical, randomExam, grade, filterQuestions, statistics, createProgress, parseProgress, parseActiveExam } from '../dist/modules/core.js';
import { readProgress, readExam, writeProgress, writeExam, PROGRESS_KEY, EXAM_KEY } from '../dist/modules/storage.js';
import { escape, dayKey } from '../dist/modules/ui.js';
const bytes = readFileSync(new URL('../dist/data/dataset.json', import.meta.url));
const data = JSON.parse(bytes), manifest = JSON.parse(readFileSync(new URL('../dist/data/offline.json', import.meta.url)));
test('600 questions have valid answers, decoded explanations, topics and image references', () => {
  assert.deepEqual(data.questions.map(q => q.id), Array.from({ length: 600 }, (_, i) => i + 1));
  assert.equal(data.questions.filter(q => q.critical.ALL).length, 60);
  for (const q of data.questions) {
    assert.ok(q.text && q.explanation); assert.ok(q.options.some(o => o.id === q.answer));
    assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length);
    assert.ok(data.categories.some(c => c.id === q.category));
    if (q.image) assert.ok(existsSync(new URL('../dist/' + q.image, import.meta.url)));
  }
});
test('official license pools and critical flags match CV 2262; B is 600/60', () => {
  assert.equal(data.licenses.length, 15);
  for (const [name, total, critical] of [['A1', 250, 20], ['A', 250, 20], ['B1', 300, 30], ['B', 600, 60], ['C1', 600, 60]]) {
    const pool = poolFor(data, name), l = getLicense(data, name);
    assert.equal(pool.length, total); assert.equal(pool.filter(q => isCritical(q, l)).length, critical);
  }
  assert.equal(getLicense(data, 'invalid').name, 'B');
});
test('1,500 random practice exams have exact lengths, unique in-pool IDs and one license-critical question', () => {
  for (const l of data.licenses) {
    const ids = new Set(poolFor(data, l.name).map(q => q.id));
    for (let i = 0; i < 100; i++) {
      const questions = randomExam(data, l.name);
      assert.equal(questions.length, l.count); assert.equal(new Set(questions.map(q => q.id)).size, l.count);
      assert.ok(questions.every(q => ids.has(q.id))); assert.equal(questions.filter(q => isCritical(q, l)).length, 1);
      for (const quota of l.topicQuotas) assert.equal(questions.filter(q => !isCritical(q, l) && quota.categories.includes(q.category)).length, quota.count);
    }
  }
});
test('all 233 source exercises retain their references, ordering, and multiple-critical cases', () => {
  assert.equal(data.fixedExams.length, 233); let multiple = 0;
  const map = new Map(data.questions.map(q => [q.id, q]));
  for (const t of data.fixedExams) {
    const l = getLicense(data, t.license);
    assert.equal(t.questionIds.length, l.count); assert.equal(new Set(t.questionIds).size, l.count);
    assert.ok(t.questionIds.every(id => map.has(id)));
    if (t.questionIds.filter(id => isCritical(map.get(id), l)).length > 1) multiple++;
  }
  assert.equal(multiple, 207);
});
test('critical wrong or unanswered fails even above score threshold', () => {
  const l = getLicense(data, 'B'), qs = randomExam(data, l.name), answers = Object.fromEntries(qs.map(q => [q.id, q.answer]));
  assert.equal(grade(qs, answers, l).passed, true);
  const critical = qs.find(q => isCritical(q, l)); delete answers[critical.id];
  const result = grade(qs, answers, l);
  assert.equal(result.correct, 29); assert.equal(result.skipped, 1); assert.equal(result.passed, false);
  assert.deepEqual(result.criticalMissed, [critical.id]);
  answers[critical.id] = critical.options.find(o => o.id !== critical.answer).id;
  assert.equal(grade(qs, answers, l).passed, false);
});
test('progress roundtrip preserves skipped revision items and full historical answers; rejects invalid values', () => {
  const p = createProgress(), q = data.questions[0];
  p.answers[1] = { selected: 0, correct: true, at: 123, attempts: 2 };
  p.answers[2] = { selected: 999 }; p.answers[999] = { selected: 1 };
  p.bookmarks = [1, 1, 999]; p.license = 'CE';
  p.history = [{ id: 'old-exam', license: 'B', title: 'Practice', kind: 'random', ids: [q.id], answers: { 1: q.answer }, startedAt: 1, finishedAt: 2 }];
  const restored = parseProgress(JSON.stringify(p), data);
  assert.equal(restored.answers[1].selected, 0); assert.equal(restored.answers[1].correct, false);
  assert.deepEqual(Object.keys(restored.answers), ['1']); assert.deepEqual(restored.bookmarks, [1]);
  assert.equal(restored.history[0].answers[1], q.answer); assert.equal(restored.license, 'CE');
  assert.deepEqual(parseProgress(JSON.stringify(restored), data), restored);
  assert.throws(() => parseProgress('{"version":1}', data));
  p.answers[1] = { selected: q.answer, correct: false };
  assert.equal(parseProgress(JSON.stringify(p), data).answers[1].correct, true);
});
test('active exam restores fixed deadline and valid options, clamps fractional index, rejects malformed IDs', () => {
  const qs = randomExam(data, 'B'), input = { id: 'test', license: 'B', ids: qs.map(q => q.id), answers: { [qs[0].id]: qs[0].answer, [qs[1].id]: 99 }, startedAt: 1000, deadline: 1201000, index: 2.7 };
  const restored = parseActiveExam(JSON.stringify(input), data);
  assert.equal(restored.deadline, input.deadline); assert.equal(restored.index, 2);
  assert.equal(restored.answers[qs[0].id], qs[0].answer); assert.equal(restored.answers[qs[1].id], undefined);
  assert.equal(parseActiveExam(JSON.stringify({ ...input, ids: Array(30).fill(1) }), data), null);
  assert.equal(parseActiveExam(JSON.stringify({ ...input, deadline: 500 }), data), null);
});
test('accent-free search, skipped/new filters, escaping and Vietnamese daily boundary', () => {
  assert.equal(normalize('Đường đèo'), 'duong deo');
  const p = createProgress(); p.answers[1] = { selected: 0, correct: false }; p.answers[2] = { selected: 1, correct: false };
  const opts = { progress: p, license: getLicense(data, 'B') };
  assert.ok(filterQuestions(data.questions, { ...opts, query: 'phan cua duong bo' }).some(q => q.id === 1));
  assert.ok(filterQuestions(data.questions, { ...opts, status: 'new' }).some(q => q.id === 1));
  assert.equal(filterQuestions(data.questions, { ...opts, status: 'wrong' }).length, 2);
  assert.equal(statistics(data.questions, p).answered, 1);
  assert.equal(escape('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
  assert.equal(dayKey(Date.parse('2026-11-11T17:01:00Z')), dayKey(Date.parse('2026-11-12T01:00:00+07:00')));
});
test('storage failures return safe defaults; saved exam and progress use separate keys', () => {
  const map = new Map(), storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
  assert.equal(writeProgress(createProgress(), storage), true); assert.ok(map.has(PROGRESS_KEY));
  assert.equal(readProgress(data, storage).license, 'B');
  assert.equal(writeExam(null, storage), true); assert.equal(readExam(data, storage), null); assert.equal(map.has(EXAM_KEY), false);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(readProgress(data, blocked), createProgress()); assert.equal(writeProgress(createProgress(), blocked), false);
});
test('offline manifest hashes the dataset and covers every referenced image, plus valid PNG app icons', () => {
  assert.equal(manifest.revision, createHash('sha256').update(bytes).digest('hex').slice(0, 16));
  assert.equal(new Set(manifest.urls).size, manifest.urls.length); assert.equal(manifest.urls.length, 633);
  const paths = [...data.questions.map(q => q.image), ...data.signs.map(s => s.image), ...data.practicalLessons.map(l => l.image), ...data.hintImages.map(h => h.image)].filter(Boolean);
  for (const path of paths) assert.ok(manifest.urls.includes(path), path);
  let sum = 0;
  for (const path of manifest.urls) sum += readFileSync(new URL('../dist/' + path, import.meta.url)).length;
  assert.equal(sum, manifest.bytes);
  for (const size of [192, 512]) { const png = readFileSync(new URL(`../dist/icons/icon-${size}.png`, import.meta.url)); assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size); }
});
