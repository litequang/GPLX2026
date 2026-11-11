// Runs before stylesheets to restore the chosen theme without a light flash.
(() => {
  const key = 'gplx2026-theme-v1';
  const colors = { light: '#f5f7fc', dark: '#0b1220' };
  const root = document.documentElement;
  const system = window.matchMedia?.('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark';
  let preference = null, current, button;
  let manifestWorker, manifestTheme, manifestSequence = 0;
  const workers = window.navigator?.serviceWorker;
  try { const value = window.localStorage.getItem(key); if (valid(value)) preference = value; } catch {}
  const systemTheme = () => system?.matches ? 'dark' : 'light';
  function syncManifest() {
    const worker = workers?.controller;
    if (!worker || !window.MessageChannel || (worker === manifestWorker && current === manifestTheme)) return;
    const theme = current, sequence = ++manifestSequence, channel = new window.MessageChannel();
    const close = () => { clearTimeout(timer); channel.port1.close(); channel.port2.close(); };
    const timer = setTimeout(close, 4000);
    channel.port1.onmessage = event => {
      close();
      if (event.data?.type !== 'theme-saved' || event.data.theme !== theme || current !== theme || sequence !== manifestSequence) return;
      // Keep the manifest URL/id stable; re-discover it after the worker saves the colors.
      const link = document.querySelector('link[rel="manifest"]');
      if (link) { manifestWorker = worker; manifestTheme = theme; link.replaceWith(link.cloneNode()); }
    };
    try { worker.postMessage({ type: 'set-theme', theme }, [channel.port2]); } catch { close(); }
  }
  function updateButton() {
    if (!button) return;
    const label = current === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(current === 'dark'));
  }
  function apply(theme) {
    current = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.style.backgroundColor = colors[theme];
    if (document.body) document.body.style.backgroundColor = colors[theme];
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');
    updateButton();
    syncManifest();
  }
  apply(preference || systemTheme());
  function bind() {
    apply(current);
    button = document.querySelector('#theme-toggle');
    if (!button) return;
    updateButton();
    button.addEventListener('click', () => {
      preference = current === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { window.localStorage.setItem(key, preference); } catch {}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  system?.addEventListener?.('change', () => { if (!preference) apply(systemTheme()); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.key === key && valid(event.newValue) ? event.newValue : null;
    apply(preference || systemTheme());
  });
  // Android can restore the native chrome after returning from another app/BFCache.
  window.addEventListener('pageshow', () => apply(current));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(current); });
  workers?.addEventListener('controllerchange', () => { manifestWorker = null; syncManifest(); });
})();
