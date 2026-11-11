// Chrome owns availability and the confirmation UI. Each deferred event is single-use.
export function setupInstall({ win = window, nav = navigator, button, onInstalled = () => {}, onError = () => {}, onChange = () => {} }) {
  const displays = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].map(mode => win.matchMedia(`(display-mode: ${mode})`));
  const standalone = () => Boolean(nav.standalone || displays.some(media => media.matches));
  let deferred = null, installed = standalone(), busy = false;
  const canInstall = () => Boolean(deferred && !installed && !standalone() && !busy);
  function update() { button.hidden = !canInstall(); onChange(canInstall()); }
  win.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installed = standalone();
    deferred = installed ? null : event;
    update();
  });
  win.addEventListener('appinstalled', () => { installed = true; deferred = null; update(); onInstalled(); });
  for (const media of displays) media.addEventListener?.('change', () => { if (standalone()) { installed = true; deferred = null; } update(); });
  async function install() {
    if (!canInstall()) return null;
    const event = deferred; deferred = null; busy = true; update();
    try {
      // Call before any await to retain the tap's transient user activation.
      const result = await event.prompt();
      const choice = await (event.userChoice ?? result);
      if (choice?.outcome === 'accepted') installed = true;
      return choice;
    } catch (error) { onError(error); return null; }
    finally { busy = false; update(); }
  }
  button.addEventListener('click', install);
  update();
  return { install, canInstall };
}
