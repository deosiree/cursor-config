#!/usr/bin/env node
/**
 * Fill empty 俄文翻译: reuse shortest RU for same 词条, then DeepSeek short-label translate.
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { resolveVerifyWorker } = require('../translateCsv.js');

const SRC =
  process.argv[2] ||
  'F:/Documents/Repertory/Sieyuan/暂放/翻译工具文档/平台-测试部/mon-1.9.0首页中的软件名称/去重文件（去重后，送翻前）.xlsx';

function shortestRu(cands) {
  return cands
    .slice()
    .sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
}

function buildPrompt(chunk) {
  const lines = chunk.map((x, i) => `${i + 1}. ${x.en} | 中文:${x.zh}`).join('\n');
  return `你是 UI 短标签俄语译者。将下列软件功能名译成**尽量短**的俄语（名词短语，能一词则一词）。
规则：
1. 只输出西里尔俄语，禁止中文，禁止英括注，禁止解释
2. 越短越好（首页 Tab/工具名）
3. 专名 TDB/DB/Enum 可保留拉丁缩写
4. 每行格式：序号. 俄语

${lines}
`;
}

function parseNumbered(raw, n) {
  const byIdx = new Map();
  for (const line of String(raw || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const m = line.match(/^(\d+)[.、]\s*(.+)$/);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    if (idx < 1 || idx > n) continue;
    let ru = m[2].replace(/^["「]|["」]$/g, '').trim();
    ru = ru.replace(/\s*\([^)]*[A-Za-z][^)]*\)\s*$/, '').trim();
    byIdx.set(idx, ru);
  }
  return byIdx;
}

async function main() {
  const abs = path.resolve(SRC);
  if (!fs.existsSync(abs)) throw new Error('file not found: ' + abs);

  const worker = resolveVerifyWorker();
  console.log('worker', worker.id);

  const bak = abs.replace(/(\.xlsx?)$/i, '_preFillRu$1');
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(abs, bak);
    console.log('backup', bak);
  }

  const wb = XLSX.readFile(abs);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  const zhBest = new Map();
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    const ru = String(r['俄文翻译'] || '').trim();
    if (!zh || !ru) continue;
    const prev = zhBest.get(zh);
    if (!prev || ru.length < prev.length || (ru.length === prev.length && ru < prev)) {
      zhBest.set(zh, ru);
    }
  }

  let reused = 0;
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh) continue;
    const best = zhBest.get(zh);
    if (best) {
      r['俄文翻译'] = best;
      reused += 1;
    }
  }
  console.log('reused', reused);

  const need = [];
  const seen = new Set();
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh || seen.has(zh)) continue;
    seen.add(zh);
    const en = String(r['英文翻译'] || '').trim();
    need.push({ zh, en: en || zh });
  }
  console.log('toTranslate', need.length);

  const translations = new Map();
  const batchSize = 14;
  for (let i = 0; i < need.length; i += batchSize) {
    const chunk = need.slice(i, i + batchSize);
    const prompt = buildPrompt(chunk);
    let raw;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        raw = await worker.callSingle(prompt);
        break;
      } catch (e) {
        console.warn('retry', attempt, e.message);
        if (attempt === 4) throw e;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    const byIdx = parseNumbered(raw, chunk.length);
    for (let j = 0; j < chunk.length; j++) {
      const ru = byIdx.get(j + 1) || '';
      if (!ru || /[\u4e00-\u9fff]/.test(ru)) {
        console.warn('bad', chunk[j].zh, ru);
        continue;
      }
      translations.set(chunk[j].zh, ru);
      console.log(chunk[j].zh, '=>', ru);
    }
  }

  let filledNew = 0;
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh) continue;
    const ru = translations.get(zh);
    if (ru) {
      r['俄文翻译'] = ru;
      filledNew += 1;
      const prev = zhBest.get(zh);
      if (!prev || ru.length < prev.length) zhBest.set(zh, ru);
    }
  }

  // same-zh fill again
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    if (String(r['俄文翻译'] || '').trim() || !zh) continue;
    const best = zhBest.get(zh);
    if (best) {
      r['俄文翻译'] = best;
      filledNew += 1;
    }
  }

  // among same zh with multiple RUs including new, normalize all to shortest
  const zhAll = new Map();
  for (const r of rows) {
    const zh = String(r['词条'] || '').trim();
    const ru = String(r['俄文翻译'] || '').trim();
    if (!zh || !ru) continue;
    if (!zhAll.has(zh)) zhAll.set(zh, new Set());
    zhAll.get(zh).add(ru);
  }
  let normalized = 0;
  for (const [zh, set] of zhAll) {
    if (set.size <= 1) continue;
    const best = shortestRu([...set]);
    for (const r of rows) {
      if (String(r['词条'] || '').trim() !== zh) continue;
      if (String(r['俄文翻译'] || '').trim() !== best) {
        r['俄文翻译'] = best;
        normalized += 1;
      }
    }
  }

  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  XLSX.writeFile(wb, abs);

  const outDir = path.dirname(abs);
  const base = path.basename(abs, path.extname(abs));
  const outXlsx = path.join(outDir, `${base}_RU机翻.xlsx`);
  const outCsv = path.join(outDir, `${base}_RU机翻.csv`);
  XLSX.writeFile(wb, outXlsx);
  XLSX.writeFile(wb, outCsv, { bookType: 'csv' });

  const empty = rows.filter((r) => !String(r['俄文翻译'] || '').trim()).length;
  console.log(
    JSON.stringify(
      {
        reused,
        translatedUnique: translations.size,
        filledNew,
        normalizedToShortest: normalized,
        stillEmpty: empty,
        outXlsx,
        sourceUpdated: abs
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
