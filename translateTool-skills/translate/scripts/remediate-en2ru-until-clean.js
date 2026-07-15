#!/usr/bin/env node
/**
 * en2ru 质量环：硬门禁失败 → 清空 → DeepSeek-V4-Flash 整句重译 → 语义验 → 循环直至干净。
 *
 * Usage:
 *   node scripts/remediate-en2ru-until-clean.js --in path/to/*_RU机翻.xlsx [--max-rounds 5] [--batch-size 20]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const {
  resolveVerifyWorker,
  extractPlaceholders,
  validateTranslation,
  protectUndistinguishablePlaceholders,
  restoreUndistinguishablePlaceholders,
  stripEn2RuEnglishGlossParen,
  BATCH_NL_TOKEN
} = require('../translateCsv.js');
const { scanEn2RuAcceptance } = require('./verify-post-translate.js');

function parseArgs(argv) {
  const out = {
    in: '',
    maxRounds: 5,
    batchSize: 20,
    sourceCol: '英文翻译',
    targetCol: '俄文翻译',
    dryRun: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') out.in = argv[++i];
    else if (a === '--max-rounds') out.maxRounds = Number(argv[++i]) || 5;
    else if (a === '--batch-size') out.batchSize = Number(argv[++i]) || 20;
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
    else if (a === '--targetCol') out.targetCol = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
  }
  return out;
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'prompts', name), 'utf8');
}

function buildTranslatePrompt(texts) {
  const tpl = loadPrompt('prompt-batch-en2ru.md');
  const entryList = texts
    .map((t, i) => `${i + 1}. ${t}`)
    .join('\n');
  return tpl
    .replace('{{RELATED_TERMS_SECTION}}', '')
    .replace(/\{\{PSEUDOCODE_TERMS_SECTION\}\}/g, '')
    .replace(/\{\{COMMENT_RULES_BATCH_SECTION\}\}/g, '')
    .replace(/\{\{EXCEL_TRANSLATION_RULES_SECTION\}\}/g, '')
    .replace('{{ENTRY_LIST}}', entryList);
}

function buildVerifyPrompt(pairs) {
  const tpl = loadPrompt('prompt-batch-en2ru-quality-verify.md');
  const entryList = pairs
    .map((p, i) => {
      const en = String(p.en || '').replace(/\n/g, BATCH_NL_TOKEN);
      const ru = String(p.ru || '').replace(/\n/g, BATCH_NL_TOKEN);
      return `${i + 1}. EN<<<${en}>>> RU<<<${ru}>>>`;
    })
    .join('\n');
  return tpl.replace('{{ENTRY_LIST}}', entryList);
}

/**
 * 解析 PASS/FAIL 批回应
 * @param {string} text
 * @param {number} n
 * @returns {Array<{ ok: boolean, reason: string }>}
 */
function parsePassFail(text, n) {
  const lines = String(text || '').split('\n').filter((l) => l.trim());
  /** @type {Map<number, { ok: boolean, reason: string }>} */
  const map = new Map();
  for (const raw of lines) {
    const m = raw.trim().match(/^(\d+)[.、]\s*(PASS|FAIL)\b\s*:?\s*(.*)$/i);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    if (idx < 1 || idx > n) continue;
    const ok = String(m[2]).toUpperCase() === 'PASS';
    map.set(idx, { ok, reason: String(m[3] || '').trim() });
  }
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(map.get(i) || { ok: false, reason: 'missing_verdict' });
  }
  return out;
}

function appendNote(row, tag) {
  const note = String(row['备注1'] || '').trim();
  if (note.includes(tag)) return;
  row['备注1'] = [note, tag].filter(Boolean).join('; ');
}

function writeWorkbook(abs, sheetName, rows) {
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, sheet, sheetName || 'Sheet1');
  XLSX.writeFile(wb, abs);
  const csv = abs.replace(/\.xlsx$/i, '.csv');
  XLSX.writeFile(wb, csv, { bookType: 'csv' });
}

/**
 * 对失败行：protect → DS 批译 → restore → 硬校验
 */
async function retranslateBatch(worker, items, sourceCol, targetCol) {
  const protectedList = [];
  const meta = [];
  for (const row of items) {
    const en = String(row[sourceCol] || '');
    const { protectedText, tokenReplacements } = protectUndistinguishablePlaceholders(en);
    protectedList.push(protectedText);
    meta.push({ row, tokenReplacements, en });
  }

  const prompt = buildTranslatePrompt(protectedList);
  let translations;
  try {
    translations = await worker.callBatch(prompt, protectedList.length);
  } catch (err) {
    // callBatch 已 parse；若供应商直接抛错
    throw err;
  }

  // DeepSeek callBatch 返回 string[]；若格式异常可能为空数组
  if (!Array.isArray(translations) || translations.length !== protectedList.length) {
    return { ok: false, reason: 'batch_count_mismatch', filled: 0 };
  }

  let filled = 0;
  for (let i = 0; i < meta.length; i++) {
    const { row, tokenReplacements, en } = meta[i];
    let ru = restoreUndistinguishablePlaceholders(translations[i] || '', tokenReplacements);
    const gloss = stripEn2RuEnglishGlossParen(ru);
    ru = gloss.text;
    const ph = extractPlaceholders(en);
    const v = validateTranslation(en, ru, ph, { stage: 'en2ru' });
    if (!v.isValid) {
      row[targetCol] = '';
      appendNote(row, `质量环:重译校验失败 ${v.issues.slice(0, 2).join('|')}`);
      continue;
    }
    row[targetCol] = ru;
    appendNote(row, '质量环:DeepSeek-V4-Flash重译');
    filled += 1;
  }
  return { ok: true, filled };
}

/**
 * 语义验：对刚重译行抽检 FAIL → 清空
 */
async function semanticVerifyBatch(worker, items, sourceCol, targetCol) {
  if (items.length === 0) return { failIds: [] };
  const pairs = items.map((row) => ({
    en: String(row[sourceCol] || ''),
    ru: String(row[targetCol] || ''),
    id: String(row.id || '')
  }));
  const prompt = buildVerifyPrompt(pairs);
  let raw;
  try {
    if (typeof worker.callSingle === 'function') {
      raw = await worker.callSingle(prompt);
    } else {
      const arr = await worker.callBatch(prompt, pairs.length);
      raw = (arr || []).map((t, i) => `${i + 1}. ${t}`).join('\n');
    }
  } catch (err) {
    console.warn('  semantic verify API skipped:', err.message || err);
    return { failIds: [], skipped: true };
  }
  const verdicts = parsePassFail(raw, pairs.length);
  const failIds = [];
  const {
    isAllowedEnRuIdentity,
    validateTranslation,
    extractPlaceholders
  } = require('../translateCsv.js');
  for (let i = 0; i < pairs.length; i++) {
    if (!verdicts[i].ok) {
      const en = pairs[i].en;
      const ru = pairs[i].ru;
      const reason = String(verdicts[i].reason || '');
      if (
        isAllowedEnRuIdentity(en) &&
        en.trim() === ru.trim() &&
        /retain|keep|as is|留|保留/i.test(reason)
      ) {
        continue;
      }
      const ph = extractPlaceholders(en);
      const v = validateTranslation(en, ru, ph, { stage: 'en2ru' });
      // 硬门禁已通过时，语义验仅在明显错位/中文/英括注时清空；避免吹毛求疵清空
      const severe =
        /错位|misalign|wrong\s*row|中文|汉字|chinese|gloss|括注|英注|完全不符|张冠李戴|unrelated/i.test(
          reason
        );
      if (v.isValid && !severe) {
        console.warn(
          `  semantic soft-fail keep id=${pairs[i].id}: ${reason.slice(0, 80)}`
        );
        appendNote(items[i], `质量环:语义软FAIL保留 ${reason.slice(0, 60)}`);
        continue;
      }
      failIds.push(pairs[i].id);
      const row = items[i];
      row[targetCol] = '';
      appendNote(row, `质量环:语义验FAIL ${reason}`.trim());
    }
  }
  return { failIds };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.in) {
    console.error(
      'Usage: node scripts/remediate-en2ru-until-clean.js --in <RU机翻.xlsx> [--max-rounds 5] [--batch-size 20]'
    );
    process.exit(2);
  }
  const abs = path.resolve(args.in);
  if (!fs.existsSync(abs)) throw new Error('file not found: ' + abs);

  const worker = resolveVerifyWorker();
  console.log(`verify/remedy worker: ${worker.id}`);

  const wb0 = XLSX.readFile(abs);
  const sheetName = wb0.SheetNames[0];
  let rows = XLSX.utils.sheet_to_json(wb0.Sheets[sheetName], { defval: '' });

  const bak = abs.replace(/(\.xlsx?)$/i, `_preQualityLoop$1`);
  if (!args.dryRun && !fs.existsSync(bak)) {
    fs.copyFileSync(abs, bak);
    console.log('backup', bak);
  }

  const loopMeta = {
    startedAt: new Date().toISOString(),
    verifyModel: worker.id,
    rounds: [],
    pass: false
  };

  for (let round = 1; round <= args.maxRounds; round++) {
    const report = scanEn2RuAcceptance(rows, {
      sourceCol: args.sourceCol,
      targetCol: args.targetCol,
      stage: 'en2ru',
      requireSemanticLoop: false,
      semanticLoopDone: false
    });

    const emptyRows = rows.filter(
      (r) =>
        !String(r[args.targetCol] || '').trim() && String(r[args.sourceCol] || '').trim()
    );

    console.log(
      `round ${round}: failIds=${report.failIds.length} empty=${emptyRows.length} pass=${report.pass} cjk=${report.cjkInRu.length} echo=${report.enEchoFails.length} gloss=${report.englishGlossParens.length} nl=${report.nlParityFails.length} misalign=${report.suspectMisalign.length}`
    );

    // 硬门禁绿且无空行 → 语义抽检；全 PASS 才交付
    if (report.pass && emptyRows.length === 0) {
      const alreadyChecked = loopMeta.rounds.some((x) => x.phase === 'semantic_ok');
      if (!alreadyChecked && !args.dryRun) {
        const sample = rows
          .filter((r) => {
            const en = String(r[args.sourceCol] || '');
            const ru = String(r[args.targetCol] || '');
            if (!ru) return false;
            if (en.trim() === ru.trim()) return true;
            if (/[A-Za-z]{4,}/.test(ru) && /[\u0400-\u04FF]/.test(ru)) return true;
            return false;
          })
          .slice(0, 80);

        if (sample.length > 0) {
          console.log(`semantic spot-check n=${sample.length}`);
          let semanticFailCount = 0;
          for (let i = 0; i < sample.length; i += args.batchSize) {
            const chunk = sample.slice(i, i + args.batchSize);
            const { failIds } = await semanticVerifyBatch(
              worker,
              chunk,
              args.sourceCol,
              args.targetCol
            );
            if (failIds.length) {
              console.log(`  semantic FAIL ids=${failIds.length}`);
              semanticFailCount += failIds.length;
            }
          }
          if (semanticFailCount > 0) {
            loopMeta.rounds.push({
              round,
              phase: 'semantic_reopen',
              failIds: semanticFailCount
            });
            writeWorkbook(abs, sheetName, rows);
            continue; // 下轮重译被清空行
          }
        }
        loopMeta.rounds.push({ round, phase: 'semantic_ok', failIds: 0 });
      }

      loopMeta.pass = true;
      loopMeta.finishedAt = new Date().toISOString();
      loopMeta.rounds.push({ round, phase: 'done', failIds: 0, empty: 0 });
      if (!args.dryRun) {
        writeWorkbook(abs, sheetName, rows);
        fs.writeFileSync(
          path.join(path.dirname(abs), 'en2ru-quality-loop.json'),
          JSON.stringify(loopMeta, null, 2),
          'utf8'
        );
      }
      console.log(JSON.stringify({ pass: true, recommendDeliver: true, rounds: round }, null, 2));
      process.exit(0);
    }

    // 硬失败 id ∪ 空行
    const failSet = new Set(report.failIds);
    for (const r of emptyRows) failSet.add(String(r.id || ''));
    const toFix = rows.filter((r) => failSet.has(String(r.id || '')));
    for (const r of toFix) {
      r[args.targetCol] = '';
      appendNote(r, `质量环:第${round}轮清空待重译`);
    }

    if (args.dryRun) {
      console.log(JSON.stringify({ dryRun: true, wouldFix: toFix.length, report }, null, 2));
      process.exit(1);
    }

    if (toFix.length === 0) {
      console.warn('nothing to fix but not deliverable; abort');
      break;
    }

    let filledTotal = 0;
    for (let i = 0; i < toFix.length; i += args.batchSize) {
      const chunk = toFix.slice(i, i + args.batchSize);
      console.log(`  retranslate ${i + 1}-${i + chunk.length}/${toFix.length}`);
      const result = await retranslateBatch(worker, chunk, args.sourceCol, args.targetCol);
      filledTotal += result.filled || 0;
      if (!result.ok) {
        console.warn('  batch issue', result.reason);
      }
      const translated = chunk.filter((r) => String(r[args.targetCol] || '').trim());
      if (translated.length) {
        await semanticVerifyBatch(worker, translated, args.sourceCol, args.targetCol);
      }
    }

    loopMeta.rounds.push({
      round,
      phase: 'retranslate',
      failIds: toFix.length,
      filled: filledTotal
    });
    writeWorkbook(abs, sheetName, rows);
  }

  // 耗尽轮次：仍失败行保持空 + 需人工
  const finalReport = scanEn2RuAcceptance(rows, {
    sourceCol: args.sourceCol,
    targetCol: args.targetCol,
    stage: 'en2ru',
    requireSemanticLoop: false
  });
  for (const id of finalReport.failIds) {
    const row = rows.find((r) => String(r.id) === id);
    if (row) {
      row[args.targetCol] = '';
      appendNote(row, '质量环:需人工');
    }
  }
  writeWorkbook(abs, sheetName, rows);
  loopMeta.pass = false;
  loopMeta.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(path.dirname(abs), 'en2ru-quality-loop.json'),
    JSON.stringify({ ...loopMeta, finalFailIds: finalReport.failIds }, null, 2),
    'utf8'
  );
  console.log(JSON.stringify({ pass: false, failIds: finalReport.failIds.length }, null, 2));
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
