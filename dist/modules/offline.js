const KEY = 'gplx2026-offline-v1';
// One explicit consent enables downloads/resume for this browser, including data updates.
// Service workers may be suspended by Android; completed cache entries survive a retry.
export function createOfflineDownload({ revision, total, storage, getWorker, hasReady, onChange = () => {}, onComplete = () => {}, onError = () => {} }) {
  let enabled = false;
  try { enabled = storage?.getItem(KEY) === 'enabled'; } catch {}
  let state = { status: 'idle', completed: 0, total, error: '' };
  const emit = update => { state = { ...state, ...update }; onChange({ ...state }); };
  const remember = value => { enabled = value; try { value ? storage?.setItem(KEY, 'enabled') : storage?.removeItem(KEY); } catch {} };
  async function start(confirmed = false) {
    if (confirmed) remember(true);
    if (!enabled || ['downloading', 'ready'].includes(state.status)) return;
    emit({ status: 'downloading', error: '' });
    try { const worker = await getWorker(); worker.postMessage({ type: 'download-offline', revision }); }
    catch (error) { emit({ status: 'error', error: error.message }); onError(error.message); }
  }
  return {
    get state() { return { ...state }; },
    start,
    async restore() {
      try { if (await hasReady()) { emit({ status: 'ready', completed: total }); return; } }
      catch {}
      await start();
    },
    message(message) {
      if (message?.revision !== revision) return;
      if (message.type === 'offline-progress') emit({ status: 'downloading', error: '', completed: Math.max(0, Math.min(total, Number(message.completed) || 0)) });
      if (message.type === 'offline-done') { emit({ status: 'ready', completed: total }); onComplete(); }
      if (message.type === 'offline-error') { const error = message.message || 'Tải chưa hoàn tất. Hãy thử lại khi có mạng.'; emit({ status: 'error', error }); onError(error); }
    },
    clear() { if (state.status === 'downloading') return false; remember(false); emit({ status: 'idle', completed: 0 }); return true; },
  };
}

export async function activeWorker(registration) {
  const pending = registration.installing || registration.waiting;
  if (pending && pending.state !== 'activated') await new Promise((resolve, reject) => {
    const finish = error => { clearTimeout(timer); pending.removeEventListener('statechange', changed); error ? reject(error) : resolve(); };
    const changed = () => { if (pending.state === 'activated') finish(); else if (pending.state === 'redundant') finish(new Error('Không lưu được bộ ứng dụng ngoại tuyến. Kiểm tra kết nối rồi thử tải lại.')); };
    const timer = setTimeout(() => finish(new Error('Đang chuẩn bị ứng dụng. Bạn thử lại sau một chút nhé.')), 45000);
    pending.addEventListener('statechange', changed); changed();
  });
  if (!registration.active) throw new Error('Trình phục vụ ngoại tuyến chưa hoạt động. Hãy thử tải lại khi có mạng.');
  return registration.active;
}

// Share an in-flight install, but retry registration after failures instead of reusing
// an empty registration left by a failed precache.
export function createWorkerConnection(serviceWorker, script) {
  let task;
  return () => {
    if (!task) task = (async () => {
      const registration = await serviceWorker.register(script, { updateViaCache: 'none' });
      const worker = await activeWorker(registration);
      return { registration, worker };
    })().finally(() => { task = null; });
    return task;
  };
}
