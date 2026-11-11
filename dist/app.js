import { getLicense, poolFor, isCritical, randomExam, grade, filterQuestions, statistics, createProgress, parseProgress } from './modules/core.js?v=4';
import { readProgress, readExam, writeProgress, writeExam } from './modules/storage.js';
import { escape as e, icon, dateLabel, dayKey, durationLabel, progressBar } from './modules/ui.js';
import { setupAutoHideBars } from './modules/chrome.js';
import { createOfflineDownload, activeWorker } from './modules/offline.js';
import { setupInstall } from './modules/install.js';

const $ = selector => document.querySelector(selector);
const nav = [
  { group: 'HỌC & LUYỆN TẬP', items: [['home', 'Tổng quan', 'layout-dashboard'], ['learn', 'Học câu hỏi', 'book-open'], ['exams', 'Luyện đề', 'clipboard-check']] },
  { group: 'THƯ VIỆN KIẾN THỨC', items: [['critical', 'Câu điểm liệt', 'triangle-alert'], ['signs', 'Biển báo đường bộ', 'traffic-cone'], ['handbook', 'Cẩm nang & sa hình', 'lightbulb']] },
  { group: 'GÓC ÔN TẬP CỦA BẠN', items: [['wrong', 'Câu cần ôn lại', 'refresh-cw'], ['saved', 'Câu đã đánh dấu', 'bookmark'], ['history', 'Lịch sử luyện đề', 'history']] },
];
const routes = nav.flatMap(g => g.items);
const learningRoutes = ['learn', 'critical', 'wrong', 'saved'];
let data, questionMap, progress, activeExam, offlineManifest, registration, offlineDownload;
let state = { route: 'home', query: '', topic: '', scope: 'license', status: 'all', filtersOpen: false, index: 0, list: [], responses: {}, signCategory: '', signLimit: 32, examTab: 'random', handbookTab: 'practical', lesson: null, review: null, reviewFilter: 'all' };
let offline = { status: 'idle', completed: 0, total: 0 };
let toastTimeout, storageWarning = false;
const chrome = setupAutoHideBars();
const installer = setupInstall({ button: $('#install-button'), onInstalled: () => toast('Đã cài ứng dụng. Chúc bạn học tốt!'), onError: () => toast('Chưa mở được hộp thoại cài. Hãy thử lại khi trình duyệt cho phép.'), onChange: available => document.querySelectorAll('[data-action="install-app"]').forEach(button => { button.hidden = !available; }) });
const currentLicense = () => getLicense(data, progress.license);
const currentPool = () => poolFor(data, progress.license);
const categoryName = id => data.categories.find(c => c.id === id)?.name || 'Tổng hợp';
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 4500); }
function warnStorage() { if (!storageWarning) { storageWarning = true; toast('Trình duyệt chưa lưu được dữ liệu. Hãy xuất tiến độ để giữ kết quả.'); } }
function persist() { if (!writeProgress(progress)) warnStorage(); }
function persistExam() { if (!writeExam(activeExam)) warnStorage(); }
function closeDialog() { if ($('#dialog').open) $('#dialog').close(); }
function showDialog(html) { $('#dialog-content').innerHTML = html; if (!$('#dialog').open) $('#dialog').showModal(); }
const dialogHeading = title => `<div class="dialog-heading"><h2>${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="Đóng">${icon('x')}</button></div>`;
const button = (label, action, kind = 'primary', attrs = '') => `<button class="button button-${kind}" data-action="${action}" ${attrs}>${label}</button>`;
function heading(title, description, extra = '') { return `<div class="page-heading"><div><p class="eyebrow">HỌC VỮNG · THI TỰ TIN</p><h1>${title}</h1>${description ? `<p class="subtitle">${description}</p>` : ''}</div>${extra}</div>`; }
function navMarkup() {
  const p = currentPool(), l = currentLicense();
  return nav.map(group => `<p class="nav-label">${group.group}</p><nav aria-label="${group.group}">${group.items.map(([route, label, symbol]) => {
    const count = route === 'critical' ? p.filter(q => isCritical(q, l)).length : route === 'wrong' ? p.filter(q => progress.answers[q.id]?.correct === false).length : route === 'saved' ? p.filter(q => progress.bookmarks.includes(q.id)).length : null;
    return `<a class="nav-link ${state.route === route ? 'active' : ''}" href="#${route}" data-go="${route}" ${state.route === route ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span>${count !== null ? `<span class="nav-count">${count}</span>` : ''}</a>`;
  }).join('')}</nav>`).join('');
}
function renderShell() {
  const markup = navMarkup(); $('#desktop-nav').innerHTML = markup; $('#mobile-nav').innerHTML = markup;
  $('#breadcrumb-current').textContent = routes.find(r => r[0] === state.route)?.[1] || 'Tổng quan';
  $('#license-select').innerHTML = data.licenses.map(l => `<option value="${e(l.name)}" ${l.name === progress.license ? 'selected' : ''}>Hạng ${e(l.name)}</option>`).join('');
  $('#license-select').disabled = Boolean(activeExam);
  $('#menu-trigger').innerHTML = icon('menu');
  $('#bottom-nav').innerHTML = [['home', 'Tổng quan', 'layout-dashboard'], ['learn', 'Học câu hỏi', 'book-open'], ['exams', 'Luyện đề', 'clipboard-check'], ['signs', 'Biển báo', 'traffic-cone']].map(([route, label, symbol]) => `<a href="#${route}" data-go="${route}" class="${state.route === route ? 'active' : ''}" ${state.route === route ? 'aria-current="page"' : ''}>${icon(symbol)}<span>${label}</span></a>`).join('') + `<button data-action="menu" class="${!['home', 'learn', 'exams', 'signs'].includes(state.route) ? 'active' : ''}" aria-label="Mở các mục khác">${icon('menu')}<span>Thêm</span></button>`;
}
function applyRoute() {
  const [name, query = ''] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(query);
  state = { ...state, route: routes.some(r => r[0] === name) ? name : 'home', query: params.get('q') || '', topic: params.get('topic') || '', scope: params.get('scope') === 'all' ? 'all' : 'license', filtersOpen: false, index: 0, list: [], responses: {}, signCategory: params.get('category') || '', signLimit: 32, lesson: params.get('lesson') ? Number(params.get('lesson')) : null, handbookTab: params.get('tab') === 'theory' ? 'theory' : 'practical', review: params.get('result') ? progress.history.find(h => h.id === params.get('result')) || null : null, reviewFilter: 'all' };
  rebuildStudy();
  if (params.get('question')) { const index = state.list.findIndex(q => q.id === Number(params.get('question'))); if (index >= 0) state.index = index; }
  if ($('#menu-dialog').open) $('#menu-dialog').close();
  chrome.show(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); chrome.sync();
}
function go(route, params = {}, replace = false) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null));
  const hash = `#${route}${query.size ? '?' + query : ''}`;
  if (location.hash !== hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash);
  applyRoute();
  $('#main').focus({ preventScroll: true });
}
function updateRouteFilters() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.topic) params.set('topic', state.topic);
  if (state.scope === 'all') params.set('scope', 'all');
  if (state.signCategory) params.set('category', state.signCategory);
  history.replaceState(null, '', `#${state.route}${params.size ? '?' + params : ''}`);
}
function resumeBanner() { return activeExam ? `<div class="resume-banner">${icon('clock')}<div><h3>Bạn có một bài luyện đang làm</h3><p>Hạng ${e(activeExam.license)} · ${Object.keys(activeExam.answers).length}/${activeExam.ids.length} câu đã chọn. Đồng hồ vẫn đang chạy.</p></div>${button('Tiếp tục bài làm ' + icon('arrow-right', 15), 'resume-exam', 'secondary')}</div>` : ''; }
function updateOfflineUI() {
  const control = $('#offline-button'); if (!control || !offlineManifest) return;
  control.hidden = false; control.dataset.status = offline.status;
  const percent = Math.round(offline.completed / Math.max(1, offline.total) * 100);
  const label = offline.status === 'ready' ? 'Đã sẵn sàng học ngoại tuyến' : offline.status === 'downloading' ? `Đang tải ngoại tuyến: ${percent}%` : offline.status === 'error' ? 'Tải ngoại tuyến chưa xong — thử lại' : 'Tải để học ngoại tuyến';
  control.setAttribute('aria-label', label); control.title = label;
  control.innerHTML = icon(offline.status === 'ready' ? 'check' : offline.status === 'error' ? 'triangle-alert' : 'download', 19) + (offline.status === 'downloading' ? `<small class="offline-percent">${percent}%</small>` : '');
  const detail = $('#offline-detail');
  if (detail) detail.textContent = offline.status === 'ready' ? 'Đã lưu đủ câu hỏi, cẩm nang và hình ảnh.' : offline.status === 'downloading' ? `Đã tải ${offline.completed}/${offline.total} mục. Bạn có thể đóng hộp này để tiếp tục học.` : offline.status === 'error' ? 'Tải chưa hoàn tất. Bấm icon để thử lại khi có mạng.' : '';
}
function offlineDialog() {
  if (!offlineManifest) return;
  const busy = offline.status === 'downloading', ready = offline.status === 'ready';
  showDialog(`${dialogHeading(ready ? 'Sẵn sàng học ngoại tuyến' : busy ? 'Đang tải trong nền' : 'Lưu để học ngoại tuyến?')}<p class="dialog-copy">${ready ? 'Câu hỏi, cẩm nang và hình ảnh đã được lưu trên trình duyệt này.' : busy ? 'Bạn vẫn có thể đọc câu hỏi và luyện đề trong lúc tải.' : `Tải khoảng ${(offlineManifest.bytes / 1024 / 1024).toFixed(1)} MB. Sau khi xác nhận, app sẽ tải trong nền và tiếp tục khi bạn mở lại nếu bị gián đoạn. Dữ liệu mới cũng sẽ được tải khi bạn mở app.`}</p><p class="dialog-copy" id="offline-detail" role="status" aria-live="polite"></p><div class="dialog-actions">${button(busy || ready ? 'Tiếp tục học' : 'Để sau', 'close-dialog', 'secondary')}${busy || ready ? '' : button('Tải và dùng ngoại tuyến', 'download-offline')}</div>`);
  updateOfflineUI();
}
function renderHome() {
  const p = currentPool(), l = currentLicense(), stats = statistics(p, progress), critical = p.filter(q => isCritical(q, l));
  const today = dayKey(Date.now()), daily = Object.values(progress.answers).filter(a => a.selected > 0 && dayKey(a.at) === today).length;
  const topicIcons = { 1: 'book-open', 2: 'shield-check', 3: 'car', 4: 'settings', 5: 'traffic-cone', 6: 'route' };
  $('#main').innerHTML = `${heading('Chào bạn, hôm nay học gì?', 'Giữ một nhịp học nhỏ. Chuẩn bị cho một hành trình lớn.', `<span class="eyebrow-chip">${icon('book-open', 13)} Bộ 600 câu</span>`)}${resumeBanner()}
    <div class="welcome-grid"><section class="hero"><div class="hero-copy"><p class="eyebrow">MỖI NGÀY MỘT CHÚT, MỖI CHẶNG VỮNG VÀNG</p><h2>Vững kiến thức.<br>Tự tin mọi hành trình.</h2><p>Học để hiểu, luyện để nhớ.<br>Cùng bạn chuẩn bị từng câu hỏi, từng biển báo.</p>${button((stats.answered ? 'Tiếp tục học' : 'Bắt đầu hành trình') + icon('arrow-right', 16), 'continue-study')}</div><div class="hero-art" aria-hidden="true"><svg viewBox="0 0 350 280" fill="none"><circle cx="256" cy="114" r="142" fill="#315ed0"/><circle cx="256" cy="114" r="105" stroke="#6887db" stroke-opacity=".5"/><circle cx="256" cy="114" r="73" stroke="#6887db" stroke-opacity=".4"/><path d="M82 322v-87c0-29 21-42 50-42h69c47 0 49-65 0-65h-12c-50 0-46-67 0-67h139" stroke="#7e9ae2" stroke-width="46"/><path d="M82 322v-87c0-29 21-42 50-42h69c47 0 49-65 0-65h-12c-50 0-46-67 0-67h139" stroke="#e8efff" stroke-width="2" stroke-dasharray="9 11"/><g transform="translate(136 180)"><rect width="43" height="25" rx="9" fill="#ffe2a0"/><rect x="11" y="4" width="23" height="17" rx="5" fill="#4d6592"/><path d="M20 4v17" stroke="#bccde9"/></g><path d="m91 70 11-19 11 19Z" fill="#ffd889"/><path d="M102 69v10" stroke="#ffd889" stroke-width="2"/><g transform="translate(273 222)"><circle r="16" fill="#ffdc8d"/><path d="m-5 0 4 4 7-8" stroke="#8d6821" stroke-width="2" stroke-linecap="round"/></g><circle cx="282" cy="24" r="4" fill="#a9c0f2"/><circle cx="311" cy="38" r="2" fill="#a9c0f2"/></svg></div></section><aside class="goal-card"><div class="goal-heading"><h3>Nhịp học hôm nay</h3>${icon('target', 19)}</div><div class="goal-ring" style="--progress:${Math.min(100, daily / 30 * 100)}%"><div><strong>${daily}</strong><small>/ 30 câu mỗi ngày</small></div></div><p>${daily >= 30 ? 'Bạn đã hoàn thành mục tiêu hôm nay!' : 'Chậm mà chắc, thêm một chút mỗi ngày.'}</p><button class="text-button" data-action="continue-study">Dành vài phút để học ${icon('arrow-right', 13)}</button></aside></div>
    <div class="stats-grid">${[
      ['Kho câu hỏi', data.questions.length, 'câu', `${p.length} câu cho hạng ${l.name}`, 'book-open', ''],
      ['Đã học', stats.answered, `/ ${stats.total}`, `${stats.percentage}% bộ câu đang học`, 'circle-check', 'green'],
      ['Trả lời đúng', stats.accuracy === null ? '—' : stats.accuracy, stats.accuracy === null ? '' : '%', 'Theo lần trả lời gần nhất', 'target', ''],
      ['Câu điểm liệt', critical.length, 'câu', `${critical.filter(q => progress.answers[q.id]?.correct).length} câu đã trả lời đúng`, 'triangle-alert', 'amber'],
    ].map(([label, value, unit, note, symbol, style]) => `<div class="stat-card"><div class="stat-top"><span class="stat-icon ${style}">${icon(symbol, 15)}</span><span>${label}</span></div><div class="stat-value">${value}<small>${unit}</small></div><p class="stat-note">${note}</p></div>`).join('')}</div>
    <div class="home-lower"><section><div class="section-heading"><h2>Chọn một chủ đề để bắt đầu</h2><a class="text-button" href="#learn?scope=all" data-go="learn" data-scope="all">Xem toàn bộ ${icon('arrow-up-right', 13)}</a></div><div class="topic-grid">${data.categories.filter(c => p.some(q => q.category === c.id)).map((c, index) => { const qs = p.filter(q => q.category === c.id), s = statistics(qs, progress); return `<button class="topic-card" data-action="topic" data-id="${c.id}"><div class="topic-top"><span class="topic-icon">${icon(topicIcons[c.id], 20)}</span><span class="topic-no">CHỦ ĐỀ ${String(index + 1).padStart(2, '0')}</span></div><h3>${e(c.name)}</h3><div class="topic-meta"><span>${qs.length} câu hỏi · ${s.answered} đã học</span>${icon('arrow-up-right', 14)}</div>${progressBar(s.percentage, 'Tiến độ ' + c.name)}</button>`; }).join('')}</div></section><aside class="home-aside"><div class="panel critical-card"><p class="eyebrow">ƯU TIÊN ÔN KỸ</p><h3>Nhớ chắc từng<br>câu điểm liệt.</h3><p>${critical.length} câu quan trọng trong bộ hạng ${e(l.name)}. Hiểu tình huống để tránh những sai sót đáng tiếc.</p><a class="text-button" href="#critical" data-go="critical">Bắt đầu ôn tập ${icon('arrow-right', 14)}</a></div><div class="panel quick-note">${icon('clipboard-check', 22)}<h3>Học xong, thử một bài luyện.</h3><p>Làm bài có đồng hồ, xem kết quả và ôn lại những câu còn chưa chắc.</p><a class="text-button" href="#exams" data-go="exams">Đến phần luyện đề ${icon('arrow-right', 13)}</a></div></aside></div>`;
}
function rebuildStudy() {
  if (!learningRoutes.includes(state.route)) { state.list = []; return; }
  const scope = state.route === 'learn' && state.scope === 'all' ? data.questions : currentPool();
  state.list = filterQuestions(scope, { query: state.query, category: state.topic, status: state.route === 'learn' ? state.status : state.route, progress, license: currentLicense() });
  state.index = Math.min(state.index, Math.max(0, state.list.length - 1));
}
function searchField(placeholder) { return `<label class="search-field"><span class="field-label">Tìm kiếm</span><span class="search-box">${icon('search', 18)}<input id="content-search" type="search" placeholder="${e(placeholder)}" value="${e(state.query)}" autocomplete="off"></span></label>`; }
function studyToolbar() {
  const filtered = state.query || state.topic || (state.route === 'learn' && state.status !== 'all');
  return `<details class="study-filters" id="study-filters" ${state.filtersOpen ? 'open' : ''}><summary>${icon('search', 16)}<span>Lọc & tìm câu hỏi${filtered ? '<i class="filter-dot" aria-label="Đang áp dụng bộ lọc"></i>' : ''}</span><small>${state.list.length} câu · ${state.scope === 'all' && state.route === 'learn' ? 'Toàn bộ' : `Hạng ${e(progress.license)}`}</small>${icon('chevron-down', 15)}</summary><div class="study-filter-content"><div class="toolbar">${searchField('Nội dung hoặc số câu hỏi…')}<label class="select-field"><span class="field-label">Chủ đề</span><select id="topic-filter"><option value="">Tất cả chủ đề</option>${data.categories.map(c => `<option value="${c.id}" ${String(c.id) === state.topic ? 'selected' : ''}>${e(c.name)}</option>`).join('')}</select></label></div>${state.route === 'learn' ? `<div class="filter-row"><label><span class="field-label">Phạm vi học</span><select id="scope-filter"><option value="license" ${state.scope === 'license' ? 'selected' : ''}>Theo hạng ${e(progress.license)} (${currentPool().length} câu)</option><option value="all" ${state.scope === 'all' ? 'selected' : ''}>Toàn bộ 600 câu</option></select></label><label><span class="field-label">Trạng thái</span><select id="learn-status"><option value="all" ${state.status === 'all' ? 'selected' : ''}>Tất cả</option><option value="new" ${state.status === 'new' ? 'selected' : ''}>Chưa học</option></select></label></div>` : ''}</div></details>`;
}
function emptyState(title, description, symbol = 'book-open') { return `<section class="empty-state">${icon(symbol, 36)}<h2>${title}</h2><p>${description}</p>${button('Mở bộ câu hỏi ' + icon('arrow-right', 16), 'open-learn')}</section>`; }
function questionCard(q, selected, mode = 'study') {
  const exam = mode === 'exam', reveal = selected && !exam, l = exam ? getLicense(data, activeExam.license) : currentLicense();
  const index = exam ? activeExam.index : state.index, total = exam ? activeExam.ids.length : state.list.length;
  return `<article class="question-card" tabindex="-1"><div class="question-meta"><span class="question-id">CÂU ${q.id}</span><span class="tag question-topic">${e(categoryName(q.category))}</span>${!exam && isCritical(q, l) ? `<span class="tag tag-critical">${icon('triangle-alert', 11)} Điểm liệt</span>` : ''}<button class="icon-button ${progress.bookmarks.includes(q.id) ? 'saved' : ''}" data-action="bookmark" data-id="${q.id}" aria-label="${progress.bookmarks.includes(q.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'} câu ${q.id}" aria-pressed="${progress.bookmarks.includes(q.id)}">${icon('bookmark', 18)}</button></div><h2 class="question-text" id="question-title">${e(q.text)}</h2>${q.image ? `<img class="question-image" src="${e(q.image)}" alt="Hình minh họa câu ${q.id}" decoding="async">` : ''}<div class="answer-options" role="group" aria-labelledby="question-title">${q.options.map(o => {
    const chosen = Number(selected) === o.id, style = reveal ? o.id === q.answer ? 'correct' : chosen ? 'wrong' : '' : chosen ? 'selected' : '';
    return `<button class="answer-option ${style}" data-action="${exam ? 'exam-answer' : 'study-answer'}" data-option="${o.id}" aria-pressed="${chosen}" ${reveal ? 'disabled' : ''}><span class="option-number">${o.id}</span><span>${e(o.text)}</span>${reveal && (o.id === q.answer || chosen) ? `<span class="answer-mark" aria-label="${o.id === q.answer ? 'Đáp án đúng' : 'Đáp án bạn chọn chưa đúng'}">${icon(o.id === q.answer ? 'check' : 'x', 19)}</span>` : ''}</button>`;
  }).join('')}</div><div class="question-controls" aria-label="Chuyển câu hỏi">${button(icon('arrow-left', 15) + ' Câu trước', exam ? 'exam-jump' : 'study-jump', 'secondary', `data-index="${index - 1}" ${index === 0 ? 'disabled' : ''}`)}<span class="question-position">${index + 1}/${total}</span>${button('Câu tiếp ' + icon('arrow-right', 15), exam ? 'exam-jump' : 'study-jump', 'primary', `data-index="${index + 1}" ${index >= total - 1 ? 'disabled' : ''}`)}</div>${reveal ? `<div class="answer-status ${Number(selected) === q.answer ? '' : 'wrong'}" role="status">${icon(Number(selected) === q.answer ? 'circle-check' : 'circle-help', 19)}<span>${Number(selected) === q.answer ? 'Chính xác. Thêm một câu đã nắm vững!' : `Đáp án đúng là ${q.answer}. Cùng xem lại nhé.`}</span></div><section class="explanation"><div class="explanation-heading"><h3>${icon('lightbulb', 16)} Giải thích theo ứng dụng gốc</h3><button class="text-button" data-action="retry-question">Làm lại</button></div><p>${e(q.explanation || 'Câu này chưa có giải thích trong dữ liệu gốc.')}</p>${q.memoryTip ? `<div class="memory-tip"><h3>Gợi ý ghi nhớ</h3><p>${e(q.memoryTip)}</p></div>` : ''}</section>` : ''}</article>`;
}
function questionNavigator(questions, index, mode = 'study') {
  const exam = mode === 'exam', page = Math.floor(index / 60), start = page * 60;
  const responses = exam ? activeExam.answers : Object.fromEntries(questions.map(q => [q.id, state.responses[q.id] ?? progress.answers[q.id]?.selected]));
  const done = questions.filter(q => responses[q.id] > 0).length;
  return `<aside class="panel question-navigator"><h3>${exam ? 'Phiếu trả lời' : 'Danh sách câu hỏi'}</h3><p class="navigator-note">${done}/${questions.length} câu ${exam ? 'đã chọn đáp án' : 'đã trả lời'}</p><div class="number-grid">${questions.slice(start, start + 60).map((q, i) => {
    const value = responses[q.id], status = value ? exam ? 'answered' : Number(value) === q.answer ? 'correct' : 'wrong' : '';
    return `<button class="number-button ${status} ${start + i === index ? 'current' : ''}" data-action="${exam ? 'exam-jump' : 'study-jump'}" data-index="${start + i}" aria-label="${exam ? `Vị trí ${start + i + 1}, câu ${q.id}` : `Câu ${q.id}`}${value ? exam ? ', đã chọn' : Number(value) === q.answer ? ', đã trả lời đúng' : ', cần ôn lại' : ', chưa trả lời'}" ${start + i === index ? 'aria-current="true"' : ''}>${exam ? start + i + 1 : q.id}</button>`;
  }).join('')}</div>${questions.length > 60 ? `<div class="navigator-pages">${button(icon('chevron-left', 15), 'study-jump', 'secondary', `data-index="${Math.max(0, start - 60)}" aria-label="Nhóm câu trước" ${page === 0 ? 'disabled' : ''}`)}<span>${start + 1}–${Math.min(start + 60, questions.length)} / ${questions.length}</span>${button(icon('chevron-right', 15), 'study-jump', 'secondary', `data-index="${start + 60}" aria-label="Nhóm câu sau" ${start + 60 >= questions.length ? 'disabled' : ''}`)}</div>` : ''}<div class="navigator-legend"><span><i class="legend-square"></i>${exam ? 'Đã chọn' : 'Đúng'}</span>${exam ? '' : '<span><i class="legend-square wrong"></i>Cần ôn</span>'}</div>${exam ? `<div style="margin-top:22px">${button('Nộp bài ' + icon('check', 16), 'submit-exam', 'primary', 'style="width:100%"')}</div>` : '<p class="key-hint">Phím 1–4 để chọn đáp án.<br>Phím ← → để chuyển câu.</p>'}</aside>`;
}
function renderStudy() {
  $('#main').dataset.view = 'study';
  const title = routes.find(r => r[0] === state.route)[1], q = state.list[state.index];
  const titleEmpty = state.query || state.topic || state.status === 'new' ? 'Không có câu phù hợp bộ lọc' : state.route === 'wrong' ? 'Chưa có câu nào cần ôn lại' : state.route === 'saved' ? 'Chưa có câu được đánh dấu' : 'Chưa tìm thấy câu hỏi';
  $('#main').innerHTML = `<div class="study-heading"><h1>${e(title)}</h1><span>${q ? `${state.index + 1}/${state.list.length}` : '0 câu'}</span></div>${studyToolbar()}${q ? `<div class="study-layout">${questionCard(q, state.responses[q.id])}${questionNavigator(state.list, state.index)}</div>` : emptyState(titleEmpty, state.route === 'saved' && !state.query ? 'Bấm biểu tượng đánh dấu trên mỗi câu hỏi để lưu tại đây.' : 'Thử bỏ bộ lọc hoặc mở lại bộ câu hỏi để tiếp tục học.', state.route === 'saved' ? 'bookmark' : 'circle-check')}`;
}
function renderSigns() {
  const query = state.query.trim().toLocaleLowerCase('vi');
  const signs = data.signs.filter(s => (!state.signCategory || s.category === Number(state.signCategory)) && (!query || normalizeSearch(`${s.code} ${s.name} ${s.detail}`).includes(normalizeSearch(query))));
  $('#main').innerHTML = `${heading('Hiểu biển báo, vững đường đi.', 'Tra cứu hình ảnh và ý nghĩa của các biển báo trong ứng dụng nguồn.')}<div class="toolbar">${searchField('Tìm mã biển hoặc tên biển báo…')}<label class="select-field"><span class="field-label">Nhóm biển báo</span><select id="sign-category"><option value="">Tất cả nhóm</option>${data.signCategories.filter(c => data.signs.some(s => s.category === c.id)).map(c => `<option value="${c.id}" ${String(c.id) === state.signCategory ? 'selected' : ''}>${e(c.name)}</option>`).join('')}</select></label></div><p class="filter-row">${signs.length} biển báo trong thư viện</p>${signs.length ? `<div class="sign-grid">${signs.slice(0, state.signLimit).map(s => `<button class="sign-card" data-action="sign-detail" data-id="${s.id}"><img src="${e(s.image)}" alt="${e(s.name)}" loading="lazy" decoding="async"><span class="sign-code">${e(s.code)}</span><h3>${e(s.shortName)}</h3><small>Xem ý nghĩa →</small></button>`).join('')}</div>${signs.length > state.signLimit ? `<div class="center-actions">${button(`Xem thêm (${signs.length - state.signLimit} biển còn lại) ` + icon('chevron-down', 15), 'more-signs', 'secondary')}</div>` : ''}` : emptyState('Không tìm thấy biển báo', 'Thử một từ khóa ngắn hơn hoặc bỏ lọc nhóm biển báo.', 'traffic-cone')}`;
}
const normalizeSearch = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();

function historyPreview() {
  return `<aside class="panel"><div class="section-heading"><h3>Những lần thử sức</h3>${icon('history', 18)}</div>${progress.history.length ? progress.history.slice(0, 5).map(h => { const result = grade(h.ids.map(id => questionMap.get(id)), h.answers, getLicense(data, h.license)); return `<div class="history-preview"><span class="history-icon ${result.passed ? '' : 'failed'}">${icon(result.passed ? 'check' : 'refresh-cw', 15)}</span><div><p>Hạng ${e(h.license)}</p><small>${dateLabel(h.finishedAt)}</small></div><strong>${result.correct}/${result.total}</strong></div>`; }).join('') : '<p class="subtitle">Chưa có bài luyện nào. Thử một bài để bắt đầu theo dõi sự tiến bộ của bạn.</p>'}<a class="text-button" href="#history" data-go="history">Xem lịch sử ${icon('arrow-right', 13)}</a></aside>`;
}
function renderExamSetup() {
  $('#main').dataset.view = 'default';
  const l = currentLicense();
  const tabs = `<div class="segmented" aria-label="Chọn loại bài luyện"><button data-action="exam-tab" data-tab="random" class="${state.examTab === 'random' ? 'active' : ''}" aria-pressed="${state.examTab === 'random'}">Luyện ngẫu nhiên</button><button data-action="exam-tab" data-tab="fixed" class="${state.examTab === 'fixed' ? 'active' : ''}" aria-pressed="${state.examTab === 'fixed'}">Bộ bài ôn từ ứng dụng</button></div>`;
  const fixed = data.fixedExams.filter(t => t.license === progress.license);
  const content = state.examTab === 'random' ? `<div class="exam-setup"><section class="panel exam-intro"><p class="eyebrow">BÀI LUYỆN NGẪU NHIÊN · HẠNG ${e(l.name)}</p><h2>Một lần thử, thêm tự tin.</h2><p>Dành một khoảng thời gian tập trung để kiểm tra kiến thức. Chọn đáp án, hoàn thành bài và xem lại những câu chưa chắc.</p><div class="exam-facts"><div><strong>${l.count}</strong><small>câu hỏi</small></div><div><strong>${l.minutes}</strong><small>phút làm bài</small></div><div><strong>${l.pass}/${l.count}</strong><small>ngưỡng đúng theo app</small></div></div><div class="notice">Bài ngẫu nhiên chọn đúng 1 câu điểm liệt theo hạng. Sai hoặc bỏ trống câu đó sẽ không đạt bài luyện. Đây là chế độ ôn tập; không khẳng định cơ cấu chủ đề giống đề thi chính thức.</div>${button('Bắt đầu làm bài ' + icon('arrow-right', 16), 'start-random')}</section>${historyPreview()}</div>` : `<div class="notice">${fixed.length} bài được giữ theo danh sách câu trong ứng dụng gốc. Một số bài có nhiều câu điểm liệt và có thể có câu ngoài bộ lọc hạng. Phù hợp để ôn thêm nội dung; không phải xác nhận đề sát hạch chính thức.</div><div class="fixed-grid">${fixed.map(t => { const criticalCount = t.questionIds.filter(id => isCritical(questionMap.get(id), l)).length; return `<button class="fixed-card" data-action="start-fixed" data-id="${t.id}">${icon('clipboard-check', 23)}<h3>Bài ôn ${e(t.number)}</h3><p>${t.questionIds.length} câu · ${l.minutes} phút</p><span class="tag">${criticalCount} câu điểm liệt theo hạng</span></button>`; }).join('')}</div>`;
  $('#main').innerHTML = `${heading('Thử sức để tiến bộ.', 'Chọn cách luyện phù hợp, nhìn lại kết quả để học chắc hơn.')}${tabs}${content}`;
}
function activeQuestions() { return activeExam.ids.map(id => questionMap.get(id)); }
function renderActiveExam() {
  $('#main').dataset.view = 'exam';
  const questions = activeQuestions(), q = questions[activeExam.index];
  $('#main').innerHTML = `<div class="exam-heading"><div><h1>${e(activeExam.title)} · Hạng ${e(activeExam.license)}</h1><p>Câu ${activeExam.index + 1}/${questions.length} · Đã chọn ${Object.keys(activeExam.answers).length} đáp án</p></div><div class="clock" id="exam-clock" aria-label="Thời gian còn lại">${icon('clock', 17)}<span></span></div></div><div class="study-layout">${questionCard(q, activeExam.answers[q.id], 'exam')}${questionNavigator(questions, activeExam.index, 'exam')}</div><p class="source-note">Bạn có thể đổi đáp án trước khi nộp. Đồng hồ vẫn chạy khi chuyển màn hình hoặc đóng ứng dụng; hết giờ bài sẽ được nộp khi ứng dụng hoạt động lại.</p>`;
  updateClock();
}
function renderResult(record) {
  $('#main').dataset.view = 'default';
  const questions = record.ids.map(id => questionMap.get(id)), l = getLicense(data, record.license), result = grade(questions, record.answers, l);
  const visible = state.reviewFilter === 'wrong' ? questions.filter(q => Number(record.answers[q.id]) !== q.answer) : questions;
  $('#main').innerHTML = `${heading('Nhìn lại một chặng vừa qua.', `${e(record.title)} · Hạng ${e(record.license)} · ${dateLabel(record.finishedAt)}`)}<section class="result-hero ${result.passed ? '' : 'failed'}"><div><p class="eyebrow">${result.passed ? 'ĐẠT NGƯỠNG BÀI LUYỆN' : 'CÙNG ÔN THÊM MỘT CHÚT'}</p><div class="result-score">${result.correct}<small> / ${result.total}</small></div><p>${result.criticalMissed.length ? `${result.criticalMissed.length} câu điểm liệt chưa đúng hoặc còn bỏ trống.` : result.passed ? 'Bạn đã đạt ngưỡng điểm và trả lời đúng các câu điểm liệt của bài.' : `Cần ít nhất ${l.pass} câu đúng theo cấu hình ứng dụng nguồn.`}</p><div class="result-buttons">${button('Luyện bài khác ' + icon('arrow-right', 15), 'new-exam')}${button('Ôn các câu cần nhớ', 'open-wrong', 'secondary')}</div></div><div class="result-summary"><span>${result.correct} câu đúng</span><span>${result.total - result.correct - result.skipped} câu trả lời sai</span><span>${result.skipped} câu bỏ trống</span><span>Hoàn thành: ${dateLabel(record.finishedAt)}</span></div></section><div class="section-heading"><h2>Xem lại từng câu</h2><label><span class="field-label">Hiển thị</span><select id="review-filter" class="review-select"><option value="all" ${state.reviewFilter === 'all' ? 'selected' : ''}>Tất cả (${questions.length})</option><option value="wrong" ${state.reviewFilter === 'wrong' ? 'selected' : ''}>Cần ôn (${questions.length - result.correct})</option></select></label></div><div class="review-list">${visible.map(q => {
    const correct = Number(record.answers[q.id]) === q.answer;
    return `<details class="review-item"><summary><span class="review-badge ${correct ? '' : 'wrong'}">${icon(correct ? 'check' : 'refresh-cw', 12)}${correct ? 'Đúng' : 'Cần ôn'}</span>Câu ${q.id}: ${e(q.text)}</summary>${q.image ? `<img class="question-image" src="${e(q.image)}" alt="Hình minh họa câu ${q.id}" loading="lazy" style="margin-top:20px">` : ''}<p class="subtitle">Bạn chọn: ${record.answers[q.id] || 'Chưa chọn'} · Đáp án đúng: ${q.answer}${isCritical(q, l) ? ' · Câu điểm liệt' : ''}</p><div class="review-answers">${q.options.map(o => `<p class="${o.id === q.answer ? 'correct' : o.id === Number(record.answers[q.id]) ? 'wrong' : ''}">${o.id}. ${e(o.text)}</p>`).join('')}</div><section class="explanation"><h3>${icon('lightbulb', 16)} Giải thích theo nguồn</h3><p>${e(q.explanation)}</p></section></details>`;
  }).join('') || '<div class="panel"><p>Không còn câu nào cần ôn trong bài này. Bạn đã trả lời đúng tất cả!</p></div>'}</div>`;
}
function renderHistory() {
  $('#main').innerHTML = `${heading('Thấy rõ từng bước tiến.', 'Lưu lại bài đã làm, xem lại đáp án và tiếp tục từ những câu còn chưa chắc.')}${progress.history.length ? `<div class="history-table"><div class="history-row header"><span>Bài luyện</span><span>Hoàn thành</span><span>Kết quả</span><span>Trạng thái</span><span></span></div>${progress.history.map(h => { const result = grade(h.ids.map(id => questionMap.get(id)), h.answers, getLicense(data, h.license)); return `<div class="history-row"><div><strong>${e(h.title)}</strong><small>Hạng ${e(h.license)} · ${h.kind === 'fixed' ? 'Bộ bài ôn nguồn' : 'Ngẫu nhiên'}</small></div><span class="history-date">${dateLabel(h.finishedAt)}</span><strong class="history-score">${result.correct}/${result.total}</strong><span class="history-state status-pill ${result.passed ? '' : 'failed'}">${result.passed ? 'Đạt bài luyện' : 'Cần luyện thêm'}</span><div class="history-open">${button('Xem lại ' + icon('arrow-up-right', 14), 'view-history', 'secondary', `data-id="${e(h.id)}"`)}</div></div>`; }).join('')}</div><p class="source-note">Giữ tối đa 30 bài gần nhất trên trình duyệt này. Xuất tiến độ trong Cài đặt để sao lưu cả nội dung bài đã làm.</p>` : emptyState('Bắt đầu lần thử sức đầu tiên.', 'Bài đã nộp sẽ được lưu tại đây cùng câu hỏi, lựa chọn và phần giải thích.', 'history')}`;
}
const hintTitles = { 'hanggplx.png': 'Phân hạng GPLX', 'max_speed.png': 'Gợi ý tốc độ', 'oto_otocon.png': 'Nhận diện loại ô tô', 'phanbiet_dungdo.png': 'Phân biệt dừng và đỗ', 'safe_distance.png': 'Khoảng cách an toàn', 'sd_R301h.png': 'Nhận diện biển R.301h', 'tocdo_2019.png': 'Ảnh tham khảo tốc độ 2019', 'xemay_ganmay.png': 'Xe máy và xe gắn máy' };
function renderHandbook() {
  if (state.lesson) {
    const lesson = data.practicalLessons.find(l => l.id === state.lesson);
    if (!lesson) { state.lesson = null; renderHandbook(); return; }
    $('#main').innerHTML = `${heading(e(lesson.name), 'Nội dung sa hình giữ theo ứng dụng nguồn.', button(icon('arrow-left', 15) + ' Cẩm nang', 'back-handbook', 'secondary'))}<div class="reading-layout">${lesson.image ? `<img class="reading-image" src="${e(lesson.image)}" alt="Minh họa ${e(lesson.name)}">` : ''}${lesson.sections.map(s => `<section class="reading-section"><h2>${e(s.title)}</h2><p>${e(s.text)}</p></section>`).join('')}</div>`;
    return;
  }
  const tabs = `<div class="segmented"><button data-action="handbook-tab" data-tab="practical" class="${state.handbookTab === 'practical' ? 'active' : ''}" aria-pressed="${state.handbookTab === 'practical'}">11 bài sa hình</button><button data-action="handbook-tab" data-tab="theory" class="${state.handbookTab === 'theory' ? 'active' : ''}" aria-pressed="${state.handbookTab === 'theory'}">Mẹo & tài liệu tham khảo</button></div>`;
  const content = state.handbookTab === 'practical' ? `<div class="handbook-grid">${data.practicalLessons.map((lesson, index) => `<button class="lesson-card" data-action="lesson" data-id="${lesson.id}">${lesson.image ? `<img src="${e(lesson.image)}" alt="" loading="lazy">` : `<span class="lesson-placeholder">${icon('trophy', 44)}</span>`}<p class="eyebrow">BÀI ${String(index + 1).padStart(2, '0')}</p><h3>${e(lesson.name)}</h3><small>${lesson.sections.length} phần hướng dẫn · Xem nội dung →</small></button>`).join('')}</div>` : `<div class="notice" style="margin-bottom:22px">Phần mẹo và ảnh tham khảo được giữ từ ứng dụng, có thể gồm nội dung của các bộ cũ. Dùng để tham khảo thêm; chưa được đối chiếu với quy định hiện hành.</div>${data.theoryCategories.filter(c => data.theoryTips.some(t => t.category === c.id)).map(c => `<details class="theory-group"><summary>${e(c.name)}</summary><ul>${data.theoryTips.filter(t => t.category === c.id).map(t => `<li>${e(t.text)}</li>`).join('')}</ul></details>`).join('')}<div class="section-heading" style="margin-top:30px"><h2>Ảnh tham khảo từ ứng dụng</h2></div><div class="hint-grid">${data.hintImages.map((h, index) => `<button class="hint-card" data-action="hint-image" data-index="${index}"><img src="${e(h.image)}" alt="${e(hintTitles[h.name] || h.name)}" loading="lazy"><p>${e(hintTitles[h.name] || h.name)}</p></button>`).join('')}</div>`;
  $('#main').innerHTML = `${heading('Thêm hiểu biết cho mỗi hành trình.', 'Đọc lại hướng dẫn sa hình và các ghi chú được đóng gói trong ứng dụng.')}${tabs}${content}`;
}
function render() {
  $('#main').dataset.view = 'default';
  renderShell();
  if (state.route === 'home') renderHome();
  else if (learningRoutes.includes(state.route)) renderStudy();
  else if (state.route === 'signs') renderSigns();
  else if (state.route === 'handbook') renderHandbook();
  else if (state.route === 'history') renderHistory();
  else if (state.route === 'exams') { if (activeExam) renderActiveExam(); else if (state.review) renderResult(state.review); else renderExamSetup(); }
}
function settingsDialog() {
  showDialog(`${dialogHeading('Góc học tập của bạn')}<div class="dialog-copy"><strong>Giữ lại hành trình học</strong><p>Tiến độ, câu đánh dấu và tối đa 30 bài đã làm được lưu trong trình duyệt này. Xuất tệp để sao lưu hoặc chuyển sang thiết bị khác. Nhập tệp sẽ thay thế tiến độ hiện có.</p></div><div class="dialog-actions">${button(icon('download', 16) + ' Xuất tiến độ', 'export-progress', 'secondary')}${button(icon('upload', 16) + ' Nhập tiến độ', 'import-progress', 'secondary')}<input type="file" id="progress-file" accept="application/json,.json" hidden></div><hr class="dialog-divider"><div class="dialog-copy"><strong>Cài ứng dụng và học ngoại tuyến</strong><p>Bấm icon tải xuống trên header, xác nhận dung lượng rồi tiếp tục học trong lúc app tải. Icon chuyển sang dấu tích khi đã lưu đủ. Bấm “Cài app” trên header khi Chrome/Edge cho phép cài; Safari iPhone dùng Chia sẻ → Thêm vào Màn hình chính. Tiến độ và dữ liệu tải về lưu riêng theo địa chỉ trang web.</p><p>Nếu hosting yêu cầu đăng nhập lại, có thể cần kết nối để xác thực. Bộ nhớ trình duyệt có thể bị hệ điều hành thu hồi; nên xuất tiến độ định kỳ.</p></div><div class="dialog-actions">${button('Học ngoại tuyến', 'offline-info', 'secondary', offline.status === 'downloading' ? 'disabled' : '')}${installer.canInstall() ? button('Cài ứng dụng', 'install-app') : ''}${button('Xóa ảnh ngoại tuyến', 'clear-offline-confirm', 'secondary', offline.status === 'downloading' ? 'disabled' : '')}</div><hr class="dialog-divider"><div class="dialog-copy"><strong>Bắt đầu lại</strong><p>Xuất tiến độ trước nếu bạn cần giữ lại kết quả.</p></div><div class="dialog-actions">${button('Xóa tiến độ trên trình duyệt', 'reset-confirm', 'danger')}</div>`);
}
function recordAnswer(question, selected) {
  progress.answers[question.id] = { selected, correct: selected === question.answer, at: Date.now(), attempts: (progress.answers[question.id]?.attempts || 0) + 1 };
  if (selected > 0) progress.lastQuestion = question.id;
}
function beginExam(kind, fixedId) {
  if (activeExam) { go('exams'); return; }
  const l = currentLicense();
  const template = kind === 'fixed' ? data.fixedExams.find(t => t.id === fixedId && t.license === l.name) : null;
  if (kind === 'fixed' && !template) { toast('Không tìm thấy bài ôn này.'); return; }
  const ids = template ? [...template.questionIds] : randomExam(data, l.name).map(q => q.id);
  const now = Date.now();
  activeExam = { id: crypto.randomUUID(), kind, license: l.name, title: template ? `Bài ôn ${template.number}` : 'Luyện ngẫu nhiên', ids, answers: {}, index: 0, startedAt: now, deadline: now + l.minutes * 60000 };
  persistExam(); go('exams');
}
function finishExam(expired = false) {
  if (!activeExam) return;
  closeDialog();
  const record = { id: activeExam.id, kind: activeExam.kind, license: activeExam.license, title: activeExam.title, ids: [...activeExam.ids], answers: { ...activeExam.answers }, startedAt: activeExam.startedAt, finishedAt: Date.now() };
  for (const q of activeQuestions()) recordAnswer(q, Number(activeExam.answers[q.id]) || 0);
  progress.history = [record, ...progress.history.filter(h => h.id !== record.id)].slice(0, 30);
  activeExam = null; persistExam(); persist(); go('exams', { result: record.id });
  if (expired) toast('Đã hết giờ. Bài luyện của bạn đã được nộp.');
}
function updateClock() {
  if (!activeExam) return;
  const remaining = Math.max(0, Math.ceil((activeExam.deadline - Date.now()) / 1000));
  const clock = $('#exam-clock');
  if (clock) { clock.querySelector('span').textContent = durationLabel(remaining); clock.classList.toggle('urgent', remaining <= 60); }
  if (remaining === 0) finishExam(true);
}
async function downloadOffline() {
  if (!offlineDownload) return;
  closeDialog();
  navigator.storage?.persist?.().catch(() => {});
  await offlineDownload.start(true);
}
async function clearOffline() {
  if (offline.status === 'downloading') return;
  for (const name of await caches.keys()) if (name.startsWith('gplx2026-data-')) await caches.delete(name);
  offlineDownload?.clear(); closeDialog(); render(); toast('Đã xóa ảnh ngoại tuyến. Tiến độ của bạn được giữ lại.');
}
function installApp() { closeDialog(); return installer.install(); }
function exportProgress() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'gplx2026-tien-do.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function jumpQuestion(index, exam = false) {
  if (exam) { if (!activeExam || index < 0 || index >= activeExam.ids.length) return; activeExam.index = index; persistExam(); renderActiveExam(); }
  else { if (index < 0 || index >= state.list.length) return; state.index = index; renderStudy(); }
  const card = $('.question-card');
  if (card) {
    card.focus({ preventScroll: true });
    const offset = chrome.hidden ? 10 : $('.topbar').offsetHeight + 10;
    window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - offset), behavior: 'instant' });
    chrome.sync();
  }
}
function action(name, element) {
  const id = Number(element.dataset.id), index = Number(element.dataset.index), q = state.list[state.index];
  switch (name) {
    case 'menu': if (!$('#menu-dialog').open) $('#menu-dialog').showModal(); break;
    case 'close-menu': $('#menu-dialog').close(); break;
    case 'close-dialog': closeDialog(); break;
    case 'settings': settingsDialog(); break;
    case 'install-app': installApp(); break;
    case 'open-learn': go('learn'); break;
    case 'open-wrong': go('wrong'); break;
    case 'resume-exam': go('exams'); break;
    case 'topic': go('learn', { topic: id }); break;
    case 'continue-study': { const pool = currentPool(), last = pool.find(q => q.id === progress.lastQuestion), next = (last && !progress.answers[last.id]?.selected ? last : null) || pool.find(q => q.id > progress.lastQuestion && !progress.answers[q.id]?.selected) || pool.find(q => !progress.answers[q.id]?.selected) || last || pool[0]; state.status = 'all'; go('learn', { question: next.id }); break; }
    case 'study-answer': if (q && !state.responses[q.id]) { const selected = Number(element.dataset.option); state.responses[q.id] = selected; recordAnswer(q, selected); persist(); renderStudy(); renderShell(); document.querySelector('.question-controls .button-primary')?.focus({ preventScroll: true }); } break;
    case 'study-jump': jumpQuestion(index); break;
    case 'retry-question': if (q) { delete state.responses[q.id]; renderStudy(); } break;
    case 'bookmark': { const at = progress.bookmarks.indexOf(id); if (at >= 0) progress.bookmarks.splice(at, 1); else progress.bookmarks.push(id); persist(); render(); toast(at >= 0 ? 'Đã bỏ đánh dấu.' : 'Đã thêm vào góc ghi nhớ.'); break; }
    case 'sign-detail': { const s = data.signs.find(s => s.id === id); if (!s) return; showDialog(`${dialogHeading(e(s.shortName))}<img class="sign-dialog-image" src="${e(s.image)}" alt="${e(s.name)}"><div class="dialog-copy multiline"><strong>${e(s.code)}</strong><p>${e(s.detail)}</p></div>`); break; }
    case 'more-signs': state.signLimit += 32; renderSigns(); break;
    case 'exam-tab': state.examTab = element.dataset.tab === 'fixed' ? 'fixed' : 'random'; renderExamSetup(); break;
    case 'start-random': beginExam('random'); break;
    case 'start-fixed': beginExam('fixed', id); break;
    case 'new-exam': go('exams'); break;
    case 'exam-jump': jumpQuestion(index, true); break;
    case 'exam-answer': if (activeExam) { const q = activeQuestions()[activeExam.index]; activeExam.answers[q.id] = Number(element.dataset.option); persistExam(); renderActiveExam(); } break;
    case 'submit-exam': { if (!activeExam) return; const remaining = activeExam.ids.length - Object.keys(activeExam.answers).length; showDialog(`${dialogHeading('Sẵn sàng nộp bài?')}<p class="dialog-copy">${remaining ? `Bạn còn ${remaining} câu chưa chọn đáp án. ` : 'Bạn đã chọn đáp án cho tất cả câu hỏi. '}Nộp bài để xem kết quả và giải thích từng câu.</p><div class="dialog-actions">${button('Tiếp tục làm bài', 'close-dialog', 'secondary')}${button('Nộp và xem kết quả', 'finish-exam')}</div>`); break; }
    case 'finish-exam': finishExam(); break;
    case 'view-history': go('exams', { result: element.dataset.id }); break;
    case 'handbook-tab': go('handbook', { tab: element.dataset.tab }); break;
    case 'lesson': go('handbook', { lesson: id }); break;
    case 'back-handbook': go('handbook'); break;
    case 'hint-image': { const hint = data.hintImages[index]; if (hint) showDialog(`${dialogHeading(e(hintTitles[hint.name] || hint.name))}<img class="dialog-image" src="${e(hint.image)}" alt="${e(hintTitles[hint.name] || hint.name)}"><p class="dialog-copy">Ảnh tham khảo từ ứng dụng nguồn, có thể gồm thông tin của bộ cũ.</p>`); break; }
    case 'offline-info': offlineDialog(); break;
    case 'download-offline': downloadOffline(); break;
    case 'clear-offline-confirm': showDialog(`${dialogHeading('Xóa ảnh đã tải ngoại tuyến?')}<p class="dialog-copy">Các ảnh tải về sẽ được xóa khỏi bộ nhớ trình duyệt. Tiến độ và lịch sử luyện đề vẫn được giữ. Bạn có thể tải ảnh lại khi có mạng.</p><div class="dialog-actions">${button('Giữ ảnh đã tải', 'close-dialog', 'secondary')}${button('Xóa ảnh ngoại tuyến', 'clear-offline', 'danger')}</div>`); break;
    case 'clear-offline': clearOffline().catch(() => toast('Chưa xóa được dữ liệu ngoại tuyến.')); break;
    case 'export-progress': exportProgress(); break;
    case 'import-progress': $('#progress-file').click(); break;
    case 'reset-confirm': showDialog(`${dialogHeading('Bắt đầu lại hành trình học?')}<p class="dialog-copy">Thao tác này xóa tiến độ, câu đánh dấu, bài đang làm và lịch sử trên trình duyệt này. Nên xuất tệp sao lưu trước nếu bạn cần giữ kết quả.</p><div class="dialog-actions">${button('Giữ tiến độ', 'close-dialog', 'secondary')}${button('Xóa toàn bộ tiến độ', 'reset-progress', 'danger')}</div>`); break;
    case 'reset-progress': progress = createProgress(); activeExam = null; persist(); persistExam(); closeDialog(); go('home'); toast('Đã xóa tiến độ trên trình duyệt này.'); break;
    case 'reload': location.reload(); break;
  }
}

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main').focus(); return; }
  const route = event.target.closest('[data-go]');
  if (route) { event.preventDefault(); closeDialog(); go(route.dataset.go, { scope: route.dataset.scope }); return; }
  const target = event.target.closest('[data-action]');
  if (target && !target.disabled) action(target.dataset.action, target);
  if (event.target === $('#dialog')) closeDialog();
  if (event.target === $('#menu-dialog')) $('#menu-dialog').close();
});
document.addEventListener('input', event => {
  if (event.target.id !== 'content-search') return;
  const cursor = event.target.selectionStart; state.query = event.target.value; state.index = 0; state.signLimit = 32; rebuildStudy(); updateRouteFilters();
  if (state.route === 'signs') renderSigns(); else renderStudy();
  const input = $('#content-search'); input.focus({ preventScroll: true }); try { input.setSelectionRange(cursor, cursor); } catch {}
});
document.addEventListener('toggle', event => { if (event.target.id === 'study-filters' && event.target.isConnected) state.filtersOpen = event.target.open; }, true);
document.addEventListener('change', async event => {
  const target = event.target;
  if (target.id === 'license-select') { progress.license = target.value; persist(); state.index = 0; state.responses = {}; rebuildStudy(); render(); }
  if (target.id === 'topic-filter' || target.id === 'scope-filter' || target.id === 'learn-status') {
    if (target.id === 'topic-filter') state.topic = target.value;
    if (target.id === 'scope-filter') state.scope = target.value;
    if (target.id === 'learn-status') state.status = target.value;
    state.index = 0; rebuildStudy(); updateRouteFilters(); renderStudy();
  }
  if (target.id === 'sign-category') { state.signCategory = target.value; state.signLimit = 32; updateRouteFilters(); renderSigns(); }
  if (target.id === 'review-filter') { state.reviewFilter = target.value; if (state.review) renderResult(state.review); }
  if (target.id === 'progress-file' && target.files[0]) {
    try {
      if (activeExam) throw new Error('Hãy hoàn thành bài đang làm trước khi nhập tiến độ.');
      if (target.files[0].size > 3 * 1024 * 1024) throw new Error('Tệp quá lớn. Hãy chọn tệp tiến độ do ứng dụng xuất.');
      const incoming = parseProgress(await target.files[0].text(), data);
      progress = incoming; persist(); closeDialog(); go('home'); toast('Đã nhập tiến độ và lịch sử bài luyện.');
    } catch (error) { toast(error.message); }
  }
});
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || $('#dialog').open || $('#menu-dialog').open || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
  const examMode = state.route === 'exams' && activeExam;
  if (!examMode && !learningRoutes.includes(state.route)) return;
  if (/^[1-4]$/.test(event.key)) { const option = document.querySelector(`[data-action="${examMode ? 'exam-answer' : 'study-answer'}"][data-option="${event.key}"]`); if (option && !option.disabled) { event.preventDefault(); option.click(); } }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); jumpQuestion((examMode ? activeExam.index : state.index) + (event.key === 'ArrowLeft' ? -1 : 1), Boolean(examMode)); }
});
function connectionChanged() { $('#connection-text').textContent = navigator.onLine ? 'Đang trực tuyến' : 'Đang ngoại tuyến'; document.querySelector('.online-dot').style.background = navigator.onLine ? '#36a76b' : '#d69225'; }
addEventListener('online', connectionChanged); addEventListener('offline', connectionChanged);
addEventListener('hashchange', () => { if (data) applyRoute(); });

async function setupWorker() {
  let storage; try { storage = localStorage; } catch {}
  offlineDownload = createOfflineDownload({
    revision: offlineManifest.revision, total: offlineManifest.urls.length, storage,
    getWorker: async () => {
      if (!registration) throw new Error('Ngoại tuyến chưa sẵn sàng. Hãy thử lại sau một chút.');
      return activeWorker(registration);
    },
    hasReady: async () => {
      const cache = await caches.open('gplx2026-data-' + offlineManifest.revision);
      const marker = await cache.match(new URL('offline-ready', registration.scope));
      return Boolean(marker && await marker.text() === offlineManifest.revision);
    },
    onChange: value => { offline = value; updateOfflineUI(); },
    onComplete: () => toast('Đã tải đủ nội dung để học ngoại tuyến.'),
    onError: message => toast(message),
  });
  updateOfflineUI();
  if (!('serviceWorker' in navigator)) { $('#offline-button').disabled = true; $('#offline-button').title = 'Trình duyệt chưa hỗ trợ học ngoại tuyến'; return; }
  navigator.serviceWorker.addEventListener('message', event => offlineDownload.message(event.data));
  try {
    registration = await navigator.serviceWorker.register('./sw.js?v=4', { updateViaCache: 'none' });
    await activeWorker(registration);
    await offlineDownload.restore();
    addEventListener('online', () => offlineDownload.start());
  } catch { offline = { ...offline, status: 'error' }; updateOfflineUI(); }
}
async function init() {
  try {
    const responses = await Promise.all([fetch('./data/dataset.json?v=4'), fetch('./data/offline.json?v=4')]);
    if (responses.some(r => !r.ok || r.redirected)) throw new Error('Chưa tải được bộ dữ liệu.');
    [data, offlineManifest] = await Promise.all(responses.map(r => r.json()));
    questionMap = new Map(data.questions.map(q => [q.id, q])); progress = readProgress(data); activeExam = readExam(data);
    if (activeExam) progress.license = activeExam.license;
    if (!location.hash) history.replaceState(null, '', activeExam ? '#exams' : '#home');
    applyRoute(); connectionChanged(); setInterval(updateClock, 1000); updateClock(); setupWorker();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });
  } catch (error) { $('#main').innerHTML = `<section class="empty-state"><h1>Chưa mở được góc học tập</h1><p>${e(error.message)} Kiểm tra kết nối rồi tải lại trang.</p>${button('Thử lại', 'reload')}</section>`; }
}
init();
