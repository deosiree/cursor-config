#!/usr/bin/env node
/**
 * v2 实跑 CLI：按同名 .report 的 interpretation 缩短，输出 <dir>_new
 *
 * Usage:
 *   node scripts/shorten-from-report-dir.js <dbDir> [--batch-size 12] [--max-rounds 2]
 *     [--models deepseek|xfyun:xophunyuan7bmt] [--parallel 3] [--rules-only]
 *
 * 性能策略（实跑沉淀）：
 *   T0 规则层（零 API）→ T1 小批 LLM（仅仍超长）→ T2 边界截断兜底
 *   讯飞：单批 ≤3；DeepSeek：≤15 且可并行
 */
const fs = require('fs');
const path = require('path');
const {
  parseReport,
  dedupeBySourceTag,
  utf8ByteLen,
  buildDicFromReport,
  verifyDicAgainstReport,
  calcCharBudget
} = require('./parse-report.js');
const {
  ruleShortenToLimit,
  truncateUtf8Boundary
} = require('../lib/ruleShorten.js');

const translateRoot = path.join(__dirname, '../../translate');
const translateNm = path.join(translateRoot, 'node_modules');
if (!module.paths.includes(translateNm)) module.paths.unshift(translateNm);
const translate = require(path.join(translateRoot, 'translateCsv.js'));

function parseCli(argv) {
  const out = {
    dbDir: '',
    batchSize: 12,
    maxRounds: 2,
    parallel: 3,
    models: 'deepseek',
    rulesOnly: false
  };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--batch-size') out.batchSize = Math.max(1, Number(argv[++i]) || 12);
    else if (a === '--max-rounds') out.maxRounds = Math.max(1, Number(argv[++i]) || 2);
    else if (a === '--parallel') out.parallel = Math.max(1, Number(argv[++i]) || 3);
    else if (a === '--models') out.models = String(argv[++i] || 'deepseek');
    else if (a === '--rules-only') out.rulesOnly = true;
    else if (!a.startsWith('-')) pos.push(a);
  }
  out.dbDir = pos[0] || '';
  return out;
}

function buildShortenPrompt(items) {
  const lines = items.map((it, i) => {
    return (
      `${i + 1}. 源<<<${it.source}>>> 上限${it.actualMax}B 超${it.overBy}B ` +
      `预算≈${it.charBudget} | RU<<<${it.langText}>>>`
    );
  });
  return (
    `缩短下列俄语到各自 UTF-8 字节上限内。只输出编号行，无解释。\n` +
    `规则：автоматическая→авто, синхронизация→синхр., валидности→валид., информация→инф.；保留下划线。\n\n` +
    lines.join('\n')
  );
}

function parseNumbered(raw, n) {
  const out = new Array(n).fill('');
  if (Array.isArray(raw)) {
    for (let i = 0; i < n; i++) out[i] = String(raw[i] || '').trim();
    return out;
  }
  const text = String(raw || '');
  for (let i = 1; i <= n; i++) {
    const m = text.match(new RegExp(`(?:^|\\n)\\s*${i}\\s*[.、:)：]\\s*(.+)`, 'm'));
    if (m) out[i - 1] = m[1].trim();
  }
  return out;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function shortenBatch(worker, items) {
  const prompt = buildShortenPrompt(items);
  try {
    const raw = await worker.callBatch(prompt, items.length);
    return parseNumbered(raw, items.length);
  } catch (e) {
    console.warn(`  batch fail (${items.length}): ${e.message}`);
    return items.map(() => '');
  }
}

async function runBatchesParallel(worker, batches, parallel) {
  const results = [];
  for (let i = 0; i < batches.length; i += parallel) {
    const slice = batches.slice(i, i + parallel);
    const settled = await Promise.all(slice.map((b) => shortenBatch(worker, b)));
    for (let j = 0; j < slice.length; j++) {
      results.push({ batch: slice[j], texts: settled[j] });
    }
  }
  return results;
}

function resolveWorker(models, batchSize) {
  const wantXfyun = /xfyun/i.test(models);
  if (wantXfyun) {
    const workers = translate.resolveActiveTranslateWorkers({
      multiModel: true,
      models: models.includes(':') ? models : 'xfyun:xophunyuan7bmt'
    });
    if (!workers[0]) throw new Error('xfyun worker unavailable');
    return { worker: workers[0], effectiveBatch: Math.min(batchSize, 3) };
  }
  try {
    return { worker: translate.resolveVerifyWorker(), effectiveBatch: Math.min(batchSize, 15) };
  } catch (e) {
    const workers = translate.resolveActiveTranslateWorkers({ multiModel: true, models: 'all' });
    if (!workers[0]) throw e;
    return { worker: workers[0], effectiveBatch: batchSize };
  }
}

function applyShortenResult(e, ru, shortenMap, stats) {
  ru = String(ru || '').trim().replace(/^["「]|["」]$/g, '').replace(/^.*→\s*/, '');
  if (!ru) ru = e.langText;
  const bytes = utf8ByteLen(ru);
  if (bytes <= e.actualMax) {
    shortenMap[e.source] = ru;
    stats.llmOk += 1;
    console.log(`    OK ${e.source}: ${e.actualBytes}→${bytes}B | ${ru}`);
    return true;
  }
  return false;
}

async function processReport(reportPath, outDicPath, opts, worker, effectiveBatch) {
  const parsed = parseReport(reportPath);
  if (parsed.errors.length) console.warn('parse errors', parsed.errors);
  const { unique } = dedupeBySourceTag(parsed.entries);
  const need = unique.filter((e) => e.overBy > 0);
  console.log(`\n${path.basename(reportPath)}: unique=${unique.length} overlong=${need.length}`);

  const shortenMap = {};
  const stats = { ruleOk: 0, llmOk: 0, truncated: 0 };
  for (const e of unique) {
    if (e.overBy <= 0) shortenMap[e.source] = e.langText;
  }

  let pending = [];
  const t0 = Date.now();
  for (const e of need) {
    const ruled = ruleShortenToLimit(e.langText, e.actualMax);
    if (ruled.ok) {
      shortenMap[e.source] = ruled.text;
      stats.ruleOk += 1;
      console.log(`    RULE ${e.source}: ${e.actualBytes}→${ruled.bytes}B | ${ruled.text}`);
    } else {
      pending.push({
        ...e,
        langText: ruled.text,
        actualBytes: ruled.bytes,
        overBy: ruled.bytes - e.actualMax,
        charBudget: calcCharBudget(ruled.text, e.actualMax)
      });
    }
  }
  console.log(`  T0 rules: ${stats.ruleOk}/${need.length} in ${Date.now() - t0}ms`);

  if (!opts.rulesOnly && pending.length > 0) {
    for (let round = 1; round <= opts.maxRounds && pending.length; round++) {
      console.log(`  round ${round}: LLM ${pending.length} (batch≤${effectiveBatch})`);
      const batches = chunk(pending, effectiveBatch);
      const t1 = Date.now();
      const batchResults = await runBatchesParallel(worker, batches, opts.parallel);
      const still = [];
      for (const { batch, texts } of batchResults) {
        for (let i = 0; i < batch.length; i++) {
          const e = batch[i];
          let ru = texts[i];
          if (!applyShortenResult(e, ru, shortenMap, stats)) {
            const retryRule = ruleShortenToLimit(ru || e.langText, e.actualMax);
            if (retryRule.ok) {
              shortenMap[e.source] = retryRule.text;
              stats.ruleOk += 1;
              console.log(`    RULE2 ${e.source}: →${retryRule.bytes}B`);
            } else {
              still.push({
                ...e,
                langText: retryRule.text,
                actualBytes: retryRule.bytes,
                overBy: retryRule.bytes - e.actualMax,
                charBudget: calcCharBudget(retryRule.text, e.actualMax)
              });
            }
          }
        }
      }
      console.log(`  round ${round} done in ${Date.now() - t1}ms, still=${still.length}`);
      pending = still;
    }
  }

  for (const e of pending) {
    let ru = truncateUtf8Boundary(e.langText, e.actualMax);
    shortenMap[e.source] = ru;
    stats.truncated += 1;
    console.log(`    TRUNC ${e.source} → ${utf8ByteLen(ru)}B`);
  }

  const built = buildDicFromReport(reportPath, shortenMap);
  fs.mkdirSync(path.dirname(outDicPath), { recursive: true });
  fs.writeFileSync(outDicPath, JSON.stringify(built.dic, null, 4), 'utf8');
  const verify = verifyDicAgainstReport(reportPath, built.dic);
  const passed = verify.fail === 0;
  console.log(`  wrote ${outDicPath} rows=${built.uniqueCount} stats=${JSON.stringify(stats)}`);
  console.log(`  verify pass=${verify.pass} fail=${verify.fail}`);
  return { shortenMap, verify: { ...verify, passed }, built, stats };
}

async function main() {
  const opts = parseCli(process.argv.slice(2));
  if (!opts.dbDir) {
    console.error(
      'Usage: node scripts/shorten-from-report-dir.js <dbDir> [--batch-size 12] [--max-rounds 2] [--parallel 3] [--models deepseek|xfyun:...] [--rules-only]'
    );
    process.exit(2);
  }
  const outDir = opts.dbDir.replace(/[\\/]+$/, '') + '_new';
  fs.mkdirSync(outDir, { recursive: true });

  const { worker, effectiveBatch } = opts.rulesOnly
    ? { worker: null, effectiveBatch: 0 }
    : resolveWorker(opts.models, opts.batchSize);
  if (worker) console.log('shorten worker:', worker.id, 'batch≤', effectiveBatch, 'parallel=', opts.parallel);
  console.log('output:', outDir);

  const reports = fs.readdirSync(opts.dbDir).filter((f) => f.toLowerCase().endsWith('.report')).sort();
  const summary = [];
  const tAll = Date.now();
  for (const rep of reports) {
    const reportPath = path.join(opts.dbDir, rep);
    const outDic = path.join(outDir, rep.replace(/\.report$/i, '.dic'));
    const r = await processReport(reportPath, outDic, opts, worker, effectiveBatch);
    summary.push({
      report: rep,
      out: outDic,
      passed: r.verify.passed,
      fail: r.verify.fail,
      stats: r.stats
    });
  }
  const elapsedMs = Date.now() - tAll;
  fs.writeFileSync(
    path.join(outDir, 'shorten-summary.json'),
    JSON.stringify({ elapsedMs, summary }, null, 2),
    'utf8'
  );
  console.log(`\n=== SUMMARY (${elapsedMs}ms) ===`);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.every((s) => s.passed) ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
