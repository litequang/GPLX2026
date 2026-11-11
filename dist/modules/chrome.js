// Direction changes are driven only by scrolling, never by an idle timer.
export function createScrollTracker({ position = 0, threshold = 8, hideAfter = 64, top = 12 } = {}) {
  let previous = position, travel = 0, direction = 0, hidden = false;
  return {
    get hidden() { return hidden; },
    sync(position) { previous = position; travel = 0; direction = 0; },
    show(position) { hidden = false; this.sync(position); return hidden; },
    update(position) {
      const delta = position - previous; previous = position;
      if (position <= top) { hidden = false; travel = 0; direction = 0; return hidden; }
      if (delta === 0) return hidden;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) { direction = nextDirection; travel = 0; }
      travel += Math.abs(delta);
      if (travel >= threshold) {
        if (direction < 0) hidden = false;
        else if (position > hideAfter) hidden = true;
      }
      return hidden;
    },
  };
}

export function setupAutoHideBars({ win = window, doc = document } = {}) {
  const header = doc.querySelector('.topbar'), bottom = doc.querySelector('.bottom-nav');
  const bars = [header, bottom].filter(Boolean);
  const position = () => Math.max(0, Math.min(win.scrollY, Math.max(0, doc.documentElement.scrollHeight - win.innerHeight)));
  const tracker = createScrollTracker({ position: position() });
  let pending = false;
  function apply() {
    doc.body.classList.toggle('bars-hidden', tracker.hidden);
    for (const bar of bars) { bar.inert = tracker.hidden; if (tracker.hidden) bar.setAttribute('aria-hidden', 'true'); else bar.removeAttribute('aria-hidden'); }
  }
  function show() { tracker.show(position()); apply(); }
  function measure() {
    doc.documentElement.style.setProperty('--topbar-height', `${header?.offsetHeight || 64}px`);
    tracker.sync(position());
  }
  win.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    win.requestAnimationFrame(() => {
      pending = false;
      if (bars.some(bar => bar.contains(doc.activeElement)) && doc.activeElement?.matches('input,select,textarea')) return show();
      tracker.update(position()); apply();
    });
  }, { passive: true });
  win.addEventListener('resize', measure, { passive: true });
  doc.addEventListener('keydown', event => { if (event.key === 'Tab') show(); });
  for (const bar of bars) bar.addEventListener('focusin', show);
  if (win.ResizeObserver && header) new win.ResizeObserver(measure).observe(header);
  measure();
  return { show, sync() { tracker.sync(position()); }, get hidden() { return tracker.hidden; } };
}
