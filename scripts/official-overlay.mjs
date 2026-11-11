import { readFileSync } from 'node:fs';

export const official = JSON.parse(readFileSync(new URL('../content/official-2026.json', import.meta.url)));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Fail closed on a different Android snapshot; never silently overwrite a new source.
export function applyOfficialCorrections(data) {
  if (data.source?.databaseSha256 !== official.sourceDatabaseSha256) throw new Error('Official overlay requires the reviewed source database hash.');
  if (data.questions.length !== 600 || data.questions.some((q, i) => q.id !== i + 1)) throw new Error('Official overlay requires the inspected 600-question snapshot.');
  for (const [group, ids] of Object.entries(official.pools)) {
    if (!equal(data.questions.filter(q => q.groups.includes(group)).map(q => q.id), ids)) throw new Error(`Unexpected ${group} membership.`);
  }
  for (const [group, ids] of Object.entries(official.critical)) {
    if (!equal(data.questions.filter(q => q.critical[group]).map(q => q.id), ids)) throw new Error(`Unexpected ${group} critical flags.`);
  }
  const missingB = data.questions.filter(q => !q.groups.includes('B')).map(q => q.id);
  if (missingB.length && !equal(missingB, official.restoredB)) throw new Error('Unexpected B membership.');
  for (const q of data.questions) if (!q.groups.includes('B')) q.groups.push('B');
  for (const patch of official.corrections) {
    const q = data.questions.find(q => q.id === patch.id);
    const current = patch.replaceAllOptions ? q.options : q.options.filter(o => patch.before.some(b => b.id === o.id));
    if (!equal(current, patch.before) && !equal(current, patch.after)) throw new Error(`Question ${patch.id} changed; review the official patch.`);
    q.options = patch.replaceAllOptions ? structuredClone(patch.after) : q.options.map(o => structuredClone(patch.after.find(a => a.id === o.id) || o));
    if (!q.options.some(o => o.id === q.answer)) throw new Error(`Missing answer for ${q.id}.`);
  }
  for (const l of data.licenses) {
    const motorcycle = ['A1', 'A', 'B1'].includes(l.name);
    const counts = official.allocations[motorcycle ? 'motorcycle' : ['B', 'C1', 'C'].includes(l.name) ? l.name : 'large'];
    const groups = motorcycle ? [[1], [2], [3, 4], [5], [6]] : [[1], [2], [3], [4], [5], [6]];
    l.topicQuotas = groups.map((categories, i) => ({ categories, count: counts[i] }));
    if (1 + counts.reduce((a, b) => a + b, 0) !== l.count) throw new Error(`Invalid quota for ${l.name}.`);
  }
  data.officialAudit = { checkedOn: official.checkedOn, guidance: '2262/CSGT-P5', structureValidThrough: official.structureValidThrough, correctedQuestionIds: official.corrections.map(p => p.id), scope: 'License membership, critical lists, topic quotas and selected visually reviewed option wording; not a complete legal/content/image audit.' };
  return data;
}
