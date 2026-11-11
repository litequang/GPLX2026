export const normalize = text => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
export const getLicense = (data, name) => data.licenses.find(l => l.name === name) || data.licenses.find(l => l.name === 'B');
export const poolFor = (data, name) => {
  const license = getLicense(data, name);
  return data.questions.filter(q => license.pool === 'ALL' || q.groups.includes(license.pool));
};
export const isCritical = (question, license) => Boolean(question.critical[license.criticalPool]);
export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function randomExam(data, name, random = Math.random) {
  const l = getLicense(data, name), pool = poolFor(data, l.name);
  const critical = shuffle(pool.filter(q => isCritical(q, l)), random)[0];
  const regular = (l.topicQuotas || []).flatMap(quota => {
    const selected = shuffle(pool.filter(q => !isCritical(q, l) && quota.categories.includes(q.category)), random).slice(0, quota.count);
    if (selected.length !== quota.count) throw new Error('Bộ dữ liệu chưa đủ câu theo chủ đề.');
    return selected;
  });
  if (!critical || regular.length !== l.count - 1) throw new Error('Bộ dữ liệu chưa đủ để tạo bài luyện.');
  return shuffle([critical, ...regular], random);
}
export function grade(questions, answers, license) {
  const correct = questions.filter(q => Number(answers[q.id]) === q.answer).length;
  const skipped = questions.filter(q => !answers[q.id]).length;
  const criticalMissed = questions.filter(q => isCritical(q, license) && Number(answers[q.id]) !== q.answer).map(q => q.id);
  return { correct, total: questions.length, skipped, criticalMissed, passed: correct >= license.pass && criticalMissed.length === 0 };
}
export function filterQuestions(questions, { query = '', category = '', status = 'all', progress, license } = {}) {
  const search = normalize(query).trim();
  return questions.filter(q => {
    if (category && q.category !== Number(category)) return false;
    if (status === 'critical' && !isCritical(q, license)) return false;
    if (status === 'wrong' && progress.answers[q.id]?.correct !== false) return false;
    if (status === 'saved' && !progress.bookmarks.includes(q.id)) return false;
    if (status === 'new' && progress.answers[q.id]?.selected > 0) return false;
    return !search || normalize(`${q.id} ${q.text} ${q.options.map(o => o.text).join(' ')}`).includes(search);
  });
}
export function statistics(questions, progress) {
  const answered = questions.filter(q => progress.answers[q.id]?.selected > 0).length;
  const correct = questions.filter(q => progress.answers[q.id]?.correct).length;
  return { total: questions.length, answered, correct, wrong: questions.filter(q => progress.answers[q.id]?.correct === false).length, accuracy: answered ? Math.round(correct / answered * 100) : null, percentage: Math.round(answered / Math.max(1, questions.length) * 100) };
}
export function createProgress() { return { version: 1, license: 'B', answers: {}, bookmarks: [], history: [], lastQuestion: 1 }; }
export function parseProgress(text, data) {
  const input = JSON.parse(text);
  if (!input || input.version !== 1 || !input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers) || !Array.isArray(input.bookmarks) || !Array.isArray(input.history)) throw new Error('Tệp tiến độ không hợp lệ.');
  const result = createProgress(), map = new Map(data.questions.map(q => [q.id, q]));
  if (data.licenses.some(l => l.name === input.license)) result.license = input.license;
  if (map.has(input.lastQuestion)) result.lastQuestion = input.lastQuestion;
  result.bookmarks = [...new Set(input.bookmarks.filter(id => map.has(id)))];
  for (const [id, answer] of Object.entries(input.answers)) {
    const q = map.get(Number(id));
    if (!q || !answer || !Number.isInteger(answer.selected) || (answer.selected !== 0 && !q.options.some(o => o.id === answer.selected))) continue;
    result.answers[q.id] = { selected: answer.selected, correct: answer.selected === q.answer, at: Number.isFinite(answer.at) ? answer.at : 0, attempts: Math.max(1, Math.min(1e6, Number(answer.attempts) || 1)) };
  }
  result.history = input.history.filter(h => h && typeof h.id === 'string' && data.licenses.some(l => l.name === h.license) && Array.isArray(h.ids) && h.ids.length <= 45 && h.ids.length >= 1 && h.ids.every(id => map.has(id)) && new Set(h.ids).size === h.ids.length && h.answers && typeof h.answers === 'object' && Number.isFinite(h.finishedAt)).slice(0, 30).map(h => ({ id: h.id.slice(0, 100), license: h.license, title: String(h.title || 'Bài luyện').slice(0, 100), kind: h.kind === 'fixed' ? 'fixed' : 'random', ids: h.ids, answers: Object.fromEntries(h.ids.map(id => [id, map.get(id).options.some(o => o.id === Number(h.answers[id])) ? Number(h.answers[id]) : 0])), finishedAt: h.finishedAt, startedAt: Number(h.startedAt) || h.finishedAt }));
  return result;
}
export function parseActiveExam(text, data) {
  const input = JSON.parse(text);
  if (!input || !data.licenses.some(l => l.name === input.license) || !Array.isArray(input.ids) || input.ids.length !== getLicense(data, input.license).count || new Set(input.ids).size !== input.ids.length || !Number.isFinite(input.deadline) || !Number.isFinite(input.startedAt) || input.deadline <= input.startedAt || !input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) return null;
  const map = new Map(data.questions.map(q => [q.id, q]));
  if (!input.ids.every(id => map.has(id))) return null;
  return { id: String(input.id || input.startedAt), license: input.license, title: String(input.title || 'Bài luyện').slice(0, 100), kind: input.kind === 'fixed' ? 'fixed' : 'random', ids: input.ids, index: Math.max(0, Math.min(input.ids.length - 1, Math.floor(Number(input.index)) || 0)), deadline: input.deadline, startedAt: input.startedAt, answers: Object.fromEntries(input.ids.filter(id => map.get(id).options.some(o => o.id === Number(input.answers[id]))).map(id => [id, Number(input.answers[id])])) };
}
