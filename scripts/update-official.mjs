import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { applyOfficialCorrections } from './official-overlay.mjs';

const root = new URL('../dist/', import.meta.url);
const dataset = applyOfficialCorrections(JSON.parse(readFileSync(new URL('data/dataset.json', root))));
const json = JSON.stringify(dataset);
const manifest = JSON.parse(readFileSync(new URL('data/offline.json', root)));
writeFileSync(new URL('data/dataset.json', root), json);
manifest.revision = createHash('sha256').update(json).digest('hex').slice(0, 16);
manifest.bytes = manifest.urls.reduce((sum, path) => sum + statSync(new URL(path, root)).size, 0);
writeFileSync(new URL('data/offline.json', root), JSON.stringify(manifest));
console.log(JSON.stringify({ revision: manifest.revision, bytes: manifest.bytes, correctedQuestions: dataset.officialAudit.correctedQuestionIds }));
