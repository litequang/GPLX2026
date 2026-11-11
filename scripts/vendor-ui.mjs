import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';
const download = (url, agent) => execFileSync(curl, ['-fsSL', '--connect-timeout', '10', '--max-time', '40', ...(agent ? ['-A', agent] : []), url]);
const cssUrl = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap';
let css = download(cssUrl, 'Mozilla/5.0 AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36').toString();
const fontDirectory = join(root, 'dist/fonts'); mkdirSync(fontDirectory, { recursive: true });
const urls = ['fonts/fonts.css', 'fonts/OFL.txt'];
const fontMap = new Map();
for (const url of [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))]) {
  const filename = `be-vietnam-pro-${fontMap.size + 1}.woff2`;
  writeFileSync(join(fontDirectory, filename), download(url));
  fontMap.set(url, filename); urls.push(`fonts/${filename}`);
}
for (const [url, filename] of fontMap) css = css.replaceAll(url, `./${filename}`);
writeFileSync(join(fontDirectory, 'fonts.css'), css);
writeFileSync(join(fontDirectory, 'OFL.txt'), download('https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/OFL.txt'));
writeFileSync(join(fontDirectory, 'manifest.json'), JSON.stringify({ urls }));
const revision = '03eae6069edfc373673bd05d723491f05ba936e3';
const names = ['layout-dashboard', 'book-open', 'clipboard-check', 'triangle-alert', 'traffic-cone', 'bookmark', 'history', 'lightbulb', 'car', 'arrow-up-right', 'arrow-right', 'arrow-left', 'chevron-left', 'chevron-right', 'check', 'x', 'search', 'download', 'upload', 'settings', 'wifi', 'wifi-off', 'menu', 'target', 'circle-help', 'shield-check', 'trophy', 'clock', 'circle-check', 'circle-x', 'refresh-cw', 'file-text', 'route', 'chevron-down', 'list-checks'];
const icons = {};
const aliases = { 'triangle-alert': 'triangle-exclamation-point', 'circle-help': 'circle-question-mark', history: 'clock-arrow-left' };
for (const name of names) {
  const svg = download(`https://raw.githubusercontent.com/lucide-icons/lucide/${revision}/icons/${aliases[name] || name}.svg`).toString();
  const body = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  if (!body || /<script|foreignObject|\bon\w+=|href=/i.test(body)) throw new Error(`Unexpected SVG: ${name}`);
  icons[name] = body.trim();
}
mkdirSync(join(root, 'dist/modules'), { recursive: true });
writeFileSync(join(root, 'dist/modules/icons.js'), `// Lucide icons, pinned ${revision}. See THIRD_PARTY.md.\nconst paths = ${JSON.stringify(icons, null, 2)};\nexport function icon(name, size = 20) { return \`<svg class="icon" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\${paths[name] || paths['circle-help']}</svg>\`; }\n`);
mkdirSync(join(root, 'licenses'), { recursive: true });
writeFileSync(join(root, 'licenses/lucide-LICENSE.txt'), download(`https://raw.githubusercontent.com/lucide-icons/lucide/${revision}/LICENSE`));
console.log(JSON.stringify({ fontFiles: fontMap.size, icons: names.length, lucideCommit: revision }));
