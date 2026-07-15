/**
 * Build 10-row misalignment regression fixture from known bad IDs.
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ids = [
  '5a3d1d17-2c22-44d0-8900-6f5611aa7c7b',
  '4eed7ad4-d92d-407b-b489-25ae8e9231c6',
  '6bf5b440-a1e5-49ec-9aa2-d9d316dc8152',
  'ed506c57-5f94-4812-8bab-02c004f5e3a8',
  '6789d77a-fb65-4541-a9d4-50048b1b2f09',
  'b120a3dd-f6be-46b1-9e66-607624d21e73',
  'a60087ed-f3f7-406e-810f-c7a63271fe9c',
  'e68baf72-bb55-414d-b35a-e1d4e6ec58df',
  '1f333ec5-a122-441b-a4aa-e8b2ac4458b4',
  '218c17cf-e311-4cb5-a440-e9695d43cb31'
];

const srcPath =
  'F:/Documents/Repertory/Sieyuan/暂放/翻译工具文档/平台-测试部/mon-1.9.0补充qt通用语言/去重文件（去重后，送翻前）_词条导出_20260714075255.xlsx';
const badPath =
  'F:/Documents/Repertory/Sieyuan/暂放/翻译工具文档/平台-测试部/mon-1.9.0补充qt通用语言/去重文件（去重后，送翻前）_词条导出_20260714075255_RU机翻-人工检查了前200条.xlsx';

const outDir = path.join(
  __dirname,
  '..',
  'template',
  'few-shot-example',
  'misalign-10-regression'
);
fs.mkdirSync(outDir, { recursive: true });

const srcBook = XLSX.readFile(srcPath);
const src = XLSX.utils.sheet_to_json(srcBook.Sheets[srcBook.SheetNames[0]], { defval: '' });
const badBook = XLSX.readFile(badPath);
const bad = XLSX.utils.sheet_to_json(badBook.Sheets[badBook.SheetNames[0]], { defval: '' });

const byId = Object.fromEntries(src.map((r) => [r.id, r]));
const badById = Object.fromEntries(bad.map((r) => [r.id, r]));

const rows = [];
const manifest = [];
for (const id of ids) {
  const r = byId[id];
  if (!r) throw new Error('missing id in source: ' + id);
  const b = badById[id] || {};
  const en = String(r['英文翻译'] || r['词条'] || '');
  rows.push({
    id: r.id,
    词条: r['词条'],
    tag: r.tag || '',
    英文翻译: en,
    comment: r.comment || '',
    俄文翻译: '',
    词条来源: r['词条来源'] || 'qt',
    辞典名称: '',
    翻译最大长度: '',
    备注1: ''
  });
  manifest.push({
    id,
    en: en.slice(0, 160),
    badRu: String(b['俄文翻译'] || '').slice(0, 160),
    hasNewline: /[\r\n]/.test(en),
    issue: 'historical_row_misalignment'
  });
}

const ws = XLSX.utils.json_to_sheet(rows);
XLSX.writeFile({ SheetNames: ['Sheet1'], Sheets: { Sheet1: ws } }, path.join(outDir, 'input.xlsx'));

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
const headers = Object.keys(rows[0]);
const csv = [headers.join(',')]
  .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(',')))
  .join('\n');
fs.writeFileSync(path.join(outDir, 'input.csv'), csv, 'utf8');
fs.writeFileSync(path.join(outDir, 'baseline-bad.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('wrote', rows.length, 'rows ->', outDir);
console.log(manifest.map((m) => m.id + (m.hasNewline ? ' [NL]' : '')).join('\n'));
