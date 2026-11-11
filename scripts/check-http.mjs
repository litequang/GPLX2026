import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = process.env.PREVIEW_URL || 'http://localhost:4174/';
const root = fileURLToPath(new URL('../dist', import.meta.url));
const paths = ['', 'app.js?v=3', 'styles.css?v=3', 'themes.css?v=3', 'theme-init.js?v=3'];
function scan(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) scan(path); else paths.push(relative(root, path).replaceAll('\\', '/')); } }
scan(root);
let bytes = 0;
for (let index = 0; index < paths.length; index += 12) await Promise.all(paths.slice(index, index + 12).map(async path => {
  const response = await fetch(new URL(path, base));
  if (response.status !== 200 || response.redirected) throw new Error(`${path}: HTTP ${response.status}`);
  const body = await response.arrayBuffer(), mime = response.headers.get('content-type') || '';
  const pathname = path.split('?', 1)[0];
  if (!body.byteLength) throw new Error(`Empty response: ${path}`);
  if (/\.(png|jpe?g|webp|svg)$/.test(pathname) && !mime.startsWith('image/')) throw new Error(`Invalid image MIME: ${path}`);
  if (/\.js$/.test(pathname) && !mime.includes('javascript')) throw new Error(`Invalid module MIME: ${path}`);
  if (/\.css$/.test(pathname) && !mime.includes('text/css')) throw new Error(`Invalid stylesheet MIME: ${path}`);
  if (/\.woff2$/.test(pathname) && !mime.includes('font/woff2')) throw new Error(`Invalid font MIME: ${path}`);
  bytes += body.byteLength;
}));
console.log(JSON.stringify({ httpResources: paths.length, allStatus200: true, bytes, mebibytes: (bytes / 1024 / 1024).toFixed(1) }, null, 2));
