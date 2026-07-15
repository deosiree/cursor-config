#!/usr/bin/env node
const path = require('path');
const XLSX = require('xlsx');
const { resolveVerifyWorker } = require('../translateCsv.js');

const SRC =
  process.argv[2] ||
  'F:/Documents/Repertory/Sieyuan/暂放/翻译工具文档/平台-测试部/mon-1.9.0首页中的软件名称/去重文件（去重后，送翻前）.xlsx';

async function main() {
  const worker = resolveVerifyWorker();
  const wb = XLSX.readFile(SRC);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  const need = [];
  const seen = new Set();
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh || seen.has(zh)) continue;
    seen.add(zh);
    need.push({ zh, en: String(r['英文翻译'] || zh).trim() || zh });
  }
  console.log('need', need.length);
  if (!need.length) {
    console.log('nothing to do');
    return;
  }

  const entryList = need.map((x, i) => `${i + 1}. ${x.en} / ${x.zh}`).join('\n');
  const prompt = `Translate each UI name to SHORT Russian. Cyrillic only. No Chinese. No English gloss. Keep TDB/DB/Enum if needed.
Output ONLY numbered lines:
1. Russian
2. Russian
...

${entryList}
`;

  let raw = '';
  for (let a = 1; a <= 4; a++) {
    try {
      raw = await worker.callSingle(prompt);
      break;
    } catch (e) {
      console.warn('retry', a, e.message);
      if (a === 4) throw e;
      await new Promise((r) => setTimeout(r, 1500 * a));
    }
  }
  console.log('RAW:\n' + raw);

  const by = new Map();
  for (const line of String(raw).split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)[.、:)]\s*(.+)$/);
    if (!m) continue;
    by.set(Number(m[1]), m[2].trim().replace(/\s*\([^)]*\)\s*$/, ''));
  }

  const map = new Map();
  for (let i = 0; i < need.length; i++) {
    const ru = by.get(i + 1) || '';
    if (ru && !/[\u4e00-\u9fff]/.test(ru)) {
      map.set(need[i].zh, ru);
      console.log(need[i].zh, '=>', ru);
    } else {
      console.warn('miss', need[i].zh);
    }
  }

  let filled = 0;
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh) continue;
    const ru = map.get(zh);
    if (ru) {
      r['俄文翻译'] = ru;
      filled += 1;
    }
  }

  const zhAll = new Map();
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    const ru = String(r['俄文翻译'] || '').trim();
    if (!zh || !ru) continue;
    if (!zhAll.has(zh)) zhAll.set(zh, new Set());
    zhAll.get(zh).add(ru);
  }
  for (const [zh, set] of zhAll) {
    const best = [...set].sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
    for (const r of rows) {
      if (String(r['词条'] || '').trim() === zh) r['俄文翻译'] = best;
    }
  }

  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  XLSX.writeFile(wb, SRC);
  const dir = path.dirname(SRC);
  const base = path.basename(SRC, path.extname(SRC));
  XLSX.writeFile(wb, path.join(dir, `${base}_RU机翻.xlsx`));
  XLSX.writeFile(wb, path.join(dir, `${base}_RU机翻.csv`), { bookType: 'csv' });

  console.log({
    filled,
    empty: rows.filter((r) => !String(r['俄文翻译'] || '').trim()).length
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
