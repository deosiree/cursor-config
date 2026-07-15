#!/usr/bin/env node
/**
 * Offline: strip English gloss parens + batch-LLM residual EN decide/apply on RU column.
 *
 * Usage:
 *   node scripts/remediate-ru-mixed-en.js --in path/to/*_RU机翻.xlsx [--dry-run] [--batch-size 50]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const {
  stripEn2RuEnglishGlossParen,
  hasEnglishGlossParen
} = require('../lib/en2ruResidualEnglish.js');
const { remediateRussianRows } = require('../lib/en2ruTermDecide.js');
const { resolveActiveTranslateWorkers } = require('../translateCsv.js');

function parseArgs(argv) {
  const out = {
    in: '',
    dryRun: false,
    batchSize: 50,
    sourceCol: '英文翻译',
    targetCol: '俄文翻译'
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') out.in = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--batch-size') out.batchSize = Number(argv[++i]) || 50;
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
    else if (a === '--targetCol') out.targetCol = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.in) {
    console.error('Usage: node scripts/remediate-ru-mixed-en.js --in <xlsx> [--dry-run]');
    process.exit(2);
  }
  const abs = path.resolve(args.in);
  if (!fs.existsSync(abs)) throw new Error('file not found: ' + abs);

  const wb = XLSX.readFile(abs);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  let parenStripped = 0;
  const prepared = [];
  for (const r of rows) {
    let ru = String(r[args.targetCol] || '');
    const gloss = stripEn2RuEnglishGlossParen(ru);
    if (gloss.stripped > 0) {
      parenStripped += gloss.stripped;
      ru = gloss.text;
      const note = String(r['备注1'] || '').trim();
      const tag = '后处理: 已去掉括号英注';
      if (!args.dryRun && !note.includes(tag)) {
        r['备注1'] = [note, tag].filter(Boolean).join('; ');
      }
    }
    r[args.targetCol] = ru;
    prepared.push({ id: r.id, ru });
  }

  const outDir = path.dirname(abs);
  const cachePath = path.join(outDir, 'en2ru-term-decisions.json');
  let worker;
  try {
    worker = require('../translateCsv.js').resolveVerifyWorker();
    console.log(`term-decide using verify worker ${worker.id}`);
  } catch (e) {
    console.warn('verify worker unavailable, fallback en2ru MT:', e.message);
    const workers = resolveActiveTranslateWorkers({
      multiModel: true,
      models: 'all',
      mode: 'en2ru'
    });
    worker = workers[0];
  }
  if (!worker) throw new Error('no en2ru worker available');
  console.log(`unique residual scan starting (${prepared.length} rows)…`);

  const result = await remediateRussianRows(prepared, {
    callBatch: (prompt, n) => worker.callBatch(prompt, n),
    promptDir: path.join(__dirname, '..', 'prompts'),
    cachePath: args.dryRun ? null : cachePath,
    batchSize: args.batchSize,
    onBatch: ({ size, decided }) => console.log(`  term-decide batch size=${size} decided=${decided}`)
  });

  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        parenStripped,
        uniqueTerms: result.uniqueCount,
        stats: result.stats,
        replaceCount: result.replaceCount,
        keepCount: result.keepCount
      },
      null,
      2
    )
  );

  if (!args.dryRun) {
    const byId = Object.fromEntries(result.rows.map((x) => [String(x.id), x]));
    for (const r of rows) {
      const id = String(r.id || '');
      const applied = byId[id];
      if (!applied) continue;
      r[args.targetCol] = applied.ru;
      if (applied.replaced.length || applied.kept.length) {
        const bits = [];
        if (applied.replaced.length) bits.push(`残留英文已替换 ${applied.replaced.slice(0, 5).join(', ')}`);
        if (applied.kept.length) bits.push(`残留英文术语保留 ${applied.kept.slice(0, 8).join(', ')}`);
        const note = String(r['备注1'] || '').trim();
        const add = bits.map((b) => `后处理: ${b}`).join('; ');
        r['备注1'] = [note, add].filter(Boolean).join('; ');
      }
    }
    const bak = abs.replace(/(\.xlsx?)$/i, `_preRemediate$1`);
    if (!fs.existsSync(bak)) fs.copyFileSync(abs, bak);
    wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
    XLSX.writeFile(wb, abs);
    // sync csv sibling if present
    const csv = abs.replace(/\.xlsx$/i, '.csv');
    if (fs.existsSync(csv) || /\.xlsx$/i.test(abs)) {
      const wbCsv = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbCsv, XLSX.utils.json_to_sheet(rows), 'Sheet1');
      XLSX.writeFile(wbCsv, csv, { bookType: 'csv' });
    }
    console.log('Wrote', abs);
    console.log('Cache', cachePath);
    const residualParen = rows.filter((r) => hasEnglishGlossParen(String(r[args.targetCol] || ''))).length;
    console.log('remaining gloss parens', residualParen);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
