#!/usr/bin/env node
/**
 * Excel「俄文翻译」压到 UTF-8 ≤ byteLimit。
 * 缩短：free 多模型并发；验证：DeepSeek-V4-Flash + 硬门禁。
 *
 * Usage:
 *   node compressExcelRu.js <input.xlsx> <outputDir> \
 *     --byte-limit 63 --multi-model --models all \
 *     [--limit 5] [--max-rounds 3] [--skip-deepseek-verify] [--in-place]
 */
const fs = require('fs');
const path = require('path');
const translateNm = path.join(__dirname, '../translate/node_modules');
if (!module.paths.includes(translateNm)) module.paths.unshift(translateNm);
const XLSX = require('xlsx');

const { utf8Len, calcCharBudget, truncateUtf8Boundary } = require('./lib/utf8Budget');
const { validateRuCompressHard, stripEn2RuEnglishGlossParen } = require('./lib/ruQualityGate');
const {
  resolveShortenWorkers,
  resolveVerifyWorker,
  parseBatchTranslationResponse,
  writeXlsxPreviewFile,
  BATCH_NL_TOKEN
} = require('./lib/workers');
const translate = require(path.join(__dirname, '../translate/translateCsv.js'));

const COL_ZH = '词条';
const COL_EN = '英文翻译';
const COL_RU = '俄文翻译';
const COL_NOTE = '备注1';

function parseArgs(argv) {
  const out = {
    input: '',
    outputDir: '',
    targetCol: COL_RU,
    sourceCol: COL_EN,
    zhCol: COL_ZH,
    byteLimit: 63,
    multiModel: true,
    models: 'all',
    limit: 0,
    maxRounds: 3,
    skipDeepseekVerify: false,
    inPlace: false,
    batchSize: 20,
    verifyBatchSize: 0, // 0 = 整表一坨验（失败再二分）
    concurrency: 0, // 0 = 自动 = workers.length
    force: false
  };
  const pos = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--targetCol') out.targetCol = argv[++i];
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
    else if (a === '--zhCol') out.zhCol = argv[++i];
    else if (a === '--byte-limit') out.byteLimit = Number(argv[++i]) || 63;
    else if (a === '--multi-model') out.multiModel = true;
    else if (a === '--models') out.models = argv[++i];
    else if (a === '--limit') out.limit = Number(argv[++i]) || 0;
    else if (a === '--max-rounds') out.maxRounds = Number(argv[++i]) || 3;
    else if (a === '--batch-size') out.batchSize = Number(argv[++i]) || 20;
    else if (a === '--verify-batch-size') out.verifyBatchSize = Number(argv[++i]) || 0;
    else if (a === '--concurrency') out.concurrency = Math.max(1, Number(argv[++i]) || 4);
    else if (a === '--skip-deepseek-verify') out.skipDeepseekVerify = true;
    else if (a === '--in-place') out.inPlace = true;
    else if (a === '--force') out.force = true;
    else if (!a.startsWith('-')) pos.push(a);
  }
  out.input = pos[0] || '';
  out.outputDir = pos[1] || '';
  return out;
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(__dirname, 'prompts', name), 'utf8');
}

function readSheetRows(xlsxPath) {
  const abs = path.resolve(xlsxPath);
  const wb = XLSX.readFile(abs);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const headers =
    rows.length > 0
      ? Object.keys(rows[0])
      : XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })[0] || [];
  return { abs, rows, headers: Array.isArray(headers) ? headers : Object.keys(headers) };
}

function ensureHeaders(headers, needed) {
  const set = new Set(headers);
  for (const h of needed) {
    if (!set.has(h)) {
      headers.push(h);
      set.add(h);
    }
  }
  return headers;
}

function appendNote(row, tag) {
  const note = String(row[COL_NOTE] || '').trim();
  if (note.includes(tag)) return;
  row[COL_NOTE] = note ? `${note};${tag}` : tag;
}

function buildShortenPrompt(items, byteLimit) {
  const tpl = loadPrompt('prompt-batch-ru-shorten.md');
  const budgets = items.map((it) => calcCharBudget(it.ru, byteLimit));
  const hint = budgets.length ? Math.min(...budgets) : Math.floor(byteLimit / 2);
  const entryList = items
    .map((it, i) => {
      const zh = String(it.zh || '').replace(/\n/g, BATCH_NL_TOKEN);
      const en = String(it.en || '').replace(/\n/g, BATCH_NL_TOKEN);
      const ru = String(it.ru || '').replace(/\n/g, BATCH_NL_TOKEN);
      const bytes = utf8Len(it.ru);
      const budget = calcCharBudget(it.ru, byteLimit);
      return `${i + 1}. 字节=${bytes} | 预算≈${budget} | ZH<<<${zh}>>> EN<<<${en}>>> RU<<<${ru}>>>`;
    })
    .join('\n');
  return tpl
    .replace(/\{\{BYTE_LIMIT\}\}/g, String(byteLimit))
    .replace(/\{\{CHAR_BUDGET_HINT\}\}/g, String(hint))
    .replace('{{ENTRY_LIST}}', entryList);
}

function buildVerifyPrompt(items, byteLimit) {
  const tpl = loadPrompt('prompt-batch-ru-verify.md');
  const entryList = items
    .map((it, i) => {
      const en = String(it.en || '').replace(/\n/g, BATCH_NL_TOKEN);
      const ru = String(it.ru || '').replace(/\n/g, BATCH_NL_TOKEN);
      return `${i + 1}. bytes=${utf8Len(it.ru)} EN<<<${en}>>> RU<<<${ru}>>>`;
    })
    .join('\n');
  return tpl
    .replace(/\{\{BYTE_LIMIT\}\}/g, String(byteLimit))
    .replace('{{ENTRY_LIST}}', entryList);
}

function parsePassFail(text, n) {
  const lines = String(text || '').split('\n').filter((l) => l.trim());
  const map = new Map();
  for (const raw of lines) {
    const m = raw.trim().match(/^(\d+)[.、]\s*(PASS|FAIL)\b\s*:?\s*(.*)$/i);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    if (idx < 1 || idx > n) continue;
    map.set(idx, {
      ok: String(m[2]).toUpperCase() === 'PASS',
      reason: String(m[3] || '').trim()
    });
  }
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(map.get(i) || { ok: false, reason: 'missing_verdict' });
  }
  return out;
}

function sleepMs(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 对一批超长行跑缩短：按优先序尝试 workers；Busy 只试 1 次即切下一个
 */
async function shortenBatch(items, workers, byteLimit, preferredStart = 0, skippedProviders = null) {
  if (!items.length) return [];
  const skip = skippedProviders || new Set();
  const active = workers.filter((w) => !skip.has(w.provider));
  const pool = active.length ? active : workers;
  if (!pool.length) throw new Error('无可用 free 缩短 worker（检查 XFYUN/SILICONFLOW/ZHIPU API Key）');

  const prompt = buildShortenPrompt(items, byteLimit);
  const errors = [];
  const start = preferredStart % pool.length;

  for (let offset = 0; offset < pool.length; offset++) {
    const w = pool[(start + offset) % pool.length];
    const maxAttempt = w.provider === 'xfyun' ? 1 : 2;
    for (let attempt = 1; attempt <= maxAttempt; attempt++) {
      try {
        console.log(`  缩短 ${items.length} 条 ← ${w.name} (attempt ${attempt})`);
        const raw = await w.callBatch(prompt, items.length);
        let texts;
        if (Array.isArray(raw) && raw.length === items.length) {
          texts = raw;
        } else {
          texts = parseBatchTranslationResponse(String(raw || ''), items.length);
        }
        if (!texts || texts.length !== items.length) {
          throw new Error(`批结果条数不齐: got ${texts ? texts.length : 0}`);
        }
        return texts.map((t) =>
          String(t || '')
            .replace(new RegExp(BATCH_NL_TOKEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '\n')
            .trim()
        );
      } catch (e) {
        const msg = e && e.message ? e.message : String(e);
        errors.push(`${w.id}: ${msg}`);
        console.warn(`  ! ${w.name} 失败: ${msg.slice(0, 160)}`);
        if (/ENOTFOUND|ECONNREFUSED|certificate/i.test(msg) && skippedProviders) {
          skippedProviders.add(w.provider);
          console.warn(`  → 本轮跳过 provider=${w.provider}`);
        }
        if (/Busy|Engine Busy|ECONNRESET|timeout|条数不齐|ENOTFOUND/i.test(msg)) {
          break;
        }
        await sleepMs(300 * attempt);
      }
    }
  }
  throw new Error(`缩短批失败: ${errors.slice(0, 4).join(' | ')}`);
}

/**
 * 有限并发跑多批
 * @template T
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<void>} fn
 */
async function mapPool(items, concurrency, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

async function verifyBatchDeepseek(items, byteLimit, worker) {
  if (!items.length) return [];
  const prompt = buildVerifyPrompt(items, byteLimit);
  const raw = await worker.callBatch(prompt, items.length);
  let lines;
  if (Array.isArray(raw)) {
    lines = raw.map((x, i) => `${i + 1}. ${x}`).join('\n');
  } else {
    lines = String(raw || '');
  }
  return parsePassFail(lines, items.length);
}

/**
 * 合并验证：默认整表（或整段）一头打完；失败则二分后并行再验。
 * @returns {Promise<Array<{ ok: boolean, reason: string }>>} 与 idxs 对齐
 */
async function verifyMega(idxs, rows, args, verifyWorker) {
  if (!idxs.length) return [];
  const items = idxs.map((i) => ({
    en: rows[i][args.sourceCol],
    ru: rows[i][args.targetCol]
  }));

  // 默认：>120 条时按 100 条并行多坨「一头打完」；显式 --verify-batch-size 覆盖
  const autoChunk = items.length > 120 ? 100 : 0;
  const forcedChunk = args.verifyBatchSize > 0 ? args.verifyBatchSize : autoChunk;

  async function verifyChunk(sliceItems, depth) {
    try {
      console.log(`  DeepSeek 合并验证 ${sliceItems.length} 条 (depth=${depth})...`);
      return await verifyBatchDeepseek(sliceItems, args.byteLimit, verifyWorker);
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      console.warn(`  ! 合并验证失败(${sliceItems.length}): ${msg.slice(0, 120)}`);
      if (sliceItems.length <= 1) {
        return [{ ok: false, reason: `verify_error:${msg.slice(0, 80)}` }];
      }
      const mid = Math.ceil(sliceItems.length / 2);
      const [a, b] = await Promise.all([
        verifyChunk(sliceItems.slice(0, mid), depth + 1),
        verifyChunk(sliceItems.slice(mid), depth + 1)
      ]);
      return a.concat(b);
    }
  }

  if (forcedChunk > 0 && items.length > forcedChunk) {
    const chunks = [];
    for (let i = 0; i < items.length; i += forcedChunk) {
      chunks.push(items.slice(i, i + forcedChunk));
    }
    console.log(`  DeepSeek 并行合并验证：${items.length} 条 → ${chunks.length} 坨×≤${forcedChunk}`);
    const parts = await Promise.all(chunks.map((c) => verifyChunk(c, 0)));
    return parts.flat();
  }

  return verifyChunk(items, 0);
}

/**
 * 硬门禁失败索引（超长/CJK/残英等）
 */
function scanHardFailIdxs(rows, args) {
  const idxs = [];
  for (let i = 0; i < rows.length; i++) {
    const ru = String(rows[i][args.targetCol] || '');
    if (!ru.trim()) continue;
    const g = validateRuCompressHard(ru, rows[i][args.sourceCol], args.byteLimit);
    if (!g.ok) idxs.push(i);
  }
  return idxs;
}

/**
 * 并发缩短指定行
 */
async function shortenWave(todo, rows, workers, args, skippedProviders = null) {
  if (!todo.length) return 0;
  const skip = skippedProviders || new Set();
  let shortened = 0;
  const batches = [];
  for (let offset = 0; offset < todo.length; offset += args.batchSize) {
    batches.push(todo.slice(offset, offset + args.batchSize));
  }
  console.log(`  缩短波: ${todo.length} 条 → ${batches.length} 批，并发=${args.concurrency}`);
  await mapPool(batches, args.concurrency, async (batchIdxs, bi) => {
    const items = batchIdxs.map((i) => ({
      zh: rows[i][args.zhCol],
      en: rows[i][args.sourceCol],
      ru: rows[i][args.targetCol]
    }));
    try {
      const texts = await shortenBatch(items, workers, args.byteLimit, bi % workers.length, skip);
      for (let j = 0; j < batchIdxs.length; j++) {
        const i = batchIdxs[j];
        const next = stripEn2RuEnglishGlossParen(texts[j]).text.trim();
        if (!next) continue;
        const gate = validateRuCompressHard(next, rows[i][args.sourceCol], args.byteLimit);
        rows[i][args.targetCol] = gate.ok ? gate.text : next;
        shortened += 1;
      }
    } catch (e) {
      console.warn(`  批失败 #${bi}: ${e.message}`);
    }
  });
  return shortened;
}

function unifyByZh(rows, args) {
  /** @type {Map<string, string>} */
  const best = new Map();
  for (const row of rows) {
    const zh = String(row[args.zhCol] || '').trim();
    if (!zh) continue;
    const ru = String(row[args.targetCol] || '').trim();
    if (!ru) continue;
    const gate = validateRuCompressHard(ru, row[args.sourceCol], args.byteLimit);
    if (!gate.ok) continue;
    const prev = best.get(zh);
    if (!prev || utf8Len(gate.text) < utf8Len(prev)) {
      best.set(zh, gate.text);
    }
  }
  let n = 0;
  for (const row of rows) {
    const zh = String(row[args.zhCol] || '').trim();
    if (!zh || !best.has(zh)) continue;
    const pick = best.get(zh);
    if (String(row[args.targetCol] || '') !== pick) {
      row[args.targetCol] = pick;
      n += 1;
    }
  }
  return n;
}

function scanOverlong(rows, args) {
  const idxs = [];
  for (let i = 0; i < rows.length; i++) {
    const ru = String(rows[i][args.targetCol] || '');
    if (!ru.trim()) continue;
    if (utf8Len(ru) > args.byteLimit) idxs.push(i);
  }
  return idxs;
}

function writeCsv(outPath, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(esc).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => esc(row[h])).join(','));
  }
  fs.writeFileSync(outPath, `\uFEFF${lines.join('\n')}`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.input || !args.outputDir) {
    console.error(
      'Usage: node compressExcelRu.js <input.xlsx> <outputDir> [--byte-limit 63] [--multi-model] [--models all] [--limit N]'
    );
    process.exit(2);
  }

  fs.mkdirSync(args.outputDir, { recursive: true });
  const { abs, rows: allRows } = readSheetRows(args.input);
  let rows = allRows.map((r) => ({ ...r }));
  let headers = ensureHeaders(
    rows.length ? Object.keys(rows[0]) : [args.zhCol, args.sourceCol, args.targetCol, COL_NOTE],
    [args.zhCol, args.sourceCol, args.targetCol, COL_NOTE]
  );

  if (args.limit > 0) {
    rows = rows.slice(0, args.limit);
  }

  console.log(`输入: ${abs}`);
  console.log(`行数: ${rows.length}；byteLimit=${args.byteLimit}`);

  const { loadEntryKeepCache } = require(path.join(__dirname, '../translate/lib/entryKeepDecide'));
  const entryKeepCachePath = path.join(args.outputDir, 'entry-keep-decisions.json');
  const entryKeepCache = loadEntryKeepCache(entryKeepCachePath);
  let keepFilled = 0;
  for (const r of rows) {
    const ru = String(r[args.targetCol] || '').trim();
    if (ru) continue;
    const zh = String(r[args.zhCol] || '').trim();
    const en = String(r[args.sourceCol] || '').trim();
    let keepSrc = '';
    if (translate.shouldKeepCopyRu(zh, entryKeepCache)) keepSrc = zh;
    else if (translate.shouldKeepCopyRu(en, entryKeepCache)) keepSrc = en;
    if (!keepSrc) continue;
    r[args.targetCol] = keepSrc;
    appendNote(r, 'keep_copy_ci');
    keepFilled += 1;
  }
  if (keepFilled > 0) {
    console.log(`KEEP 空俄文已从词条/英文拷贝（DeepSeek 缓存）: ${keepFilled} 行`);
  }

  const workers = resolveShortenWorkers({
    multiModel: args.multiModel,
    models: args.models
  });
  if (!args.concurrency || args.concurrency < 1) {
    args.concurrency = Math.max(workers.length, 1);
  }
  console.log(`缩短 workers (${workers.length}): ${workers.map((w) => w.id).join(', ') || '(none)'}`);
  console.log(`并发批数=${args.concurrency}，batchSize=${args.batchSize}`);

  let verifyWorker = null;
  if (!args.skipDeepseekVerify) {
    try {
      verifyWorker = resolveVerifyWorker();
      console.log(`验证 worker: ${verifyWorker.id}`);
    } catch (e) {
      console.warn(`⚠ DeepSeek 验证不可用: ${e.message}`);
      console.warn('  将只跑硬门禁；recommendDeliver=false');
    }
  }

  const verifyLog = {
    input: abs,
    byteLimit: args.byteLimit,
    verifyModel: verifyWorker ? verifyWorker.id : null,
    skipDeepseekVerify: args.skipDeepseekVerify,
    rounds: [],
    recommendDeliver: false
  };

  /**
   * 迭代：pending=硬失败∪DS失败 → free并发缩短 → DeepSeek整表一头验 → 更新pending。
   */
  let deepseekFailNotes = 0;
  /** @type {number[]} */
  let pending = scanHardFailIdxs(rows, args);
  /** @type {Set<string>} */
  const skippedProviders = new Set();

  for (let round = 1; round <= args.maxRounds; round++) {
    console.log(`\n=== Round ${round}/${args.maxRounds} pending=${pending.length} ===`);

    let shortened = 0;
    if (pending.length > 0) {
      shortened = await shortenWave(pending, rows, workers, args, skippedProviders);
      console.log(`  缩短完成: ${shortened}`);
    }

    const hardAfter = scanHardFailIdxs(rows, args);
    const hardSet = new Set(hardAfter);
    /** @type {Set<number>} */
    const dsFail = new Set();
    // 已硬失败（超长/CJK/残英）不必再喂 DeepSeek；只合并验硬门禁已绿的行
    if (verifyWorker) {
      const softIdxs = rows
        .map((_, i) => i)
        .filter((i) => String(rows[i][args.targetCol] || '').trim() && !hardSet.has(i));
      console.log(
        `  DeepSeek 合并验证硬绿 ${softIdxs.length} 条（硬失败 ${hardAfter.length} 跳过）...`
      );
      if (softIdxs.length) {
        const verdicts = await verifyMega(softIdxs, rows, args, verifyWorker);
        for (let j = 0; j < softIdxs.length; j++) {
          const i = softIdxs[j];
          if (!verdicts[j] || !verdicts[j].ok) {
            dsFail.add(i);
            appendNote(rows[i], `ds_fail:${(verdicts[j] && verdicts[j].reason) || 'fail'}`);
          } else {
            const note = String(rows[i][COL_NOTE] || '');
            if (note.includes('ds_fail:')) {
              rows[i][COL_NOTE] = note
                .split(';')
                .map((x) => x.trim())
                .filter((x) => x && !x.startsWith('ds_fail:'))
                .join(';');
            }
          }
        }
      }
      deepseekFailNotes = dsFail.size;
    }

    pending = [...new Set([...hardAfter, ...dsFail])];
    console.log(`  结果: hardFail=${hardAfter.length} dsFail=${dsFail.size} nextPending=${pending.length}`);

    verifyLog.rounds.push({
      round,
      shortened,
      hardFail: hardAfter.length,
      dsFail: dsFail.size,
      stillTodo: pending.length
    });
    fs.writeFileSync(
      path.join(args.outputDir, `_checkpoint_r${round}.json`),
      JSON.stringify(
        {
          round,
          shortened,
          hardFail: hardAfter.length,
          dsFail: dsFail.size,
          stillTodo: pending.length
        },
        null,
        2
      ),
      'utf8'
    );

    if (pending.length === 0) {
      console.log(`  ✅ 全清`);
      break;
    }
  }

  // 最终截断兜底（仍超字节）
  let truncateCount = 0;
  for (let i = 0; i < rows.length; i++) {
    let ru = String(rows[i][args.targetCol] || '');
    if (utf8Len(ru) > args.byteLimit) {
      ru = truncateUtf8Boundary(ru, args.byteLimit);
      rows[i][args.targetCol] = ru;
      appendNote(rows[i], 'truncate_fallback');
      truncateCount += 1;
    }
    const gate = validateRuCompressHard(rows[i][args.targetCol], rows[i][args.sourceCol], args.byteLimit);
    if (gate.text !== String(rows[i][args.targetCol] || '')) {
      rows[i][args.targetCol] = gate.text;
    }
  }

  const unified = unifyByZh(rows, args);
  console.log(`\n同词条统一最短合规俄文: ${unified} 行；截断兜底: ${truncateCount}`);

  // 截断后再整表验一次（仍一头）
  if (verifyWorker && truncateCount > 0) {
    console.log(`截断后整表合并复验...`);
    const allIdxs = rows.map((_, i) => i).filter((i) => String(rows[i][args.targetCol] || '').trim());
    const verdicts = await verifyMega(allIdxs, rows, args, verifyWorker);
    deepseekFailNotes = 0;
    for (let j = 0; j < allIdxs.length; j++) {
      if (!verdicts[j] || !verdicts[j].ok) {
        deepseekFailNotes += 1;
        appendNote(rows[allIdxs[j]], `ds_fail:${(verdicts[j] && verdicts[j].reason) || 'fail'}`);
      }
    }
  }

  const stillOver = [];
  const cjkInRu = [];
  const residualEn = [];
  const glossParen = [];
  for (let i = 0; i < rows.length; i++) {
    const g = validateRuCompressHard(rows[i][args.targetCol], rows[i][args.sourceCol], args.byteLimit);
    if (g.issues.some((x) => x.startsWith('over_bytes'))) stillOver.push(i + 2);
    if (g.issues.includes('cjk_in_ru')) cjkInRu.push(i + 2);
    if (g.issues.some((x) => x.startsWith('residual_en'))) residualEn.push(i + 2);
    if (g.issues.includes('gloss_paren')) glossParen.push(i + 2);
    if (g.ok) rows[i][args.targetCol] = g.text;
  }

  const dsFailed =
    deepseekFailNotes || rows.filter((r) => String(r[COL_NOTE] || '').includes('ds_fail')).length;
  verifyLog.final = {
    stillOver: stillOver.length,
    stillOverRows: stillOver.slice(0, 40),
    cjkInRu: cjkInRu.length,
    residualEn: residualEn.length,
    glossParen: glossParen.length,
    truncateFallback: truncateCount,
    deepseekFailNotes: dsFailed,
    maxBytesAfter: Math.max(0, ...rows.map((r) => utf8Len(r[args.targetCol])))
  };
  verifyLog.recommendDeliver =
    stillOver.length === 0 &&
    cjkInRu.length === 0 &&
    residualEn.length === 0 &&
    glossParen.length === 0 &&
    !!verifyWorker &&
    !args.skipDeepseekVerify &&
    dsFailed === 0;
  const base = path.basename(abs, path.extname(abs));
  const outXlsx = path.join(args.outputDir, `${base}_已压63.xlsx`);
  const outCsv = path.join(args.outputDir, `${base}_已压63.csv`);
  const outJson = path.join(args.outputDir, 'excel-compress-verify.json');

  writeXlsxPreviewFile(outXlsx, headers, rows);
  writeCsv(outCsv, headers, rows);
  fs.writeFileSync(outJson, JSON.stringify(verifyLog, null, 2), 'utf8');

  if (args.inPlace) {
    const backup = abs.replace(/\.xlsx$/i, '_preCompress63.xlsx');
    if (!fs.existsSync(backup)) {
      fs.copyFileSync(abs, backup);
      console.log(`备份: ${backup}`);
    }
    fs.copyFileSync(outXlsx, abs);
    console.log(`已写回: ${abs}`);
  }

  console.log(`\n写出: ${outXlsx}`);
  console.log(`写出: ${outCsv}`);
  console.log(`验证: ${outJson}`);
  console.log(
    `stillOver=${stillOver.length} cjk=${cjkInRu.length} residualEn=${residualEn.length} gloss=${glossParen.length} recommendDeliver=${verifyLog.recommendDeliver}`
  );

  if (stillOver.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
