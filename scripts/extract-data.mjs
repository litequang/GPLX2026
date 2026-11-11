import { applyOfficialCorrections } from './official-overlay.mjs';
import { DatabaseSync } from 'node:sqlite';
import { createHash, createDecipheriv } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] || join(project, '../extracted-2025'));
const assets = join(source, 'assets/flutter_assets/assets');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const native = readFileSync(join(source, 'lib/arm64-v8a/libapp.so'));
// Pin to the inspected app build. These are app-bundled data cipher parameters, never an account token.
const keyOffset = 419723;
const key = native.subarray(keyOffset, keyOffset + 16);
const expectedKeyHash = 'a451bb7c8a24ca798c1c4496005d32253ad2cdf4ece274bf64dd5132870ae179';
if (sha(key) !== expectedKeyHash) throw new Error('Unrecognized libapp.so; inspect this app version before decoding.');
const ciphertext = readFileSync(join(assets, 'texture25.imeg'));
const blockCipher = createDecipheriv('aes-128-ecb', key, null); blockCipher.setAutoPadding(false);
const firstPlainXorIv = blockCipher.update(ciphertext.subarray(0, 16));
const header = Buffer.from('SQLite format 3\0');
const iv = Buffer.from(firstPlainXorIv.map((byte, index) => byte ^ header[index]));
const decrypt = bytes => {
  const decipher = createDecipheriv('aes-128-cbc', key, iv);
  return Buffer.concat([decipher.update(bytes), decipher.final()]);
};
const plaintext = decrypt(ciphertext);
if (!plaintext.subarray(0, 16).equals(header) || plaintext.length % 4096) throw new Error('Decoded database is not the expected SQLite file.');
mkdirSync(join(source, 'decoded'), { recursive: true });
const dbPath = join(source, 'decoded/texture25.db');
writeFileSync(dbPath, plaintext);
const db = new DatabaseSync(dbPath, { readOnly: true });
if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('SQLite integrity check failed.');
const rows = name => db.prepare(`SELECT * FROM ${name}`).all();
const utf8 = new TextDecoder('utf-8', { fatal: true });
const clean = value => String(value ?? '').normalize('NFC').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/(?:h|p|div)>/gi, '\n').replace(/<\/?[a-z][^>]*>/gi, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
const decryptExplanation = value => value ? clean(utf8.decode(decrypt(Buffer.from(value, 'base64')))) : '';
const assetPaths = new Set(), copiedHashes = new Map();
let imageBytes = 0;
function image(folder, name) {
  if (!name) return null;
  if (basename(name) !== name || !/\.(png|jpe?g|webp)$/i.test(name)) throw new Error(`Unsafe image name: ${name}`);
  const input = join(assets, folder, name);
  if (!existsSync(input)) throw new Error(`Missing image: ${folder}/${name}`);
  const bytes = readFileSync(input), hash = sha(bytes);
  if (copiedHashes.has(hash)) return copiedHashes.get(hash);
  const path = `assets/${folder}/${name}`;
  mkdirSync(dirname(join(project, 'dist', path)), { recursive: true });
  copyFileSync(input, join(project, 'dist', path));
  copiedHashes.set(hash, path); assetPaths.add(path); imageBytes += bytes.length;
  return path;
}
const questions = rows('ZQUESTION').map(q => ({
  id: q.Z_PK, text: clean(q.ZQUESTIONCONTENT), category: q.ZQUESTIONTYPE,
  options: [1, 2, 3, 4].filter(n => q[`ZOPTION${n}`]?.trim()).map(n => ({ id: n, text: clean(q[`ZOPTION${n}`]) })),
  answer: q.ZCORRECT, explanation: decryptExplanation(q.ZANSWERDESC), memoryTip: clean(q.ZDECO), image: image('quImage600', q.ZIMAGE),
  groups: ['A1', 'A', 'B1', 'B'].filter(group => q[`INGROUP_${group}`] === 1),
  critical: { ALL: q.ZQUESTIONDIE === '1', A1: q.DIGROUPA1 === '1', B1: q.DIGROUPB1 === '1' },
}));
const categories = rows('ZQUESTIONTYPE').filter(c => questions.some(q => q.category === c.Z_PK)).map(c => ({ id: c.Z_PK, name: clean(c.ZTYPE_NAME) }));
const licenses = rows('SLICENCECLASS').map(l => ({ id: l.Z_PK, name: l.ZNAME, count: l.ZNUMBEROFQUESTION, pass: l.ZPASSSCORE, minutes: l.ZEXAMPERIOD, description: clean(l.ZDESC || l.ZCONTENT), pool: ['A1', 'A', 'B1', 'B'].includes(l.ZNAME) ? l.ZNAME : 'ALL', criticalPool: ['A1', 'A'].includes(l.ZNAME) ? 'A1' : l.ZNAME === 'B1' ? 'B1' : 'ALL' }));
const links = rows('NETESTQUEST');
const fixedExams = rows('NETEST').map(t => ({ id: t.IDTEST, number: t.NAME_TEST, license: t.CLASS_LICENSE, questionIds: links.filter(link => link.TESTID === t.IDTEST).sort((a, b) => a.ZTESTQUESTID - b.ZTESTQUESTID).map(link => link.ZQUESTIONID) }));
const signCategories = rows('TABLE_NOTICE_BOARD_TYPE').map(c => ({ id: c.Type_ID, name: clean(c.Type_Name) }));
const signs = rows('TABLE_NOTICE_BOARD').filter(s => s.isDelete === 0).map(s => ({ id: s.ID, category: s.Type_ID, name: clean(s.Name), code: s.ShortName || '', shortName: clean(s.Description || s.Name), detail: clean(s.Detail), sourceUpdated: s.UpdateDay, image: image('signImage', s.Icon) }));
const theoryCategories = rows('ZTIPCATEGORY').filter(c => c.ZTIPTYPE === 18).map(c => ({ id: c.Z_PK, name: clean(c.ZNAME) }));
const theoryTips = rows('ZTIP').filter(t => theoryCategories.some(c => c.id === t.ZTIPCATEGORY)).map(t => ({ id: t.Z_PK, category: t.ZTIPCATEGORY, text: clean(t.ZCONTENT) }));
const practicalLessons = rows('STIPCATEGORY').map(c => ({
  id: c.TYPEID, name: clean(c.TYPEDES), image: c.TYPEIMAGE ? image('image/sh', c.TYPEIMAGE + '.png') : null,
  sections: rows('STIP').filter(t => t.TYPEID === c.TYPEID).sort((a, b) => a.TIPID - b.TIPID).map(t => ({ title: clean(t.TIPTITLE), text: clean(t.TIPCONTENT) })),
}));
const hintImages = ['hanggplx.png', 'max_speed.png', 'oto_otocon.png', 'phanbiet_dungdo.png', 'safe_distance.png', 'sd_R301h.png', 'tocdo_2019.png', 'xemay_ganmay.png'].map(name => ({ name, image: image('hintImage', name) }));
const dataset = {
  schemaVersion: 1,
  source: { app: 'Ôn thi GPLX 2025', package: 'com.daotaogplx.vn_driving_theory', versionName: '2.0.3', versionCode: 10, extractedOn: '2026-11-11', database: 'texture25.imeg', databaseSha256: sha(plaintext), encryptedSha256: sha(ciphertext), nativeSha256: sha(native), note: 'Nội dung giữ theo ứng dụng nguồn; chưa đối chiếu độc lập với bộ đề và quy định sát hạch hiện hành.' },
  categories, licenses, questions, fixedExams, signCategories, signs, theoryCategories, theoryTips, practicalLessons, hintImages,
};
const byId = new Map(questions.map(q => [q.id, q]));
const fixedSummary = fixedExams.map(exam => {
  const l = licenses.find(l => l.name === exam.license);
  return { id: exam.id, license: exam.license, count: exam.questionIds.length, criticalCount: exam.questionIds.filter(id => byId.get(id)?.critical[l.criticalPool]).length, outsidePool: exam.questionIds.filter(id => l.pool !== 'ALL' && !byId.get(id)?.groups.includes(l.pool)).length };
});
const report = { ...dataset.source, decoder: { algorithm: 'AES-128-CBC/PKCS7', keyLiteralOffset: keyOffset, keyLength: 16, keySha256: expectedKeyHash, ivDerivedFrom: 'known SQLite header and first ciphertext block' }, counts: { questions: questions.length, explanations: questions.filter(q => q.explanation).length, critical: questions.filter(q => q.critical.ALL).length, licenses: licenses.length, signs: signs.length, fixedExams: fixedExams.length, theoryTips: theoryTips.length, practicalLessons: practicalLessons.length, practicalSections: practicalLessons.reduce((n, l) => n + l.sections.length, 0), images: assetPaths.size }, pools: Object.fromEntries(licenses.map(l => [l.name, questions.filter(q => l.pool === 'ALL' || q.groups.includes(l.pool)).length])), fixedSummary };
const apkPath = join(project, '../source-apk-2025/base.apk');
if (existsSync(apkPath)) report.baseApkSha256 = sha(readFileSync(apkPath));
writeFileSync(join(project, 'source-report.json'), JSON.stringify(report, null, 2) + '\n');
applyOfficialCorrections(dataset);
const dataDir = join(project, 'dist/data'); mkdirSync(dataDir, { recursive: true });
const json = JSON.stringify(dataset);
writeFileSync(join(dataDir, 'dataset.json'), json);
const revision = sha(json).slice(0, 16);
const offline = { revision, bytes: Buffer.byteLength(json) + imageBytes, urls: ['data/dataset.json', ...assetPaths] };
writeFileSync(join(dataDir, 'offline.json'), JSON.stringify(offline));
db.close();
console.log(JSON.stringify({ ...report.counts, offlineMiB: (offline.bytes / 1024 / 1024).toFixed(1), revision, fixedExamsWithMultipleCritical: fixedSummary.filter(t => t.criticalCount > 1).length }, null, 2));
