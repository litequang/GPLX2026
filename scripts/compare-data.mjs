import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const previous = process.argv[2];
if (!previous) throw new Error('Usage: node scripts/compare-data.mjs <previous dataset.json>');
const oldBytes = readFileSync(previous), newBytes = readFileSync(new URL('../dist/data/dataset.json', import.meta.url));
const old = JSON.parse(oldBytes), fresh = JSON.parse(newBytes), map = new Map(old.questions.map(q => [q.id, q]));
const normalize = text => String(text ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
const changes = { text: [], options: [], answer: [], explanation: [], globalCritical: [], textOptionsAnswer: [] };
for (const q of fresh.questions) {
  const before = map.get(q.id); if (!before) throw new Error(`No previous question ${q.id}`);
  if (normalize(before.text) !== normalize(q.text)) changes.text.push(q.id);
  if (JSON.stringify(before.options.map(o => [o.id, normalize(o.text)])) !== JSON.stringify(q.options.map(o => [o.id, normalize(o.text)]))) changes.options.push(q.id);
  if (before.answer !== q.answer) changes.answer.push(q.id);
  if (normalize(before.explanation) !== normalize(q.explanation)) changes.explanation.push(q.id);
  if (Boolean(before.critical) !== q.critical.ALL) changes.globalCritical.push(q.id);
}
changes.textOptionsAnswer = [...new Set([...changes.text, ...changes.options, ...changes.answer])].sort((a, b) => a - b);
const report = { method: 'Pair by question ID; NFC and whitespace normalization; punctuation retained. Differences are not a measure of factual improvement.', previousSha256: createHash('sha256').update(oldBytes).digest('hex'), currentSha256: createHash('sha256').update(newBytes).digest('hex'), previousCount: old.questions.length, currentCount: fresh.questions.length, counts: Object.fromEntries(Object.entries(changes).map(([key, ids]) => [key, ids.length])), changes };
writeFileSync(new URL('../comparison-report.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.counts, null, 2));
