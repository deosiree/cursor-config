#!/usr/bin/env node
/**
 * Post-translate acceptance: placeholder parity, no dirty writes, NL restore, anti-misalign vs baseline,
 * en2ru quality (CJK / nl parity / gloss paren / echo / suspect misalign).
 *
 * Usage:
 *   node scripts/verify-post-translate.js --out path/to/*_RU机翻.xlsx --baseline path/to/baseline-bad.json
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const {
  extractPlaceholders,
  validateTranslation,
  validateEn2RuNotEcho,
  validateEn2RuQuality,
  BATCH_NL_TOKEN,
  hasEnglishGlossParen,
  extractResidualEnglishSpans,
  countNewlines,
  isSuspectEn2RuMisalign
} = require('../translateCsv.js');

function parseArgs(argv) {
  const out = {
    out: '',
    baseline: '',
    sourceCol: '英文翻译',
    targetCol: '俄文翻译',
    stage: 'en2ru',
    decisions: '',
    requireSemanticLoop: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out.out = argv[++i];
    else if (a === '--baseline') out.baseline = argv[++i];
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
    else if (a === '--targetCol') out.targetCol = argv[++i];
    else if (a === '--stage') out.stage = argv[++i];
    else if (a === '--decisions') out.decisions = argv[++i];
    else if (a === '--require-semantic-loop') out.requireSemanticLoop = true;
  }
  return out;
}

function loadRows(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error('file not found: ' + abs);
  if (/\.xlsx?$/i.test(abs)) {
    const wb = XLSX.readFile(abs);
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  }
  const wb = XLSX.readFile(abs, { type: 'file', raw: false });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
}

function norm(s) {
  return String(s || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function looksLike(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 12 && y.includes(x.slice(0, Math.min(40, x.length)))) return true;
  if (y.length >= 12 && x.includes(y.slice(0, Math.min(40, y.length)))) return true;
  return false;
}

/**
 * 扫描硬门禁失败行（供 remediate 复用）
 * @param {Array<object>} rows
 * @param {{ sourceCol?: string, targetCol?: string, stage?: string, baseline?: Array, decisions?: object|null }} [opts]
 */
function scanEn2RuAcceptance(rows, opts = {}) {
  const sourceCol = opts.sourceCol || '英文翻译';
  const targetCol = opts.targetCol || '俄文翻译';
  const stage = opts.stage || 'en2ru';
  const baseline = opts.baseline || [];
  const decisions = opts.decisions || null;
  const badById = Object.fromEntries((baseline || []).map((b) => [b.id, b]));

  const report = {
    pass: true,
    total: rows.length,
    filled: 0,
    empty: 0,
    placeholderFails: [],
    dirtyWrites: [],
    residualNlTokens: [],
    stillLooksMisaligned: [],
    enEchoFails: [],
    englishGlossParens: [],
    cjkInRu: [],
    nlParityFails: [],
    suspectMisalign: [],
    qualityFails: [],
    mixedLatinInRu: [],
    failIds: [],
    recommendDeliver: false,
    semanticLoopDone: opts.semanticLoopDone === true
  };

  const failSet = new Set();

  for (const r of rows) {
    const id = String(r.id || '');
    const src = String(r[sourceCol] || r['词条'] || '');
    const tgt = String(r[targetCol] || '');
    const note = String(r['备注1'] || '');
    const hasFailNote = /翻译验证失败/.test(note);

    if (!norm(tgt)) {
      report.empty += 1;
    } else {
      report.filled += 1;
    }

    if (tgt && (tgt.includes(BATCH_NL_TOKEN) || /⟦\s*__NL__\s*⟧/.test(tgt) || tgt.includes('__NL__'))) {
      report.residualNlTokens.push(id);
      failSet.add(id);
    }

    if (norm(tgt)) {
      const ph = extractPlaceholders(src);
      const v = validateTranslation(src, tgt, ph, { stage });
      if (!v.isValid) {
        report.placeholderFails.push(id);
        failSet.add(id);
      }

      if (stage === 'en2ru') {
        const echo = validateEn2RuNotEcho(src, tgt);
        if (!echo.isValid) {
          report.enEchoFails.push(id);
          failSet.add(id);
        }
        const quality = validateEn2RuQuality(src, tgt);
        if (!quality.isValid) {
          report.qualityFails.push(id);
          failSet.add(id);
          for (const issue of quality.issues) {
            if (/中日韩|中文/.test(issue)) report.cjkInRu.push(id);
            if (/换行数/.test(issue)) report.nlParityFails.push(id);
            if (/括注/.test(issue)) report.englishGlossParens.push(id);
            if (/错位/.test(issue)) report.suspectMisalign.push(id);
          }
        } else {
          if (hasEnglishGlossParen(tgt)) {
            report.englishGlossParens.push(id);
            failSet.add(id);
          }
          if (countNewlines(src) !== countNewlines(tgt)) {
            report.nlParityFails.push(id);
            failSet.add(id);
          }
          if (isSuspectEn2RuMisalign(src, tgt)) {
            report.suspectMisalign.push(id);
            failSet.add(id);
          }
        }

        const spans = extractResidualEnglishSpans(tgt);
        if (spans.length > 0) {
          report.mixedLatinInRu.push(id);
          const allKeep =
            decisions &&
            spans.every((s) => {
              const key = s.replace(/\d+$/, '').toLowerCase() || s.toLowerCase();
              const k2 = s.toLowerCase();
              const d = decisions[key] || decisions[k2];
              return d && String(d.action).toUpperCase() === 'KEEP';
            });
          // 无判定缓存且源可译拉丁较多：交由质量环处理，不单独 hard-fail mixed
          void allKeep;
        }
      }
    }

    if (hasFailNote && norm(tgt)) {
      report.dirtyWrites.push(id);
      failSet.add(id);
    }

    const bad = badById[id];
    if (bad && bad.badRu && norm(tgt) && looksLike(tgt, bad.badRu)) {
      report.stillLooksMisaligned.push(id);
      failSet.add(id);
    }
  }

  // uniq list fields that may be duplicated
  for (const key of [
    'cjkInRu',
    'nlParityFails',
    'englishGlossParens',
    'suspectMisalign',
    'enEchoFails',
    'qualityFails'
  ]) {
    report[key] = [...new Set(report[key])];
  }

  report.failIds = [...failSet].filter(Boolean);
  const hardFail =
    report.placeholderFails.length > 0 ||
    report.dirtyWrites.length > 0 ||
    report.residualNlTokens.length > 0 ||
    report.stillLooksMisaligned.length > 0 ||
    report.enEchoFails.length > 0 ||
    report.englishGlossParens.length > 0 ||
    report.cjkInRu.length > 0 ||
    report.nlParityFails.length > 0 ||
    report.suspectMisalign.length > 0 ||
    report.qualityFails.length > 0;

  report.pass = !hardFail;
  const semanticOk = !opts.requireSemanticLoop || report.semanticLoopDone === true;
  report.recommendDeliver =
    report.pass && report.empty === 0 && report.filled === report.total && semanticOk;
  return report;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.out) {
    console.error(
      'Usage: node scripts/verify-post-translate.js --out <RU文件> [--baseline baseline-bad.json] [--require-semantic-loop]'
    );
    process.exit(2);
  }

  const rows = loadRows(args.out);
  const baseline =
    args.baseline && fs.existsSync(args.baseline)
      ? JSON.parse(fs.readFileSync(args.baseline, 'utf8'))
      : [];

  let decisions = null;
  if (args.decisions && fs.existsSync(args.decisions)) {
    try {
      const raw = JSON.parse(fs.readFileSync(args.decisions, 'utf8'));
      decisions = raw.decisions || raw;
    } catch (_) {
      decisions = null;
    }
  }

  const notePath = path.join(path.dirname(path.resolve(args.out)), 'en2ru-quality-loop.json');
  const semanticLoopDone =
    fs.existsSync(notePath) &&
    (() => {
      try {
        const j = JSON.parse(fs.readFileSync(notePath, 'utf8'));
        return !!(j && j.pass === true && j.verifyModel);
      } catch (_) {
        return false;
      }
    })();

  const report = scanEn2RuAcceptance(rows, {
    sourceCol: args.sourceCol,
    targetCol: args.targetCol,
    stage: args.stage,
    baseline,
    decisions,
    requireSemanticLoop: args.requireSemanticLoop || args.stage === 'en2ru',
    semanticLoopDone
  });

  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) {
    const keys = [
      'placeholderFails',
      'dirtyWrites',
      'residualNlTokens',
      'stillLooksMisaligned',
      'enEchoFails',
      'englishGlossParens',
      'cjkInRu',
      'nlParityFails',
      'suspectMisalign'
    ];
    for (const k of keys) {
      if (report[k] && report[k].length) {
        console.error(`${k}: ${report[k].slice(0, 20).join(', ')}${report[k].length > 20 ? '…' : ''}`);
      }
    }
  }
  process.exit(report.pass ? 0 : 1);
}

module.exports = { scanEn2RuAcceptance, loadRows };

if (require.main === module) {
  main();
}
