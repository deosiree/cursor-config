#!/usr/bin/env node
/**
 * DeepSeek 整表去重质检 + FIX 回写
 * Usage: node scripts/qa-fix-ru-xlsx.js <input.xlsx> [outDir]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { normalizeEntryKey } = require('../lib/entryKeepDecide');
const { qaUniqueRuWithLlm } = require('../lib/ruQaAudit');
const { resolveVerifyWorker } = require('../translateCsv.js');

async function main() {
  const src = process.argv[2];
  const outDir = process.argv[3] || path.join(path.dirname(src), 'qa_out');
  if (!src) {
    console.error('Usage: node scripts/qa-fix-ru-xlsx.js <input.xlsx> [outDir]');
    process.exit(2);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const rows = XLSX.utils.sheet_to_json(XLSX.readFile(src).Sheets[XLSX.readFile(src).SheetNames[0]], {
    defval: ''
  });
  const map = new Map();
  for (const r of rows) {
    const ci = String(r['词条'] || '').trim();
    if (!ci) continue;
    const key = normalizeEntryKey(ci);
    if (!map.has(key)) {
      map.set(key, {
        key,
        ci,
        en: String(r['英文翻译'] || '').trim(),
        ru: String(r['俄文翻译'] || '').trim()
      });
    }
  }
  const items = [...map.values()];
  console.log('unique', items.length);
  const worker = resolveVerifyWorker();
  console.log('verify', worker.id);

  const { results, failBatches } = await qaUniqueRuWithLlm(items, {
    callBatch: (p, n) => worker.callBatch(p, n),
    promptDir: path.join(__dirname, '../prompts'),
    batchSize: 20,
    onBatch: ({ size, done }) => console.log(`QA batch ${size}, done=${done}`)
  });

  let ok = 0;
  let fail = 0;
  let fixed = 0;
  let failNoFix = 0;
  const fixByKey = new Map();
  const failList = [];
  for (const it of items) {
    const q = results.get(it.key) || { ok: false, reason: 'missing' };
    if (q.ok) {
      ok += 1;
      continue;
    }
    fail += 1;
    if (q.fix) {
      let ru = String(q.fix).trim().replace(/^["「]|["」]$/g, '');
      fixByKey.set(it.key, ru);
      fixed += 1;
      failList.push({ ci: it.ci, old: it.ru, fix: ru, reason: q.reason });
    } else {
      failNoFix += 1;
      failList.push({ ci: it.ci, old: it.ru, fix: null, reason: q.reason });
    }
  }

  let rowUpdates = 0;
  for (const r of rows) {
    const key = normalizeEntryKey(r['词条']);
    if (!fixByKey.has(key)) continue;
    let ru = fixByKey.get(key);
    const ci = String(r['词条'] || '').trim();
    if (/^[A-Z0-9][A-Z0-9_\s\-./]*$/.test(ci) && /[A-Z]{4,}/.test(ci) && /[\u0400-\u04FF]/.test(ru)) {
      try {
        ru = ru.toLocaleUpperCase('ru-RU');
      } catch (_) {
        ru = ru.toUpperCase();
      }
    }
    while (Buffer.byteLength(ru, 'utf8') > 63) {
      ru = ru.slice(0, Math.max(0, ru.length - 1));
    }
    r['俄文翻译'] = ru;
    const note = String(r['备注1'] || '');
    if (!note.includes('qa_fix')) r['备注1'] = note ? `${note};qa_fix` : 'qa_fix';
    rowUpdates += 1;
  }

  const report = { unique: items.length, ok, fail, fixed, failNoFix, failBatches, failList, rowUpdates };
  fs.writeFileSync(path.join(outDir, 'qa-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const headers = Object.keys(rows[0]);
  const aoa = [headers, ...rows.map((r) => headers.map((h) => String(r[h] ?? '')))];
  const nwb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(nwb, XLSX.utils.aoa_to_sheet(aoa), 'Sheet1');
  const outXlsx = path.join(outDir, 'qa_fixed.xlsx');
  XLSX.writeFile(nwb, outXlsx);
  XLSX.writeFile(nwb, src);
  console.log(JSON.stringify({ ok, fail, fixed, failNoFix, failBatches, rowUpdates, outXlsx }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
