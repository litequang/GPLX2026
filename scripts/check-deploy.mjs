import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
const root = fileURLToPath(new URL('../dist', import.meta.url));
let files = 0, bytes = 0, largest = 0;
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name), name = relative(root, path);
    if (entry.isSymbolicLink()) throw new Error(`Symlink: ${name}`);
    if (entry.isDirectory()) { inspect(path); continue; }
    if (/\.(zip|apk|db|sqlite|tar|gz|so|imeg)$/i.test(entry.name) || /^\.env|token|credential/i.test(entry.name)) throw new Error(`Forbidden deploy file: ${name}`);
    const size = statSync(path).size;
    if (size > 25 * 1024 * 1024) throw new Error(`File exceeds 25 MiB: ${name}`);
    files++; bytes += size; largest = Math.max(largest, size);
  }
}
inspect(root);
console.log(JSON.stringify({ files, bytes, largestFileBytes: largest, withinPerFileLimit: true }, null, 2));
